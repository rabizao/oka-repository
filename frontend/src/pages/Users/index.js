import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

import './styles.css';

import Avatar from 'react-avatar';
import { NotificationManager } from 'react-notifications';
import { CircularProgress } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaPostsBox from '../../components/OkaPostsBox';
import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';
import queryString from 'query-string';

export default function Users(props) {
    const location = useLocation()
    const username = props.match.params.username;
    const section = props.match.params.section;
    const [parsedQueries, setParsedQueries] = useState({});
    const [loadingHero, setLoadingHero] = useState(true);
    const [user, setUser] = useState({});
    const [openEdit, setOpenEdit] = useState(false);
    const [name, setName] = useState('');
    const [about_me, setAbout_me] = useState('');
    const [nameEdit, setNameEdit] = useState('');
    const [about_meEdit, setAbout_meEdit] = useState('');
    const [openApiToken, setOpenApiToken] = useState(false);
    const [apiToken, setApiToken] = useState('');

    const loggedUser = useContext(LoginContext);

    const navItems = {
        uploads: {
            "name": "Uploads",
            "url": "/users/" + username + "/uploads",
            "content": <OkaPostsBox fetch_url={"/users/" + username + "/posts?" + queryString.stringify(parsedQueries)} />
        },
        favorites: {
            "name": "Favorites",
            "url": "/users/" + username + "/favorites",
            "content": <OkaPostsBox fetch_url={"/users/" + username + "/favorites?" + queryString.stringify(parsedQueries)} />
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
                setLoadingHero(false);
            } catch (error) {
                if (error.response) {
                    for (var prop in error.response.data.errors.json) {
                        NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000);
                    }
                } else {
                    NotificationManager.error("Network error", "Error", 4000);
                }
            }
        }
        fetchUser();
    }, [username])

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
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
            }
        }
        setUser(newUser);
    }

    async function handleEditSubmit(e) {
        e.preventDefault()
        const data = {
            name: nameEdit,
            about_me: about_meEdit
        }
        try {
            await api.put(`users/${username}`, data);
            setOpenEdit(false);
            setName(nameEdit);
            setAbout_me(about_meEdit);
        } catch (error) {
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
            }
        }
    }

    function handleOpenEdit() {
        setOpenEdit(true);
        setNameEdit(name);
        setAbout_meEdit(about_me);
    }

    function handleCloseEdit() {
        setOpenEdit(false);
    }

    function handleOpenApiToken() {
        setOpenApiToken(true);
    }

    function handleCloseApiToken() {
        setOpenApiToken(false);
    }

    async function handleGetApiToken() {
        try {
            const response = await api.post('auth/create-api-token')
            setApiToken(response.data.api_token)
        } catch (error) {
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
            }
        }
    }

    return (
        <>
            <Modal
                open={openEdit}
                onClose={handleCloseEdit}
            >
                <div className="modal padding-big">
                    <h3 className="margin-top-small">Update your data</h3>
                    <form className="form flex-column margin-top-small" onSubmit={e => handleEditSubmit(e)}>
                        <label>
                            Name
                            <input
                                placeholder="Your name"
                                value={nameEdit}
                                onChange={e => setNameEdit(e.target.value)}
                            />
                        </label>
                        <label>
                            About
                            <input
                                placeholder="Your position"
                                value={about_meEdit}
                                onChange={e => setAbout_meEdit(e.target.value)}
                            />
                        </label>
                        <button className="button-primary" type="submit">Save</button>
                    </form>
                </div>
            </Modal>
            <Modal
                open={openApiToken}
                onClose={handleCloseApiToken}
            >
                <div className="modal padding-big">
                    <h3 className="margin-top-small">Request API Token</h3>
                    <br />
                    <span>An API token is used to interact with OKA without having to enter in the web interface. Please click on
                    the button bellow to generate your token. After generating your token, store it in a safe place.
                    Please note that if you generate a new token the older will not be valid anymore.
                    </span>
                    <br />
                    <button onClick={handleGetApiToken} className="button-primary margin-top-small">Get Token</button>
                    <br />
                    {apiToken && <div className="padding-small wrapword background-secondary-color-light">{apiToken}</div>}
                </div>
            </Modal>
            <OkaHeader />
            <div className="flex-column flex-axis-center oka-hero-background padding-sides-small padding-top-big">
                {loadingHero ?
                    <CircularProgress className="icon-tertiary" /> :
                    
                    <div className="flex-column flex-axis-center padding-medium width-smallest">
                        <Avatar name={user.name} size="80" round={true} />
                        <h1 className="color-tertiary margin-top-medium width100 ellipsis text-center">{name}</h1>
                        <h5 className="color-tertiary margin-top-very-small width100 ellipsis text-center">{about_me}</h5>
                        <h6 className="color-tertiary margin-top-small width100 ellipsis text-center">{user.followed && user.followed.length} following | {user.followers && user.followers.length} followers</h6>

                        {(user.id === loggedUser.id) ?
                            <div className="flex-row flex-axis-center margin-top-small">
                                <button onClick={handleOpenEdit} className="button-secondary">Edit</button>
                                <button onClick={handleOpenApiToken} className="button-secondary margin-left-small">API</button>
                            </div> :
                            <button onClick={handleFollow} className="button-secondary margin-vertical-small">{user.followers && user.followers.includes(loggedUser.id) ? "Unfollow" : "Follow"}</button>
                        }
                    </div>
                }

            </div>
            <OkaNavBar navItems={navItems} />
            {section in navItems && <>{navItems[section].content}</>}
        </>
    )
}