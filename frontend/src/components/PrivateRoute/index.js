
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { LoginContext } from '../../contexts/LoginContext';
import RunningTasksBar from '../../components/RunningTasksBar';


const PrivateRoute = () => {
    const loggedUser = useContext(LoginContext);
    return loggedUser.logged ? <><RunningTasksBar /><Outlet /></> : <Navigate to="/login" />;
}


export default PrivateRoute