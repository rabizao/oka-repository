import React, { useState, useEffect, createContext } from 'react';

import api from '../services/api';
import { useInterval } from '../hooks/useInterval'
export const NotificationsContext = createContext();

const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [since, setSince] = useState(0);

    async function repeat() {
        let newNotifications = [...notifications];
        try {
            const response = await api.get(`notifications?since=${since}`);
            var notificationsResponse = [...response.data]
            if (notificationsResponse.length > 0) {
                for (var i = 0; i < notificationsResponse.length; i++) {
                    newNotifications.push(notificationsResponse[i]);
                    notificationsResponse[i].payload_json = JSON.parse(notificationsResponse[i].payload_json);
                }
                setSince(newNotifications[newNotifications.length - 1].timestamp)
                setNotifications(newNotifications);
            }
        } catch (error) {
        }
    }

    useEffect(() => {
        repeat();
        // eslint-disable-next-line
    }, [])

    useInterval(repeat, 10000);

    return (
        <NotificationsContext.Provider value={{ notifications }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export default NotificationsProvider;