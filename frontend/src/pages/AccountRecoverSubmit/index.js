import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import { Link, useHistory, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { notifyError } from '../../utils';
import queryString from 'query-string';

import './styles.css';

export default function AccountRecoverSubmit() {
    const history = useHistory();
    let location = useLocation();
    const key = queryString.parse(location.search).key
    const username = queryString.parse(location.search).username
    const [password, setPassword] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            username: username,
            password: password,
            key: key
        }

        try {
            await api.put('users/recover/account', data);
            NotificationManager.success(`Password successfully changed.`, "Success", 8000)
            history.push('/login');
        } catch (error) {
            notifyError(error);
        }
    }

    return (
        <div className="margin-top-big flex-column flex-axis-center">
            <h1><Link to="/home">Oka</Link></h1>
            <h6 className="margin-top-small max-width-very-huge">Set your new password.</h6>
            <form className="form flex-column content-box margin-very-very-small margin-top-small" onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button className="button-primary" type="submit">Send</button>
            </form>
            <h6 className="margin-top-small"><Link className="link-underline" to="/login">Login instead</Link></h6>
        </div>
    )
}