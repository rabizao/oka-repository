import React, { useState, createContext, useEffect } from 'react';
import { NotificationManager } from 'react-notifications';
import { socket } from '../services/socket';

export const SessionContext = createContext();

const SessionProvider = ({ children }) => {
    const [sid, setSid] = useState('');

    useEffect(() => {

        socket.on('connect', function () {
            setSid(socket.id);
        });

        socket.on('task_done', function (message) {
            NotificationManager.success("Your datasets were already processed and can be accessed in your account", "Finished", 10000)
        });

    }, [])

    return (
        <SessionContext.Provider value={{ sid }}>
            {children}
        </SessionContext.Provider>
    )
}

export default SessionProvider;