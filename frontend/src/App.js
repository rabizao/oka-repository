import React from 'react';

import './global.css';

import Routes from './routes';
import { ConfigProvider } from 'react-avatar';
import { NotificationContainer } from 'react-notifications';

import LoginProvider from './contexts/LoginContext';
import RunningTasksBarProvider from './contexts/RunningTasksBarContext';
import NotificationsProvider from './contexts/NotificationsContext';

function App() {
    return (
        <div>
            <NotificationContainer />
            <LoginProvider>
                <RunningTasksBarProvider>
                    <NotificationsProvider>
                        <ConfigProvider colors={['gainsboro', 'cornsilk', 'cadetblue', 'cyan', 'lavender', 'pink']}>
                            <Routes />
                        </ConfigProvider>
                    </NotificationsProvider>
                </RunningTasksBarProvider>
            </LoginProvider>
        </div>
    );
}

export default App;