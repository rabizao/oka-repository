
import React, { useContext } from 'react'

import { Redirect, Route } from 'react-router-dom'
import { LoginContext } from '../../contexts/LoginContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
    const context = useContext(LoginContext);

    return (
        <Route
            {...rest}
            render={props =>
                context.logged ? (
                    <Component {...props} />
                ) : (
                        <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                    )
            }
        />
    )
}

export default PrivateRoute