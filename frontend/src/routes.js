import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import Index from './pages/Index';
import Home from './pages/Home';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Posts from './pages/Posts';
import Users from './pages/Users';
import Register from './pages/Register';
import Login from './pages/Login';

export default function Routes() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={Index} />
                <Route path="/register" component={Register} />
                <Route path="/login" component={Login} />
                <PrivateRoute path="/home" component={Home} />
                <PrivateRoute path="/users/:username/:section" component={Users} />
                <PrivateRoute path="/search/:section/" component={Search} />
                <PrivateRoute path="/posts/:id/:section/" component={Posts} />
                <PrivateRoute path="/upload" component={Upload} />
            </Switch>
        </BrowserRouter>
    );
}

