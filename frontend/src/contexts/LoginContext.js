import React, { useState, createContext } from 'react';
import { isAuthenticated, getUserUsername, getUserId, getUserName, getUserGravatar } from '../services/auth';

export const LoginContext = createContext();

const LoginProvider = ({ children }) => {
    const [logged, setLogged] = useState(isAuthenticated());    
    const username = getUserUsername();
    const gravatar = getUserGravatar();
    const id = getUserId();
    const name = getUserName();
    const [renderFeed, setRenderFeed] = useState(0);

    return (
        <LoginContext.Provider value={{ logged, setLogged, id, username, name, gravatar, renderFeed, setRenderFeed }}>
            {children}
        </LoginContext.Provider>
    )
}

export default LoginProvider;