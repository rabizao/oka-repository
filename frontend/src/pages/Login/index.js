import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';

import './styles.css';

import { LoginContext } from '../../contexts/LoginContext';
import api from '../../services/api';
import { notifyError } from '../../utils';

export default function Login() {
    const history = useHistory();

    const loginContext = useContext(LoginContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const data = {
            username: username,
            password: password
        }

        try {
            const response = await api.post('auth/login', data);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            localStorage.setItem('id', response.data.id);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('name', response.data.name);
            loginContext.setLogged(true);
            history.push('/home');
        } catch (error) {
            notifyError(error);
        }
    }

    return (
        <>
            <div className="margin-top-big flex-column flex-axis-center">
                <h1><Link to="/home">Oka</Link></h1>
                <h6 className="margin-top-small">Please fill in your data</h6>
                <form className="form flex-column content-box margin-very-small margin-top-small" onSubmit={handleSubmit}>
                    <input
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="button-primary" type="submit">Login</button>
                </form>
                <h6 className="margin-top-small">Not registered? <Link className="link-underline" to="/register">Register now!</Link></h6>
                <h6 className="margin-top-small">Lost account name or password? <Link className="link-underline" to="/recover">Recover now!</Link></h6>
            </div>
        </>
    )
}