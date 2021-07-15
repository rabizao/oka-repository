import React, { useState, useEffect, useContext, createContext, useRef } from 'react';

import { saveAs } from 'file-saver';
// import useSound from 'use-sound';

import api from '../services/api';
import { useInterval } from '../hooks/useInterval';
import { LoginContext } from './LoginContext';
import { RunningTasksBarContext } from './RunningTasksBarContext';
import { NotificationManager } from 'react-notifications';
// import alertSound from '../assets/notification_simple-01.ogg';
import { timeStart } from '../services/auth';

export const NotificationsContext = createContext();

const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [since, setSince] = useState(timeStart);
    const [delay, setDelay] = useState(10000);
    const [notificationsBadgeCount, setNotificationsBadgeCount] = useState(0);
    const [messagesBadgeCount, setMessagesBadgeCount] = useState(0);
    // const [notifyNewMessage, setNotifyNewMessage] = useState(0);
    const loggedUser = useContext(LoginContext);
    const runningTasksBar = useContext(RunningTasksBarContext);
    const isWaitingDownload = useRef(false);
    // const [playAlertSound] = useSound(alertSound);
    // messages between users disabled. To enable you have pro uncomment 
    // items and propagate notifyNewMessage in NotificationsContext.Provider


    async function repeat() {
        var newNotifications = [...notifications];
        var newTasks = { ...runningTasksBar.tasks };
        try {
            const response = await api.get(`notifications?since=${since}`);
            var data = [...response.data]
            setSince(data[data.length - 1].timestamp)
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
                            if (!(since === timeStart)) {
                                if (payload.state === 'FAILURE') {
                                    NotificationManager.error(`There was an error with your request. Please try again later. Exception: ${payload.status}`, "Task", 8000)
                                } else {
                                    if (payload.task_name === 'download_data') {
                                        if (isWaitingDownload.current === true) {
                                            const r = await api.get(`downloads/data?name=${JSON.parse(payload.result)}`, { responseType: 'blob' });
                                            saveAs(r.data, JSON.parse(payload.result));
                                            isWaitingDownload.current = false;
                                        }
                                    } else if (payload.task_name === 'run_step') {
                                        NotificationManager.success(`Your simulation has just finished.`, "Run", 8000)
                                    } else if (payload.task_name === 'process_file') {

                                    } else {
                                        NotificationManager.success(`Your task has just finished.`, "NoName", 8000)
                                    }
                                }
                            }
                            delete newTasks[payload.task_id]
                        }
                    } else if (notificationName === "data_uploaded") {
                        if (!(since === timeStart)) {
                            if (payload["code"] === "success") {
                                NotificationManager.success(payload["message"], `${payload['original_name']}`, 10000);
                                loggedUser.setRenderFeed(loggedUser.renderFeed + 1)
                            } else {
                                NotificationManager.error(payload["message"], `${payload['original_name']}`, 10000);
                            }
                        }
                        newNotifications.push(notification);
                    } else if (notificationName === "unread_notification_count") {
                        setNotificationsBadgeCount(payload);
                    }
                    // else if (notificationName === "unread_message_count") {
                    //     setMessagesBadgeCount(payload);
                    //     if (payload > 0 && !(since === timeStart)) {
                    //         setNotifyNewMessage(notifyNewMessage + 1);
                    //         playAlertSound();
                    //     }
                    // }
                }
                setNotifications(newNotifications);
                runningTasksBar.setTasks(newTasks);
                if (Object.keys(newTasks).length === 0) {
                    setDelay(10000);
                }
            }
        } catch (error) {
            // Do nothing
        }
    }

    useEffect(() => {
        if (loggedUser.logged) {
            repeat();
        }
        // eslint-disable-next-line
    }, [loggedUser.logged])

    useInterval(repeat, delay, loggedUser.logged);

    return (
        <NotificationsContext.Provider value={{ notifications, setNotifications, delay, setDelay, notificationsBadgeCount, setNotificationsBadgeCount, messagesBadgeCount, setMessagesBadgeCount, setSince, isWaitingDownload }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export default NotificationsProvider;