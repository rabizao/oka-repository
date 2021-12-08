import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { notifyError } from '../../utils';

import './styles.css';

export default function ConfirmationResend() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            email: email
        }

        try {
            const response = await api.post('users/recover/key', data);
            navigate({pathname: '/confirmation', state: {username: response.data.username, email: response.data.email}});
        } catch (error) {
            notifyError(error);
        }
    }

    return (
        <div className="margin-top-big flex-column flex-axis-center">
            <h1><Link to="/home">Oka</Link></h1>
            <h6 className="margin-top-small max-width-very-huge">Please write down below your email to get a new confirmation key.</h6>
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