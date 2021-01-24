import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import queryString from 'query-string';

import './styles.css';

import api from '../../services/api';
import { notifyError } from '../../utils';
import { NotificationManager } from 'react-notifications';

export default function AccountRecoverSubmit() {
    let location = useLocation();
    const key = queryString.parse(location.search).key
    const username = queryString.parse(location.search).username
    const confirm = queryString.parse(location.search).confirm || true
    const [success, setSuccess] = useState(false);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                await api.post(`users/${username}/confirm-email?${key ? `key=${key}` : ''}&confirm=${confirm}`);
                setSuccess(true);
                if (confirm) {
                    NotificationManager.success("Email successfully confirmed.", "email", 4000);
                } else {
                    NotificationManager.success("Email successfully removed from our database.", "email", 4000);
                }
            } catch (error) {
                notifyError(error);
                setSuccess(false);
            } finally {
                setFinished(true);
            }
        }

        fetchData()
    }, [username, key, confirm])

    return (
        <>
            {
                finished && (
                    confirm ? (
                        success ?
                            <Redirect to="/login" /> :
                            <Redirect to="/confirmation/resend" />
                    ) :
                        success ?
                            <Redirect to="/" /> :
                            <Redirect to="/confirmation/resend" />
                )
            }
        </>
    )
}