import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';

import './styles.css';

import { NotificationManager } from 'react-notifications';
import { CloudDownload, Favorite, FavoriteBorder, Help } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import { saveAs } from 'file-saver';

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaPostComments from '../../components/OkaPostComments';
import OkaPostsBox from '../../components/OkaPostsBox';
import api, { downloadsUrl } from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

export default function Posts(props) {
    const id = props.match.params.id;
    const section = props.match.params.section;
    const [loadingHero, setLoadingHero] = useState(true);
    const [post, setPost] = useState({});
    const [openEdit, setOpenEdit] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [nameEdit, setNameEdit] = useState('');
    const [descriptionEdit, setDescriptionEdit] = useState('');

    const loggedUser = useContext(LoginContext);
    const history = useHistory();

    const textBox = (text) => {
        return (
            <div className="content-box margin-very-small">
                {loadingHero ?
                    <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                    <div className="flex-row flex-space-between padding-sides-small padding-vertical-small text-box">
                        {text}
                    </div>
                }
            </div>
        )
    }

    const visualizer = (uuid) => {
        return (
            <div className="content-box margin-very-small">
                <iframe title="iframe-dash" className="iframe-dash" src={`http://127.0.0.1:8050/${uuid}`}></iframe>
            </div>
        )
    }

    const navItems = {
        description: {
            "name": "Description",
            "url": "/posts/" + id + "/description",
            "content": textBox(description)
        },
        comments: {
            "name": "Comments",
            "url": "/posts/" + id + "/comments",
            "content": <OkaPostComments postId={id} />
        },
        visualize: {
            "name": "Visualize",
            "url": "/posts/" + id + "/visualize",
            "content": visualizer(post.data_uuid)
        },
        stats: {
            "name": "Stats",
            "url": "/posts/" + id + "/stats",
            "content": textBox("Stats not implemented yet.")
        },
        twins: {
            "name": "Twins",
            "url": "/posts/" + id + "/twins",
            "content": <OkaPostsBox fetch_url={"/posts/" + id + "/twins"} />
        }
    }

    useEffect(() => {
        async function fetchPost() {
            try {
                const response = await api.get(`posts/${id}`);
                setPost(response.data);
                setName(response.data.name);
                setDescription(response.data.description ? response.data.description : '');
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
        fetchPost();
    }, [id])

    async function handleDownload() {
        try {
            const resp = await api.get(`downloads/data?uuids=${post.data_uuid}`);
            var status = setInterval(async function () {
                try {
                    const response = await api.get(`tasks/${resp.data}/status`);
                    if (response.data.status === "done") {
                        saveAs(downloadsUrl + response.data.result, post.name + ".zip");
                        clearInterval(status);
                    }
                } catch (error) {
                    if (error.response) {
                        for (var prop in error.response.data.errors.json) {
                            NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                        }
                    } else {
                        NotificationManager.error("network error", "error", 4000)
                    }
                }
            }, 1000);
        } catch (error) {
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("network error", "error", 4000)
            }
        }
    }

    async function handleFavorite() {
        var newPost = { ...post };

        try {
            await api.post(`posts/${post.id}/favorite`);
            if (post.favorites.includes(loggedUser.id)) {
                newPost.favorites = newPost.favorites.filter(item => item !== loggedUser.id)
            } else {
                newPost.favorites.push(loggedUser.id)
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

    function handleOpenEdit() {
        setOpenEdit(true);
        setNameEdit(name);
        setDescriptionEdit(description);
    }

    function handleCloseEdit() {
        setOpenEdit(false);
    }

    async function handleEditSubmit(e) {
        e.preventDefault()
        const data = {
            name: nameEdit,
            description: descriptionEdit
        }
        try {
            await api.put(`posts/${id}`, data);
            setOpenEdit(false);
            setName(nameEdit);
            setDescription(descriptionEdit);
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

    function copyToClipboard(e, label) {
        e.preventDefault();
        navigator.clipboard.writeText(label);
        NotificationManager.info("OID copied to clipboard");
    }

    async function handleCreatePost(e, uuid) {
        e.preventDefault();
        if (uuid === "00000000000001") {
            NotificationManager.info("All histories begin here!", "NoData");
            return
        }

        try {
            const response = await api.post(`posts/${uuid}`);
            history.push(`/posts/${response.data.id}/description`);
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
                    <h3 className="margin-top-small">Update dataset data</h3>
                    <form className="form flex-column margin-top-small" onSubmit={e => handleEditSubmit(e)}>
                        <label>
                            Name
                            <input
                                placeholder="Dataset name"
                                value={nameEdit}
                                onChange={e => setNameEdit(e.target.value)}
                            />
                        </label>
                        <label>
                            Description
                            <input
                                placeholder="Dataset description"
                                value={descriptionEdit}
                                onChange={e => setDescriptionEdit(e.target.value)}
                            />
                        </label>
                        <button className="button-primary" type="submit">Save</button>
                    </form>
                </div>
            </Modal>
            <OkaHeader />
            <div className="oka-hero-background padding-sides-small padding-top-big">
                {loadingHero ?
                    <div className="flex-row flex-crossaxis-center"><CircularProgress className="icon-tertiary" /></div> :
                    <>
                        <div className="flex-row flex-space-between flex-axis-center">
                            <div className="flex-row">
                                <button onClick={(e) => copyToClipboard(e, post.data_uuid)}>
                                    <img height="100px" src={`http://127.0.0.1:5000/static/${post.data_uuid}.jpg`} title="Copy to clipboard" alt="Copy to clipboard" />
                                </button>
                                <div className="flex-column flex-crossaxis-center">
                                    <h1 className="padding-small color-tertiary">{name}</h1>
                                    <div className="padding-top-small flex-row">
                                        {
                                            post.history.slice(0).reverse().map((transformation) =>
                                                transformation.name &&
                                                <div key={transformation.id} className="flex-row">
                                                    <div className="flex-column flex-axis-center padding-left-very-small">
                                                        <div className="flex-row" title={transformation.help}>
                                                            <Help className="icon-tertiary" />
                                                            <span className="color-tertiary">{transformation.name}</span>
                                                        </div>
                                                        <span className="color-tertiary">←</span>
                                                    </div>
                                                    <button onClick={(e) => handleCreatePost(e, transformation.label)} className="flex-column flex-crossaxis-center padding-left-very-small">
                                                        <img height="40px" src={`http://127.0.0.1:5000/static/${transformation.avatar}`} title="Show Dataset" alt="Show Dataset" />
                                                    </button>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button onClick={handleOpenEdit} className="button-secondary">Edit</button>
                                <button className="button-secondary margin-left-small">Publish</button>
                            </div>
                        </div>
                        <h6 className="color-tertiary">uploaded by {post.author.name} - <Link className="color-tertiary link-underline" to={`/users/${post.author.username}/uploads`}>{post.author.username}</Link></h6>
                        <h6 className="color-tertiary">{post.downloads} downloads | {post.favorites.length} favorited</h6>
                        <div className="margin-top-very-small" >
                            <button onClick={handleDownload}><CloudDownload className="icon-secondary" /></button>
                            {post.favorites && post.favorites.includes(loggedUser.id) ? <button onClick={handleFavorite}><Favorite className="icon-secondary margin-left-very-small" /></button> : <button onClick={handleFavorite}><FavoriteBorder className="icon-secondary margin-left-very-small" /></button>}
                        </div>
                    </>
                }
            </div>
            <OkaNavBar navItems={navItems} />
            {section in navItems ? <>{navItems[section].content}</> : textBox("Section not found.")}
        </>
    )
}
