import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LoginProvider from './contexts/LoginContext';
import PrivateRoute from './components/PrivateRoute';

import Index from './pages/Index';
import Home from './pages/Home';
import Search from './pages/Search';
import Upload from './pages/Upload';
import DatasetsDescription from './pages/Datasets/Description';
import DatasetsVisualize from './pages/Datasets/Visualize';
import DatasetsComments from './pages/Datasets/Comments';
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
                    <PrivateRoute path="/datasets/:uuid/description/" component={DatasetsDescription} />
                    <PrivateRoute path="/datasets/:uuid/visualize/" component={DatasetsVisualize} />
                    <PrivateRoute path="/datasets/:uuid/comments/" component={DatasetsComments} />
                    <PrivateRoute path="/upload" component={Upload} />
                </LoginProvider>
            </Switch>
        </BrowserRouter>
    );
}

