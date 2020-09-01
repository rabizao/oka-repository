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
import api from '../../services/api';
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
            <div className="content-box">
                {loadingHero ?
                    <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                    <div className="flex-row flex-space-between padding-sides-small padding-vertical-small text-box">
                        {text}
                    </div>
                }
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
            "content": textBox("Visualize not implemented yet.")
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
            const response = await api.get(`downloads/data?uuids=${post.data_uuid}`, { responseType: ['blob'] });
            saveAs(response.data, post.name + ".zip");
        } catch (error) {
            if (error.response) {
                var reader = new FileReader();
                reader.readAsText(error.response.data);
                reader.onload = function () {
                    const response = JSON.parse(reader.result);
                    for (var prop in response.errors.json) {
                        NotificationManager.error(response.errors.json[prop], `${prop}`, 4000)
                    }
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
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
            history.push(`posts/${response.data.id}`);
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
                                                        <img height="40px" src={`http://127.0.0.1:5000/static/${transformation.avatar}`} title={transformation.label !== "00000000000001"? "Copy to clipboard": ""} alt="Copy to clipboard" />
                                                    </button>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* <table>
                                <tr>
                                    <td className="color-tertiary">&nbsp;{name}&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>
                                        <img width="50%" src={`http://127.0.0.1:5000/static/${post.data_uuid}.jpg`} title={`${post.data_uuid}`}/>
                                    </td>

                                    {post.history.map(transformation =>

                                        
                                        <td>
                                        <h6>
                                        <table><tr>
                                        <td>
                                            <h6>
                                            <center>
                                            <div title={transformation.help}>
                                                {transformation.name ? <div className="color-tertiary"><span>&nbsp;&nbsp;</span> {transformation.name} <span className="color-tertiary">&nbsp;?&nbsp;</span></div>: ""}
                                            </div>
                                            <center>
                                            <div className="color-tertiary">
                                                    {transformation.name ? "←" : ""}
                                            </div>
                                            </center>
                                            </center>
                                            </h6>
                                        </td>
                                        <td>
                                            <button disabled={transformation.stored ? 'false' : 'true'}>
                                                <img class="rounded" width="35px" src={`http://127.0.0.1:5000/static/${transformation.avatar}`} title={`${transformation.label}`}/>
                                            </button>
                                        </td>
                                        </tr></table>
                                        </h6>
                                        </td>
                                    )}
                                </tr>
                                </table> */}


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
