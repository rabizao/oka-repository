import React from 'react';

import './global.css';

import Routes from './routes';
import { ConfigProvider } from 'react-avatar';
import { NotificationContainer } from 'react-notifications';

import LoginProvider from './contexts/LoginContext';
import RunningTasksBarProvider from './contexts/RunningTasksBarContext';

function App() {
    return (
        <div>
            <NotificationContainer />
            <RunningTasksBarProvider>
                <LoginProvider>
                    <ConfigProvider colors={['gainsboro', 'cornsilk', 'cadetblue', 'cyan', 'lavender', 'pink']}>
                        <Routes />
                    </ConfigProvider>
                </LoginProvider>
            </RunningTasksBarProvider>
        </div>
    );
}

export default App;