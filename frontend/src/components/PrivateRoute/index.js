
import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';

import { LoginContext } from '../../contexts/LoginContext';
import RunningTasksBar from '../../components/RunningTasksBar';

const PrivateRoute = ({ component: Component, ...rest }) => {
    const loggedUser = useContext(LoginContext);

    return (
        <Route
            {...rest}
            render={props =>
                loggedUser.logged ? (
                    <>
                        <Component {...props} />
                        <RunningTasksBar />
                    </>
                ) : (
                        <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                    )
            }
        />
    )
}

export default PrivateRoute