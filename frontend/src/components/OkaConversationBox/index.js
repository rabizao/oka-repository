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

export default function OkaConversationBox() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [replyUser, setReplyUser] = useState({})
    const replyTo = location.pathname.split('/')[location.pathname.split('/').length - 1]
    const loggedUser = useContext(LoginContext);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`messages/${replyTo}/conversation`);
                const resp2 = await api.get(`users/${replyTo}`)
                setMessages(response.data);
                setReplyUser(resp2.data)
                setLoading(false);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchData();
    }, [])

    async function handleSubmitMessage(e) {
        e.preventDefault();

        const data = {
            body: newMessage
        }

        try {
            const response = await api.post(`messages/${replyUser.username}`, data);
            const newMessages = [...messages];
            newMessages.push(response.data);
            setMessages(newMessages);
        } catch (error) {
            notifyError(error);
        }
        setNewMessage('');
    }

    return (
        <div className="content-box margin-very-small padding-bottom-big">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                <>
                    {messages.length > 0 &&
                        <div className="flex-row padding-medium flex-axis-center">
                            <Link to={`/users/${loggedUser.username}/messages`}><ArrowBack /></Link>
                            <div className="padding-left-small">
                                <Avatar name={replyUser.name} size="40" round={true} />
                            </div>
                            <span className="padding-left-very-small">{replyUser.name}</span>
                        </div>
                    }

                    <ul className="content-list">
                        {messages.map((message) =>
                            <li key={message.id}>
                                <div className={`flex-row padding-very-small ${(message.author.username === loggedUser.username) && 'flex-crossaxis-end'}`}>
                                    <div className="flex-column box radius padding-small flex-axis-end">
                                        <span>{message.body}</span>                                        
                                        <h6><TimeAgo className="nowrap" datetime={message.timestamp + 'Z'} /></h6>
                                    </div>
                                </div>
                            </li>
                        )}
                    </ul>
                    <form className="margin-top-small" onSubmit={e => handleSubmitMessage(e)}>
                        <input
                            className="padding-small width100"
                            placeholder={`Reply to ${replyTo}`}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                        />
                    </form>
                </>
            }
        </div>
    )
}