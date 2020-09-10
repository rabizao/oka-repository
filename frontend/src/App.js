import React from 'react';

import './global.css';

import Routes from './routes';
import { ConfigProvider } from 'react-avatar';
import { NotificationContainer } from 'react-notifications';

import LoginProvider from './contexts/LoginContext';
import RunningTasksBarProvider from './contexts/RunningTasksBarContext';
import SessionProvider from './contexts/SessionContext';

function App() {
    return (
        <div>
            <NotificationContainer />
            <RunningTasksBarProvider>
                <SessionProvider>
                    <LoginProvider>
                        <ConfigProvider colors={['gainsboro', 'cornsilk', 'cadetblue', 'cyan', 'lavender', 'pink']}>
                            <Routes />
                        </ConfigProvider>
                    </LoginProvider>
                </SessionProvider>
            </RunningTasksBarProvider>
        </div>
    );
}

export default App;