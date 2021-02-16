import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import { Link, useHistory } from 'react-router-dom';
import api from '../../services/api';
import { notifyError } from '../../utils';

import './styles.css';

export default function AccountRecover() {
    const history = useHistory();
    const [email, setEmail] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            email: email
        }

        try {
            await api.post('users/recover/account', data);
            NotificationManager.success(`Please check your email for instructions.`, "Success", 8000)
            history.push('/login');
        } catch (error) {
            notifyError(error);
        }
    }

    return (
        <div className="margin-top-big flex-column flex-axis-center">
            <h1><Link to="/home">Oka</Link></h1>
            <h6 className="margin-top-small max-width-very-huge">Please write down below your email to get instructions about how to recover your account.</h6>
            <form className="form flex-column content-box margin-very-very-small margin-top-small" onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <button className="button-primary" type="submit">Send</button>
            </form>
            <h6 className="margin-top-small"><Link className="link-underline" to="/login">Login instead</Link></h6>
        </div>
    )
}