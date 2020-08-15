import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { saveAs } from 'file-saver'

import './styles.css';
import { CircularProgress } from '@material-ui/core';
import { CloudDownload, Favorite, FavoriteBorder } from '@material-ui/icons';
import { NotificationContainer, NotificationManager } from 'react-notifications';

import api from '../../../services/api';
import { LoginContext } from '../../../contexts/LoginContext';
import OkaHeader from '../../../components/OkaHeader';

export default function DatasetsComments(props) {
    const uuid = props.match.params.uuid;
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState({});

    const user = useContext(LoginContext);

    useEffect(() => {
        async function fetchPost() {
            try {
                const response = await api.get(`posts/${uuid}`);
                setPost(response.data);
                setLoading(false);
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
        fetchPost();
    }, [uuid])

    async function handleDownload() {
        try {
            const response = await api.get(`downloads?uuids=${uuid}`, {responseType: 'blob'});
            saveAs(response.data, post.name+".arff")
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

    async function handleFavorite() {
        var newPost = {...post};

        try {
            await api.post(`posts/${post.id}/favorite`);
            if (post.favorites.includes(user.id)) {
                newPost.favorites = newPost.favorites.filter(item => item !== user.id)
            } else {
                newPost.favorites.push(user.id)
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

        setPost(newPost);
    }

    return (
        <>
            <NotificationContainer />
            <OkaHeader />
            <div className="oka-hero-background padding-sides-small padding-top-big">
                <div className="flex-row flex-space-between flex-axis-center">
                    <h2 className="color-tertiary">{loading ? <CircularProgress className="icon-tertiary" /> : post.name}</h2>
                    <div>
                        <button className="button-secondary">Edit</button>
                        <button className="button-secondary margin-left-small">Publish</button>
                    </div>
                </div>

                <h6 className="color-tertiary">{loading ? <CircularProgress className="icon-tertiary" /> : <>{post.downloads} downloads | {post.favorites.length} favorited</>}</h6>
                <h6 className="color-tertiary">OID: {uuid}</h6>
                <div className="margin-top-very-small" >
                    <button onClick={handleDownload}><CloudDownload className="icon-secondary" /></button>
                    {post.favorites && post.favorites.includes(user.id) ? <button onClick={handleFavorite}><Favorite className="icon-secondary margin-left-very-small" /></button> : <button onClick={handleFavorite}><FavoriteBorder className="icon-secondary margin-left-very-small" /></button>}
                </div>
            </div>

            <nav className="flex-row flex-crossaxis-center padding-top-small oka-hero-background">
                <NavLink to={`/datasets/${uuid}/description`} activeClassName="nav-button-secondary-active">
                    <button className="nav-button-secondary">Description</button>
                </NavLink>
                <NavLink to={`/datasets/${uuid}/visualize`} activeClassName="nav-button-secondary-active">
                    <button className="nav-button-secondary">Visualize</button>
                </NavLink>
                <NavLink to={`/datasets/${uuid}/comments`} activeClassName="nav-button-secondary-active">
                    <button className="nav-button-secondary">Comments</button>
                </NavLink>
            </nav>

            <div className="content-box padding-big">
                {loading ?
                    <div className="flex-row flex-crossaxis-center"><CircularProgress /></div> :
                    "Comments not implemented yet."
                }
            </div>
        </>
    )
}