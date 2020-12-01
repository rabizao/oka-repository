import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';

import './styles.css';

import { NotificationManager } from 'react-notifications';
import { CloudDownload, Favorite, FavoriteBorder, ChevronLeft, ChevronRight, FormatQuote, Share, PlayArrow } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaPostComments from '../../components/OkaPostComments';
import OkaPostsBox from '../../components/OkaPostsBox';
import ScatterPlot from '../../components/ScatterPlot';
import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';
import { RunningTasksBarContext } from '../../contexts/RunningTasksBarContext';
import { NotificationsContext } from '../../contexts/NotificationsContext';
import { frontendUrl } from '../../services/api';
import { notifyError } from '../../utils';


const runData = [
    {
        "name": "Category 1",
        "uuid": "uuid category 1",
        "algorithms": [
            {
                "name": "Algorithm 1",
                "uuid": "uuid algorithm 1",
                "parameters": [
                    {
                        "name": "a",
                        "values": [10, 20, 30, 50]
                    },
                    {
                        "name": "b",
                        "values": ["valor1", "valor2", "valor3",]
                    }
                ]
            }
        ]
    }
]



export default function Posts(props) {
    const id = props.match.params.id;
    const section = props.match.params.section ? props.match.params.section : "empty";
    const [loadingHero, setLoadingHero] = useState(true);
    const [post, setPost] = useState({});
    const [openEdit, setOpenEdit] = useState(false);
    const [openCite, setOpenCite] = useState(false);
    const [openShare, setOpenShare] = useState(false);
    const [collaboratorUsername, setCollaboratorUsername] = useState('');
    const [openPublish, setOpenPublish] = useState(false);
    const [openRun, setOpenRun] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showAlgorithms, setShowAlgorithms] = useState(false);
    const [showParameters, setShowParameters] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [runCategory, setRunCategory] = useState('');
    const [runAlgorithm, setRunAlgorithm] = useState('');
    const [runParameter, setRunParameter] = useState({});
    const [nameEdit, setNameEdit] = useState('');
    const [descriptionEdit, setDescriptionEdit] = useState('');
    const postUrl = frontendUrl + `/posts/${post.id}/description`;

    const loggedUser = useContext(LoginContext);
    const runningTasksBar = useContext(RunningTasksBarContext);
    const notificationsContext = useContext(NotificationsContext);
    const history = useHistory();

    useEffect(() => {
        async function fetchPost() {
            try {
                const response = await api.get(`posts/${id}`);
                setPost(response.data);
                setName(response.data.name);
                setDescription(response.data.description ? response.data.description : '');
                setLoadingHero(false);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchPost();
    }, [id])

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
        empty: {
            "name": "empty",
            "url": "/posts/" + id,
            "content": <></>,
            "hide": true
        },
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
            "content": <ScatterPlot postId={id} attrs={post.attrs} />
        },
        twins: {
            "name": "Twins",
            "url": "/posts/" + id + "/twins",
            "content": <OkaPostsBox fetch_url={"/posts/" + id + "/twins"} />
        }
    }

    const citation = () => {
        const year = new Date(post.publish_timestamp).getFullYear();
        return (
            <>
                <h4 className="margin-top-small bold">Plain</h4>
                <h5>{post.author && post.author.name}, {post.name}. OKA Knowledge Archive - {postUrl}. </h5>
                <h4 className="margin-top-small bold">BibTeX</h4>
                <h5>
                    @misc&#123;oka-{post.id},<br />
                    author = "{post.author && post.author.name}",<br />
                    title = "{post.name}",<br />
                    howpublished = &#123;OKA Knowledge Archive \url&#123;{postUrl}&#125;&#125;,<br />
                    year = "{year}"<br />
                    &#125;
                </h5>
            </>
        )
    }

    async function handleDownload() {
        try {
            const resp = await api.get(`downloads/data?pids=${post.id}`);
            var newTasks = { ...runningTasksBar.tasks };
            newTasks[resp.data.id] = {
                description: "Starting..."
            };
            runningTasksBar.setTasks(newTasks);
            runningTasksBar.setActive(true);
            notificationsContext.setDelay(1000);
        } catch (error) {
            notifyError(error);
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
            notifyError(error);
        }
        setPost(newPost);
    }

    function handleOpenEdit() {
        setOpenEdit(true);
        setNameEdit(name);
        setDescriptionEdit(description);
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
            notifyError(error);
        }
    }

    async function handlePublish() {
        try {
            await api.post(`posts/${id}/publish`);
            NotificationManager.success("Post was successfully published. Now it is available to everyone.", "Publish", 8000)
            setOpenPublish(false);
        } catch (error) {
            notifyError(error);
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
            // first, try to get.
            const response = await api.get(`/posts/${uuid}`);
            history.push(`/posts/${response.data.id}/description`);
            return
        } catch (error) {
            if (error.response) {

                // now, try to create
                try {
                    const response = await api.post(`posts/${uuid}`);
                    history.push(`/posts/${response.data.id}/description`);
                } catch (error) {
                    notifyError(error);
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
            }
        }
    }

    async function handleSubmitCollaborator(e, username) {
        e.preventDefault();
        var newPost = { ...post };

        const data = {
            username: username
        }

        try {
            await api.post(`posts/${id}/collaborators`, data);
            if (post.allowed.includes(username)) {
                newPost.allowed = newPost.allowed.filter(item => item !== username)
            } else {
                newPost.allowed.push(username)
            }
            NotificationManager.success(`Successfully edited ${username} access.`, "Collaborator", 8000)
            setCollaboratorUsername('');
        } catch (error) {
            notifyError(error);
        }
        setPost(newPost);
    }

    function handleSelectCategory(e) {
        if (e.target.value !== "select") {
            setShowAlgorithms(true);
        } else {
            setShowAlgorithms(false);
        }
        setRunCategory(e.target.value);
    }

    function handleSelectAlgorithm(e) {
        if (e.target.value !== "select") {
            setShowParameters(true);
        } else {
            setShowParameters(false);
        }
        setRunAlgorithm(e.target.value);
    }

    function handleSelectParameter(e, parameterName) {
        var newRunParameter = { ...runParameter };
        newRunParameter[parameterName] = e.target.value;
        setRunParameter(newRunParameter);
    }

    async function handleRun() {
        const data = {
            step: {
                category: runCategory,
                algorithm: runAlgorithm,
                parameters: runParameter
            }
        }

        try {
            const resp = await api.post(`posts/${id}/run`, data);
            var newTasks = { ...runningTasksBar.tasks };
            newTasks[resp.data.id] = {
                description: "Starting..."
            };
            runningTasksBar.setTasks(newTasks);
            runningTasksBar.setActive(true);
            notificationsContext.setDelay(1000);
            NotificationManager.success(`Your simulation has just started.`, "Run", 8000)
            setOpenRun(false);
            setRunCategory('');
            setRunAlgorithm('');
            setRunParameter({});
        } catch (error) {
            notifyError(error);
        }
    }

    return (
        <>
            <Modal
                open={openEdit}
                onClose={() => setOpenEdit(false)}
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
            <Modal
                open={openCite}
                onClose={() => setOpenCite(false)}
            >
                <div className="modal padding-big">
                    <h3 className="margin-bottom-small">Cite this data</h3>
                    {
                        post.public ?
                            citation() :
                            <h5>The author must publish the post before it can be cited. </h5>
                    }
                </div>
            </Modal>
            <Modal
                open={openShare}
                onClose={() => setOpenShare(false)}
            >
                <div className="modal padding-big">
                    <h3 className="margin-bottom-small">Dataset access</h3>
                    {
                        post.allowed && post.allowed.length > 0 &&
                        <h4 className="margin-top-small bold">Already shared with</h4>
                    }
                    {
                        post.allowed && post.allowed.map((collaborator) =>
                            <button
                                key={collaborator}
                                onClick={(e) => handleSubmitCollaborator(e, collaborator)}
                                className={"button-negative margin-very-small"}
                            >
                                {collaborator}
                            </button>
                        )
                    }
                    <h4 className="margin-top-small bold">Include a new collaborator</h4>
                    {
                        post.public ?
                            <>
                                <h5>You can share this dataset using the following link</h5>
                                <h5 className="padding-small background-secondary-color-light">{postUrl}</h5>
                            </> :
                            <form className="form flex-column" onSubmit={e => handleSubmitCollaborator(e, collaboratorUsername)}>
                                <label>
                                    Username
                                    <input
                                        placeholder="Username"
                                        value={collaboratorUsername}
                                        onChange={e => setCollaboratorUsername(e.target.value)}
                                    />
                                </label>
                                <button className="button-primary" type="submit">Invite</button>
                            </form>
                    }
                </div>
            </Modal>
            <Modal
                open={openRun}
                onClose={() => setOpenRun(false)}
            >
                <div className="modal padding-big">
                    <h3 className="margin-bottom-small">Run</h3>
                    <h4 className="margin-top-small bold">Select a category</h4>
                    <div className="padding-left-small">
                        <select onChange={(e) => handleSelectCategory(e)} value={runCategory}>
                            <option value={"select"}>Select</option>
                            {
                                runData.map((category) =>
                                    <option key={category["uuid"]} value={category["uuid"]}>{category["name"]}</option>
                                )
                            }
                        </select>
                    </div>
                    {
                        showAlgorithms &&
                        <>
                            <h4 className="margin-top-small bold">Select the algorithm</h4>
                            <div className="padding-left-small">
                                <select onChange={(e) => handleSelectAlgorithm(e)} value={runAlgorithm}>
                                    <option value={"select"}>Select</option>
                                    {
                                        runData.map((category) =>
                                            category["algorithms"].map((algorithm) =>
                                                <option key={algorithm["uuid"]} value={algorithm["uuid"]}>{algorithm["name"]}</option>
                                            )
                                        )
                                    }
                                </select>
                            </div>
                        </>
                    }
                    {
                        showAlgorithms && showParameters &&
                        <>
                            <h4 className="margin-top-small bold">Select the parameters</h4>
                            <div className="padding-left-small">
                                {
                                    runData.map((category) =>
                                        category["algorithms"].map((algorithm) =>
                                            algorithm["parameters"].map((parameter) =>
                                                <select key={parameter["name"]} onChange={(e) => handleSelectParameter(e, parameter["name"])} value={runParameter[parameter["name"]] || ''}>
                                                    <option value={"select"}>Select</option>
                                                    {
                                                        parameter["values"].map((value) =>
                                                            <option key={value} value={value}>{value}</option>
                                                        )
                                                    }
                                                </select>
                                            )
                                        )
                                    )
                                }
                            </div>
                        </>
                    }

                    <button onClick={handleRun} className="button-primary margin-top-small">Run</button>

                </div>
            </Modal>
            <Modal
                open={openPublish}
                onClose={() => setOpenPublish(false)}
            >
                <div className="modal padding-big">
                    <h3>Publish your post</h3>
                    <h5 className="margin-top-small">You can not undo this action. Please note that after publishing your post it will be available to everyone forever. If you want to make this post available to a specific group of people please use share button instead.
                    </h5>
                    <button onClick={handlePublish} className="button-primary margin-top-small">I want to make {post.name} of author {post.author && post.author.name} available to everyone forever!</button>
                </div>
            </Modal>
            <OkaHeader />
            <div className="oka-hero-background padding-sides-small padding-top-big">
                {loadingHero ?
                    <div className="flex-row flex-crossaxis-center"><CircularProgress className="icon-tertiary" /></div> :
                    <>
                        {
                            !post.public && post.author && post.author.username === loggedUser.username &&
                            <div className="flex-row flex-crossaxis-center">
                                <button onClick={handleOpenEdit} className="button-secondary margin-very-small">Edit</button>
                                <button onClick={() => setOpenPublish(true)} className="button-secondary margin-very-small">Publish</button>
                            </div>
                        }

                        <div className="flex-row margin-top-small">
                            <div className="flex-column flex-crossaxis-center">
                                <div className="flex-wrap">
                                    {
                                        post.history.length > 0 &&
                                        (
                                            showHistory ?
                                                <>
                                                    <button className="margin-very-small icon-medium" title="Hide History" onClick={() => setShowHistory(!showHistory)}><ChevronLeft className="icon-tertiary" /></button>
                                                    {
                                                        post.history.map((transformation) =>
                                                            transformation.name &&
                                                            <div key={transformation.label} className="flex-row">
                                                                <button
                                                                    title="Show Dataset" alt="Show Dataset"
                                                                    onClick={(e) => handleCreatePost(e, transformation.label)}
                                                                    className="box-uuid-history"
                                                                    style={{ backgroundColor: `rgb(${transformation.data_uuid_colors[0][0]}, ${transformation.data_uuid_colors[0][1]}, ${transformation.data_uuid_colors[0][2]})`, border: `var(--border)` }}>
                                                                    <span>&nbsp;</span>
                                                                    {
                                                                        transformation.data_uuid_colors.slice(1).map((color, index) =>
                                                                            <span key={index} style={{ color: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}>{transformation.label[index]}</span>
                                                                        )
                                                                    }
                                                                </button>
                                                                <div className="flex-column flex-axis-center padding-sides-very-small">
                                                                    <span className="color-tertiary">{transformation.name}</span>
                                                                    <span className="color-tertiary">→</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </> :
                                                <button className="margin-very-small icon-medium" title="Expand History" onClick={() => setShowHistory(!showHistory)}><ChevronRight className="icon-tertiary" /></button>
                                        )
                                    }
                                </div>
                            </div>
                            <button
                                onClick={(e) => copyToClipboard(e, post.data_uuid)}
                                className="box-uuid"
                                style={{ backgroundColor: `rgb(${post.data_uuid_colors[0][0]}, ${post.data_uuid_colors[0][1]}, ${post.data_uuid_colors[0][2]})`, border: `var(--border)` }}>
                                <span>&nbsp;</span>
                                {
                                    post.data_uuid_colors.slice(1).map((color, index) =>
                                        <span key={index} style={{ color: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}>{post.data_uuid[index]}</span>
                                    )
                                }
                            </button>
                        </div>
                        <h1 className="color-tertiary ellipsis">{name}</h1>
                        <h6 className="color-tertiary">OID: <span className="font-courier color-tertiary">{post.data_uuid}</span></h6>
                        <h6 className="color-tertiary">uploaded by {post.author.name} - <Link className="color-tertiary link-underline" to={`/users/${post.author.username}/uploads`}>{post.author.username}</Link></h6>
                        <h6 className="color-tertiary">{post.downloads} downloads | {post.favorites.length} favorited</h6>
                        <div className="margin-top-very-small" >
                            <button className="icon-normal" title="Download" onClick={handleDownload}><CloudDownload className="icon-secondary" /></button>
                            {post.favorites && post.favorites.includes(loggedUser.id) ? <button className="icon-normal margin-left-very-small" title="Unfavorite" onClick={handleFavorite}><Favorite className="icon-secondary" /></button> : <button title="Favorite" className="icon-normal margin-left-very-small" onClick={handleFavorite}><FavoriteBorder className="icon-secondary" /></button>}
                            <button className="icon-normal margin-left-very-small" title="Cite" onClick={() => setOpenCite(true)}><FormatQuote className="icon-secondary" /></button>
                            <button className="icon-normal margin-left-very-small" title="Share" onClick={() => setOpenShare(true)}><Share className="icon-secondary" /></button>
                            <button className="icon-normal margin-left-very-small" title="Run" onClick={() => setOpenRun(true)}><PlayArrow className="icon-secondary" /></button>
                        </div>
                    </>
                }
            </div>
            <OkaNavBar navItems={navItems} />
            <div className="margin-bottom-huge">{section in navItems ? navItems[section].content : textBox("Section not found.")}</div>
        </>
    )
}
