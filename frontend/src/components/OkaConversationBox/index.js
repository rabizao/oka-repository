import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './styles.css';

import { CircularProgress } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';

import TimeAgo from 'timeago-react';
import Avatar from 'react-avatar';

import api from '../../services/api';
import { notifyError } from '../../utils';
import { LoginContext } from '../../contexts/LoginContext';
import { NotificationsContext } from '../../contexts/NotificationsContext';

export default function OkaConversationBox() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [render, setRender] = useState(0);
    const [page, setPage] = useState();
    const [lastPage, setLastPage] = useState();
    const location = useLocation();
    const [replyUser, setReplyUser] = useState({})
    const replyTo = location.pathname.split('/')[location.pathname.split('/').length - 1]
    const loggedUser = useContext(LoginContext);
    const notificationContext = useContext(NotificationsContext);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`messages/${replyTo}/conversation`);
                const resp2 = await api.get(`users/${replyTo}`)
                const pagination = JSON.parse(response.headers['x-pagination']);
                setPage(pagination.page);
                setLastPage(pagination.last_page);
                setMessages(response.data);
                setReplyUser(resp2.data);
                setError(false);
            } catch (error) {
                notifyError(error, false);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [replyTo, notificationContext.notifyNewMessage, render])

    async function handleSubmitMessage(e) {
        e.preventDefault();

        const data = {
            body: newMessage
        }

        try {
            const response = await api.post(`messages/${replyUser.username}`, data);
            const newMessages = [...messages];
            newMessages.unshift(response.data);
            setMessages(newMessages);
        } catch (error) {
            notifyError(error);
        }
        setNewMessage('');
    }

    async function handleShowOlderMessages() {
        try {
            const response = await api.get(`messages/${replyTo}/conversation?page=${page + 1}`);
            setMessages(messages.concat(response.data));
            const pagination = JSON.parse(response.headers['x-pagination']);
            setPage(pagination.page);
            setLastPage(pagination.last_page);
        } catch (error) {
            notifyError(error);
        }
    }

    function handleReload() {
        setRender(render + 1);
        setLoading(true);
    }

    return (
        <div className="content-box margin-very-very-small padding-bottom-big">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :

                error ?
                    <div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
                        <div className="margin-sides-verysmall">Problem loading, try to </div>
                        <button className="button-primary" onClick={handleReload}>Reload</button>
                    </div> :
                    <>
                        <div className="flex-row padding-medium flex-axis-center">
                            <Link to={`/users/${loggedUser.username}/messages`}><ArrowBack /></Link>
                            <div className="padding-left-small">
                                <Avatar name={replyUser.name} size="40" round={true} />
                            </div>
                            <span className="padding-left-very-small">{replyUser.name}</span>
                        </div>

                        <div>
                            {
                                page < lastPage && (
                                    <div className="flex-row flex-crossaxis-center">
                                        <button className="button-negative" onClick={handleShowOlderMessages}>Show older</button>
                                    </div>
                                )
                            }

                            <ul className="content-list">
                                {messages.map((message) =>
                                    <li key={message.id}>
                                        <div className={`flex-row padding-very-small ${(message.author.username === loggedUser.username) && 'flex-crossaxis-end'}`}>
                                            <div className={`flex-column box radius padding-small ${(message.author.username === loggedUser.username) ? 'background-primary-color flex-axis-end' : 'background-secondary-color'}`}>
                                                <span className={`${(message.author.username === loggedUser.username) && 'color-tertiary'}`}>{message.body}</span>
                                                <h6><TimeAgo className={`nowrap ${(message.author.username === loggedUser.username) && 'color-tertiary'}`} datetime={message.timestamp + 'Z'} /></h6>
                                            </div>
                                        </div>
                                    </li>
                                ).reverse()}
                            </ul>
                        </div>
                        <form className="margin-top-small" onSubmit={e => handleSubmitMessage(e)}>
                            <input
                                className="padding-small width100"
                                placeholder={`Message to ${replyTo}`}
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                        </form>
                    </>

            }
        </div>
    )
}