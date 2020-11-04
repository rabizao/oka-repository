import React, { useState, useEffect, useContext, createContext } from 'react';

import { saveAs } from 'file-saver';

import api from '../services/api';
import { useInterval } from '../hooks/useInterval';
import { LoginContext } from './LoginContext';
import { RunningTasksBarContext } from './RunningTasksBarContext';
import { NotificationManager } from 'react-notifications';
import { downloadsUrl } from '../services/api';

export const NotificationsContext = createContext();

const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [since, setSince] = useState((new Date(Date.UTC(1970))).toISOString());
    const [delay, setDelay] = useState(10000);
    const [notificationsBadgeCount, setNotificationsBadgeCount] = useState(0);
    const loggedUser = useContext(LoginContext);
    const runningTasksBar = useContext(RunningTasksBarContext);
    const [first, setFirst] = useState(true);

    async function repeat() {
        var newNotifications = [...notifications];
        var newTasks = { ...runningTasksBar.tasks };
        try {
            const response = await api.get(`notifications?since=${since}`);
            var data = [...response.data]
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    const notification = data[i];
                    notification.payload_json = JSON.parse(notification.payload_json);
                    const payload = notification.payload_json;
                    const notificationName = notification.name.split('|')[0]
                    if (notificationName === "task_progress") {
                        if (payload.progress < 100) {
                            newTasks[payload.task_id] = {
                                progress: payload.progress,
                                description: payload.description
                            }
                            var timestampNow = (new Date()).getTime() / 1000;     
                            // Do not show progress older than 20 days because it certainly crashed
                            if (Number(notification.timestamp) < timestampNow - 3600 * 24 * 20) {
                                delete newTasks[payload.task_id]
                            }                            
                        } else {
                            if (!first) {
                                if (payload.state === 'FAILURE') {
                                    NotificationManager.error(`There was an error with your request. Please try again later. Exception: ${payload.status}`, "Task", 8000)
                                } else {
                                    if (payload.task_name === 'download_data') {
                                        saveAs(downloadsUrl + JSON.parse(payload.result), JSON.parse(payload.result));
                                    } else if (payload.task_name === 'run_step') {
                                        NotificationManager.success(`Your simulation has just finished.`, "Run", 8000)
                                    } else if (payload.task_name === 'process_data') {

                                    } else {
                                        NotificationManager.success(`Your task has just finished.`, "NoName", 8000)
                                    }
                                }
                            }
                            delete newTasks[payload.task_id]
                        }
                    } else if (notificationName === "data_uploaded") {
                        if (!first) {
                            if (payload["code"] === "success") {
                                NotificationManager.success(payload["message"], `${payload['original_name']}`, 10000);
                                loggedUser.setRenderFeed(loggedUser.renderFeed + 1)
                            } else {
                                NotificationManager.error(payload["message"], `${payload['original_name']}`, 10000);
                            }
                        }
                        newNotifications.push(notification);
                    } else if (notificationName === "unread_notification_count") {
                        setNotificationsBadgeCount(payload)
                    }
                }
                setSince(data[data.length - 1].timestamp)
                setNotifications(newNotifications);
                runningTasksBar.setTasks(newTasks);
                if (Object.keys(newTasks).length === 0) {
                    setDelay(10000);
                }
                setFirst(false);
            }
        } catch (error) {
            // Do nothing
            setFirst(true);
        }
    }

    useEffect(() => {
        if (loggedUser.logged) {
            repeat();
        }
        // eslint-disable-next-line
    }, [loggedUser.logged, first])

    useInterval(repeat, delay, loggedUser.logged);

    return (
        <NotificationsContext.Provider value={{ notifications, delay, setDelay, notificationsBadgeCount, setNotificationsBadgeCount }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export default NotificationsProvider;