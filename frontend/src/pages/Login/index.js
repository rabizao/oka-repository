import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { NotificationManager } from 'react-notifications';

import './styles.css';

import { LoginContext } from '../../contexts/LoginContext';
import api from '../../services/api';
import socket from '../../services/socket';

export default function Register() {
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
            socket.emit('login', {username: username});
            history.push('/home');
        } catch (error) {
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("network error", "error", 4000)
            }
        }
    }

    return (
        <>
            <div className="margin-top-big flex-column flex-axis-center">

                <h1><Link to="/home">Oka</Link></h1>
                <h6 className="margin-top-small">Please fill in your data</h6>
                <form className="form flex-column content-box margin-very-small" onSubmit={handleSubmit}>
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
            </div>
        </>
    )
}