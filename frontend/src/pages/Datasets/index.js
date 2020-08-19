import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

import { NotificationManager } from 'react-notifications';
import { CloudDownload, Favorite, FavoriteBorder } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import { saveAs } from 'file-saver';

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

export default function Users(props) {
    const uuid = props.match.params.uuid;
    const section = props.match.params.section;
    const [loadingHero, setLoadingHero] = useState(true);
    const [dataset, setDataset] = useState({});
    const [openEdit, setOpenEdit] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [nameEdit, setNameEdit] = useState('');
    const [descriptionEdit, setDescriptionEdit] = useState('');

    const loggedUser = useContext(LoginContext);

    const textBox = (text) => {
        return (
            <div className="content-box">
                {loadingHero ?
                    <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                    <div className="flex-row flex-space-between padding-sides-small padding-vertical-small">
                        {text}
                    </div>
                }
            </div>
        )
    }

    const navItems = {
        description: {
            "name": "Description",
            "url": "/datasets/" + uuid + "/description",
            "content": textBox(description)
        },
        visualize: {
            "name": "Visualize",
            "url": "/datasets/" + uuid + "/visualize",
            "content": textBox("Visualize not implemented yet.")
        },
        comments: {
            "name": "Comments",
            "url": "/datasets/" + uuid + "/comments",
            "content": textBox("Comments not implemented yet.")
        }
    }

    useEffect(() => {
        async function fetchDataset() {
            try {
                const response = await api.get(`posts/${uuid}`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                setDataset(response.data);
                setName(response.data.name);
                setDescription(response.data.body ? response.data.body : '');
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
        fetchDataset();
    }, [uuid])

    async function handleDownload() {
        try {
            const response = await api.get(`downloads?uuids=${uuid}`, { responseType: 'blob' });
            saveAs(response.data, dataset.name + ".arff")
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
        var newDataset = { ...dataset };

        try {
            await api.post(`posts/${dataset.id}/favorite`);
            if (dataset.favorites.includes(loggedUser.id)) {
                newDataset.favorites = newDataset.favorites.filter(item => item !== loggedUser.id)
            } else {
                newDataset.favorites.push(loggedUser.id)
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
        setDataset(newDataset);
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
            body: descriptionEdit
        }
        try {
            await api.put(`posts/${uuid}`, data);
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
                            <h2 className="color-tertiary">{name}</h2>
                            <div>
                                <button onClick={handleOpenEdit} className="button-secondary">Edit</button>
                                <button className="button-secondary margin-left-small">Publish</button>
                            </div>
                        </div>
                        <h6 className="color-tertiary">uploaded by {dataset.author.name} - <Link className="color-tertiary link-underline" to={`/users/${dataset.author.username}/uploads`}>{dataset.author.username}</Link></h6>
                        <h6 className="color-tertiary">{dataset.downloads} downloads | {dataset.favorites.length} favorited</h6>
                        <h6 className="color-tertiary">OID: {uuid}</h6>
                        <div className="margin-top-very-small" >
                            <button onClick={handleDownload}><CloudDownload className="icon-secondary" /></button>
                            {dataset.favorites && dataset.favorites.includes(loggedUser.id) ? <button onClick={handleFavorite}><Favorite className="icon-secondary margin-left-very-small" /></button> : <button onClick={handleFavorite}><FavoriteBorder className="icon-secondary margin-left-very-small" /></button>}
                        </div>
                    </>
                }
            </div>
            <OkaNavBar navItems={navItems} />
            {section in navItems ? <>{navItems[section].content}</> : textBox("Section not found.")}
        </>
    )
}