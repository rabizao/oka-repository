import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import Index from './pages/Index';
import Home from './pages/Home';
import OkaClient from './pages/OkaClient';
import Search from './pages/Search';
import Posts from './pages/Posts';
import Users from './pages/Users';
import Register from './pages/Register';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ConfirmationSubmit from './pages/ConfirmationSubmit';
import ConfirmationResend from './pages/ConfirmationResend';
import Confirmation from './pages/Confirmation';

export default function Routes() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={Index} />
                <Route path="/register" component={Register} />
                <Route path="/login" component={Login} />
                <Route path="/confirmation/submit" component={ConfirmationSubmit} />
                <Route path="/confirmation/resend" component={ConfirmationResend} />
                <Route path="/confirmation" component={Confirmation} />
                <PrivateRoute path="/home" component={Home} />
                <PrivateRoute path="/client" component={OkaClient} />
                <PrivateRoute path="/users/:username" exact component={Users} />
                <PrivateRoute path="/users/:username/:section" component={Users} />
                <PrivateRoute path="/search/:section/" component={Search} />
                <PrivateRoute path="/posts/:id" exact component={Posts} />
                <PrivateRoute path="/posts/:id/:section/" component={Posts} />
                <Route component={NotFound} />
            </Switch>
        </BrowserRouter>
    );
}

