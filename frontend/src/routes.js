import React, { Fragment } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

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
import AccountRecover from './pages/AccountRecover';
import AccountRecoverSubmit from './pages/AccountRecoverSubmit';

export default function RoutesModule() {
    return (
        <BrowserRouter>
            <Fragment>
                <Routes>
                    <Route exact path='/' element={<PrivateRoute />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/client" element={<OkaClient />} />
                        <Route path="/users/:username" exact element={<Users />} />
                        <Route path="/users/:username/:section" element={<Users />} />
                        <Route path="/search/:section/" element={<Search />} />
                        <Route path="/posts/:id" exact element={<Posts />} />
                        <Route path="/posts/:id/:section/" element={<Posts />} />
                    </Route>
                    <Route path="/" exact element={<Index />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/confirmation/submit" element={<ConfirmationSubmit />} />
                    <Route path="/confirmation/resend" element={<ConfirmationResend />} />
                    <Route path="/confirmation" element={<Confirmation />} />
                    <Route path="/recover/submit" element={<AccountRecoverSubmit />} />
                    <Route path="/recover" element={<AccountRecover />} />
                    <Route element={<NotFound />} />
                </Routes>
            </Fragment>
        </BrowserRouter>
    );
}

