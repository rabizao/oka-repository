import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import './styles.css';

import api from '../../services/api';
import { notifyError } from '../../utils';

export default function Register() {
    const history = useHistory();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const data = {
            name: name,
            email: email,
            username: username,
            password: password
        }

        try {
            await api.post('users', data);
            history.push('/login');
        } catch (error) {
            notifyError(error);
        }
    }

    return (
        <div className="margin-top-big flex-column flex-axis-center">
            <h1><Link to="/home">Oka</Link></h1>
            <h6 className="margin-top-small">Please fill in your data</h6>
            <form className="form flex-column content-box margin-very-small" onSubmit={handleSubmit}>
                <input
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
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
                <button className="button-primary" type="submit">Register</button>
            </form>
            <h6 className="margin-top-small">Already registered? <Link className="link-underline" to="/login">Login now!</Link></h6>
        </div>
    )
}