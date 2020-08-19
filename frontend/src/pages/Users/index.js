import React, { useState, useEffect, useContext } from 'react';

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

export default function Users(props) {
    const username = props.match.params.username;
    const section = props.match.params.section;
    const [loading, setLoading] = useState(true);
    const [loadingHero, setLoadingHero] = useState(true);
    const [user, setUser] = useState({});
    const [openEdit, setOpenEdit] = useState(false);
    const [name, setName] = useState('');
    const [about_me, setAbout_me] = useState('');
    const [nameEdit, setNameEdit] = useState('');
    const [about_meEdit, setAbout_meEdit] = useState('');

    const loggedUser = useContext(LoginContext);

    const navItems = {
        uploads: {
            "name": "Uploads",
            "url": "/users/" + username + "/uploads",
            "fetch_url": "/users/" + username + "/uploads"
        },
        favorites: {
            "name": "Favorites",
            "url": "/users/" + username + "/favorites",
            "fetch_url": "/users/" + username + "/favorites"
        },
        basket: {
            "name": "Basket",
            "url": "/users/" + username + "/basket",
            "fetch_url": "/users/" + username + "/basket"
        }
    }

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await api.get(`users/${username}`);
                await new Promise(resolve => setTimeout(resolve, 3000));
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
            <OkaHeader />
            <div className="flex-column flex-axis-center oka-hero-background padding-sides-small padding-top-big">
                {loadingHero ?
                    <CircularProgress className="icon-tertiary" /> :
                    <>
                        <Avatar name={user.name} size="80" round={true} />
                        <h1 className="color-tertiary margin-top-medium">{name}</h1>
                        <h5 className="color-tertiary margin-top-very-small">{about_me}</h5>
                        <h6 className="color-tertiary margin-top-small">{user.followed && user.followed.length} following | {user.followers && user.followers.length} followers</h6>

                        {(user.id === loggedUser.id) ?
                            <button onClick={handleOpenEdit} className="button-secondary margin-vertical-small">Edit</button> :
                            <button onClick={handleFollow} className="button-secondary margin-vertical-small">{user.followers && user.followers.includes(loggedUser.id) ? "Unfollow" : "Follow"}</button>
                        }
                    </>
                }

            </div>
            <OkaNavBar navItems={navItems} setLoading={setLoading} />
            <OkaPostsBox navItems={navItems} section={section} loading={loading} setLoading={setLoading} />
        </>
    )
}