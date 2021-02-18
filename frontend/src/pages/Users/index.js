import React, { useState, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import './styles.css';

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
import Gravatar from '../../components/Gravatar';

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
    const [openAvatar, setOpenAvatar] = useState(false);
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [about_me, setAbout_me] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordRetype, setNewPasswordRetype] = useState('');
    const [nameEdit, setNameEdit] = useState('');
    const [about_meEdit, setAbout_meEdit] = useState('');
    const history = useHistory();

    const loggedUser = useContext(LoginContext);

    const textBox = (text) => {
        return (
            <div className="content-box margin-very-very-small">
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
                notifyError(error, false);
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
            new_password: newPassword,
            password: password
        }
        if (data.password === '') {
            delete data["password"]
        }
        if (data.new_password === '') {
            delete data["new_password"]
        }
        try {
            await api.put(`users/${username}`, data);
            setOpenEdit(false);
            setName(nameEdit);
            setAbout_me(about_meEdit);
            setPassword('');
            setNewPassword('');
            setNewPasswordRetype('');
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
            NotificationManager.success("Message sent. Click here to follow your conversations", "Sent", 4000, () => { history.push(`/users/${loggedUser.username}/messages`) })
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
                            <label htmlFor="old-password">Old Password</label>
                            <input
                                id="old-password"
                                type="password"
                                placeholder="Old Password"
                                value={password}
                                autoComplete="new-password"
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex-row flex-axis-center flex-space-between">
                            <label htmlFor="password">New Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                autoComplete="new-password"
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex-row flex-axis-center flex-space-between">
                            <label htmlFor="password-retype">Retype New Password</label>
                            <input
                                className={`${newPassword !== newPasswordRetype && "border-error"}`}
                                id="password-retype"
                                type="password"
                                placeholder="New Password"
                                value={newPasswordRetype}
                                autoComplete="new-password"
                                onChange={e => setNewPasswordRetype(e.target.value)}
                            />
                        </div>
                        {
                            newPassword !== newPasswordRetype ?
                                <button className="button-primary-disabled" value="click" disabled>Save</button> :
                                <button className="button-primary" type="submit">Save</button>
                        }
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
            <Modal
                open={openAvatar}
                onClose={() => setOpenAvatar(false)}
            >
                <div className="modal padding-big flex-column">
                    <h3 className="margin-top-small">Update your avatar</h3>
                    <h5 className="margin-top-small">Your avatar is the Gravatar linked to your email</h5>
                    <a className="flex-row flex-crossaxis-center margin-top-small button-primary" href="https://gravatar.com" target="blank" title="Change your avatar at gravatars' website">Update at Gravatar</a>
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
                            {
                                loggedUser.username === user.username ?
                                    <button onClick={() => setOpenAvatar(true)}><Gravatar link={user.gravatar} rounded={true} /></button> :
                                    <Gravatar link={user.gravatar} rounded={true} />
                            }
                            <h1 className="color-tertiary margin-top-medium width100 ellipsis text-center">{name}</h1>
                            <h5 className="color-tertiary margin-top-very-small width100 ellipsis text-center">@{username}</h5>
                            <h5 className="color-tertiary margin-top-very-small width100 ellipsis text-center">{about_me}</h5>
                            <h6 className="color-tertiary margin-top-small width100 ellipsis text-center">{user.followed && user.followed.length} following | {user.followers && user.followers.length} followers</h6>

                            {(user.id === loggedUser.id) ?
                                <div className="flex-row flex-axis-center margin-top-small">
                                    <button onClick={handleOpenEdit} className="button-secondary">Edit</button>
                                </div> :
                                <div>
                                    <button onClick={handleFollow} className="button-secondary margin-very-very-small">{user.followers && user.followers.includes(loggedUser.id) ? "Unfollow" : "Follow"}</button>
                                    <button onClick={() => setOpenMessage(true)} className="button-secondary margin-very-very-small">Message</button>
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