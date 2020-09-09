import React, { useState, createContext } from 'react';
import { isAuthenticated, getUserUsername, getUserId, getUserName } from '../services/auth';

export const LoginContext = createContext();

const LoginProvider = ({ children }) => {
    const [logged, setLogged] = useState(isAuthenticated());    
    const username = getUserUsername();
    const id = getUserId();
    const name = getUserName();

    return (
        <LoginContext.Provider value={{ logged, setLogged, id, username, name }}>
            {children}
        </LoginContext.Provider>
    )
}

export default LoginProvider;