import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import './styles.css';
import { CircularProgress } from '@material-ui/core';
import { CloudDownload, Favorite, FavoriteBorder } from '@material-ui/icons';
import { NotificationContainer, NotificationManager } from 'react-notifications';

import api from '../../../services/api';
import OkaHeader from '../../../components/OkaHeader';

export default function DatasetsComments(props) {
    const uuid = props.match.params.uuid;
    const [loading, setLoading] = useState(true);
    const [loadingSection, setLoadingSection] = useState(true);
    const [post, setPost] = useState({});

    useEffect(() => {
        async function fetchPost() {
            try {
                const response = await api.get(`posts/${uuid}`);
                setPost(response.data);
                setLoading(false);
                setLoadingSection(false);
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

    return (
        <>
            <NotificationContainer />
            <OkaHeader />
            <div className="oka-hero-background padding-sides-small padding-top-big">
                <div className="flex-row flex-space-between flex-axis-center">
                    <h2 className="color-tertiary">{loading ? <CircularProgress className="icon-tertiary" /> : post.title}</h2>
                    <div>
                        <button className="button-secondary">Edit</button>
                        <button className="button-secondary margin-left-small">Publish</button>
                    </div>
                </div>

                <h6 className="color-tertiary">{loading ? <CircularProgress className="icon-tertiary" /> : <>{post.downloads} downloads | {post.favorites.length} favorited</>}</h6>
                <h6 className="color-tertiary">OID: {uuid}</h6>
                <div className="margin-top-very-small">
                    <CloudDownload className="icon-secondary" />
                    {post.favorited ? <Favorite className="icon-secondary margin-left-very-small" /> : <FavoriteBorder className="icon-secondary margin-left-very-small" />}
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
                {loadingSection ?
                    <div className="flex-row flex-crossaxis-center"><CircularProgress /></div> :
                    "Comments not implemented yet."
                }
            </div>
        </>
    )
}