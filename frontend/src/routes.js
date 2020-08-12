import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LoginProvider from './contexts/LoginContext';
import PrivateRoute from './components/PrivateRoute';

import Index from './pages/Index';
import Home from './pages/Home';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Datasets from './pages/Datasets';
import Users from './pages/Users';
import Register from './pages/Register';
import Login from './pages/Login';

export default function Routes() {
    return (
        <BrowserRouter>
            <Switch>
                <LoginProvider>
                    <Route path="/" exact component={Index} />
                    <PrivateRoute path="/home" component={Home} />
                    <Route path="/register" component={Register} />
                    <Route path="/login" component={Login} />
                    <PrivateRoute path="/users/:username/:section" component={Users} />
                    <PrivateRoute path="/search/:section/" component={Search} />
                    <PrivateRoute path="/datasets/:uuid/:section/" component={Datasets} />
                    <PrivateRoute path="/upload" component={Upload} />
                </LoginProvider>
            </Switch>
        </BrowserRouter>
    );
}

