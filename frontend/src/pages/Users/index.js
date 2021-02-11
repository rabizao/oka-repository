import React, { useState, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import './styles.css';

import Avatar from 'react-avatar';
import { CircularProgress } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaPostsBox from '../../components/OkaPostsBox';
import OkaMessagesBox from '../../components/OkaMessagesBox';
import OkaConversationBox from '../../components/OkaConversationBox';
import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';
import queryString from 'query-string';
import { notifyError } from '../../utils';
import { NotificationManager } from 'react-notifications';
import OkaProfileBox from '../../components/OkaProfileBox';

export default function Users(props) {
    const location = useLocation()
    const username = props.match.params.username;
    const section = props.match.params.section ? props.match.params.section : "empty";
    const [parsedQueries, setParsedQueries] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [render, setRender] = useState(0);
    const [user, setUser] = useState({});
    const [openEdit, setOpenEdit] = useState(false);
    const [openMessage, setOpenMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [about_me, setAbout_me] = useState('');
    const [password, setPassword] = useState('');
    const [nameEdit, setNameEdit] = useState('');
    const [about_meEdit, setAbout_meEdit] = useState('');
    const history = useHistory();

    const loggedUser = useContext(LoginContext);

    const textBox = (text) => {
        return (
            <div className="content-box margin-very-small">
                {loading ?
                    <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :

                    error ?
                        <div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
                            <div className="margin-sides-verysmall">Problem loading, try to </div>
                            <button className="button-primary" onClick={handleReload}>Reload</button>
                        </div> :

                        <div className="flex-row padding-sides-small padding-vertical-small text-box">
                            {text}
                        </div>

                }
            </div>
        )
    }

    const navItems = {
        empty: {
            "name": "empty",
            "url": "/users/" + username,
            "content": <></>,
            "hide": true
        },
        uploads: {
            "name": "Uploads",
            "url": "/users/" + username + "/uploads",
            "content": <OkaPostsBox fetch_url={"/users/" + username + "/posts?" + queryString.stringify(parsedQueries)} />
        },
        favorites: {
            "name": "Favorites",
            "private": true,
            "url": "/users/" + username + "/favorites",
            "content": <OkaPostsBox fetch_url={"/users/" + username + "/favorites?" + queryString.stringify(parsedQueries)} />
        },
        messages: {
            "name": "Messages",
            "private": true,
            "url": "/users/" + username + "/messages",
            "content": <OkaMessagesBox />
        },
        following: {
            "name": "Following",
            "url": "/users/" + username + "/following",
            "content": <OkaProfileBox fetch_url={"/users/" + username + "/following?" + queryString.stringify(parsedQueries)} />
        },
        followers: {
            "name": "Followers",
            "url": "/users/" + username + "/followers",
            "content": <OkaProfileBox fetch_url={"/users/" + username + "/followers?" + queryString.stringify(parsedQueries)} />
        },
        conversation: {
            "name": "Convesation",
            "private": true,
            "hide": true,
            "url": "/users/" + username + "/conversation",
            "content": <OkaConversationBox />
        }
    }

    useEffect(() => {
        setParsedQueries(queryString.parse(location.search));
    }, [location.search])

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await api.get(`users/${username}`);
                setUser(response.data);
                setName(response.data.name);
                setAbout_me(response.data.about_me ? response.data.about_me : '');
                setError(false);
            } catch (error) {
                notifyError(error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [username, render])

    async function handleFollow() {
        var newUser = { ...user };
        try {
            await api.post(`users/${username}/follow`);
            if (user.followers.includes(loggedUser.id)) {
                newUser.followers = newUser.followers.filter(item => item !== loggedUser.id)
            } else {
                newUser.followers.push(loggedUser.id)
            }
        } catch (error) {
            notifyError(error);
        }
        setUser(newUser);
    }

    async function handleEditSubmit(e) {
        e.preventDefault()
        const data = {
            name: nameEdit,
            about_me: about_meEdit,
            password: password
        }
        if (data.password === '') {
            delete data["password"]
        }
        try {
            await api.put(`users/${username}`, data);
            setOpenEdit(false);
            setName(nameEdit);
            setAbout_me(about_meEdit);
        } catch (error) {
            notifyError(error);
        }
    }

    async function handleMessageSubmit(e) {
        e.preventDefault()
        const data = {
            body: message
        }
        try {
            await api.post(`messages/${user.username}`, data);
            setOpenMessage(false);
            setMessage('');
            NotificationManager.success("Message sent. Click here to follow the conversation", "Sent", 4000, () => { history.push(`/users/${username}/conversation/${user.username}`) })
        } catch (error) {
            notifyError(error);
        }
    }

    function handleOpenEdit() {
        setOpenEdit(true);
        setNameEdit(name);
        setAbout_meEdit(about_me);
    }

    function handleReload() {
        setRender(render + 1);
        setLoading(true);
    }

    return (
        <>
            <Modal
                open={openEdit}
                onClose={() => setOpenEdit(false)}
            >
                <div className="modal padding-big">
                    <h3 className="margin-top-small">Update your data</h3>
                    <form className="form flex-column margin-top-small" onSubmit={e => handleEditSubmit(e)}>
                        <div className="flex-row flex-axis-center flex-space-between">
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                placeholder="Your name"
                                value={nameEdit}
                                autoComplete="new-password"
                                onChange={e => setNameEdit(e.target.value)}
                            />
                        </div>
                        <div className="flex-row flex-axis-center flex-space-between">
                            <label htmlFor="about">About</label>
                            <input
                                id="about"
                                placeholder="Your position"
                                value={about_meEdit}
                                autoComplete="new-password"
                                onChange={e => setAbout_meEdit(e.target.value)}
                            />
                        </div>
                        <div className="flex-row flex-axis-center flex-space-between">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                autoComplete="new-password"
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <button className="button-primary" type="submit">Save</button>
                    </form>
                </div>
            </Modal>
            <Modal
                open={openMessage}
                onClose={() => setOpenMessage(false)}
            >
                <div className="modal padding-big">
                    <h3 className="margin-top-small">{`Send a message to ${user.name}`}</h3>
                    <form className="form flex-column margin-top-small" onSubmit={e => handleMessageSubmit(e)}>
                        <textarea
                            placeholder="Message"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                        <button className="button-primary" type="submit">Send</button>
                    </form>
                </div>
            </Modal>
            <OkaHeader />
            <div className="flex-column flex-axis-center oka-hero-background padding-sides-small padding-top-big">
                {loading ?
                    <CircularProgress className="icon-tertiary" /> :
                    error ?
                        <div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
                            <div className="margin-sides-verysmall color-tertiary">Problem loading, try to </div>
                            <button className="button-secondary" onClick={handleReload}>Reload</button>
                        </div> :
                        <div className="flex-column flex-axis-center padding-medium width-smallest">
                            <Avatar name={user.name} size="80" round={true} />
                            <h1 className="color-tertiary margin-top-medium width100 ellipsis text-center">{name}</h1>
                            <h5 className="color-tertiary margin-top-very-small width100 ellipsis text-center">@{username}</h5>
                            <h5 className="color-tertiary margin-top-very-small width100 ellipsis text-center">{about_me}</h5>
                            <h6 className="color-tertiary margin-top-small width100 ellipsis text-center">{user.followed && user.followed.length} following | {user.followers && user.followers.length} followers</h6>

                            {(user.id === loggedUser.id) ?
                                <div className="flex-row flex-axis-center margin-top-small">
                                    <button onClick={handleOpenEdit} className="button-secondary">Edit</button>
                                </div> :
                                <div>
                                    <button onClick={handleFollow} className="button-secondary margin-very-small">{user.followers && user.followers.includes(loggedUser.id) ? "Unfollow" : "Follow"}</button>
                                    <button onClick={() => setOpenMessage(true)} className="button-secondary margin-very-small">Message</button>
                                </div>
                            }
                        </div>
                }

            </div>
            <OkaNavBar shownUserId={user.id} navItems={navItems} />
            <div className="margin-bottom-huge">{section in navItems ? navItems[section].content : textBox("Section not found.")}</div>
        </>
    )
}