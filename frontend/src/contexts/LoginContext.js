import React, { useState, createContext } from 'react';
import { isAuthenticated } from '../services/auth'

export const LoginContext = createContext();

const LoginProvider = ({ children }) => {
    const [logged, setLogged] = useState(isAuthenticated());

    return (
        <LoginContext.Provider value={{ logged, setLogged }}>
            {children}
        </LoginContext.Provider>
    )
}

export default LoginProvider;