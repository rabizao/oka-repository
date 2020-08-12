import React from 'react';

import './global.css';

import Routes from './routes';
import { ConfigProvider } from 'react-avatar';


function App() {

    return (
        <div>
            <ConfigProvider colors={['gainsboro', 'cornsilk', 'cadetblue', 'cyan', 'lavender', 'pink']}>
                <Routes />
            </ConfigProvider>
        </div>
    );
}

export default App;