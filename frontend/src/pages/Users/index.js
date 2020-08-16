import React, { useState, useEffect, useContext } from 'react';

import './styles.css';

import Avatar from 'react-avatar';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaPostsBox from '../../components/OkaPostsBox';
import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

export default function Users(props) {
    const username = props.match.params.username;
    const section = props.match.params.section;
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});

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
                setUser(response.data);
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
        var newUser = {...user};
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

    return (
        <>
            <NotificationContainer />
            <OkaHeader />
            <div className="flex-column flex-axis-center oka-hero-background padding-sides-small padding-top-big">
                <Avatar name={user.name} size="80" round={true} />
                <h1 className="color-tertiary margin-top-medium">{user.name}</h1>
                <h5 className="color-tertiary margin-top-very-small">{user.about_me}</h5>
                <h6 className="color-tertiary margin-top-small">{user.followed && user.followed.length} following | {user.followers && user.followers.length} followers</h6>
                <button onClick={handleFollow} className="button-secondary margin-vertical-small">{user.followers && user.followers.includes(user.id) ? "Unfollow" : "Follow"}</button>
            </div>
            <OkaNavBar navItems={navItems} setLoading={setLoading} />
            <OkaPostsBox navItems={navItems} section={section} loading={loading} setLoading={setLoading} />
        </>
    )
}