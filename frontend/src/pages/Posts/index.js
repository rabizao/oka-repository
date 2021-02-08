import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';

import './styles.css';

import { NotificationManager } from 'react-notifications';
import { CloudDownload, Favorite, FavoriteBorder, ChevronLeft, ChevronRight, FormatQuote, Share, PlayArrow, Edit, Clear, Save, ToggleOn, ToggleOff } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaPostComments from '../../components/OkaPostComments';
import OkaPostsBox from '../../components/OkaPostsBox';
import ScatterPlot from '../../components/ScatterPlot';
import api from '../../services/api'; // , { dashUrl }
import { LoginContext } from '../../contexts/LoginContext';
import { RunningTasksBarContext } from '../../contexts/RunningTasksBarContext';
import { NotificationsContext } from '../../contexts/NotificationsContext';
import { frontendUrl } from '../../services/api';
import { notifyError } from '../../utils';


const categories = [
    {
        "name": "Evaluation",
        "uuid": "evaluation",
        "algorithms": [
            {
                "name": "Partition",
                "uuid": "partition",
                "parameters": [
                    {
                        "name": "mode",
                        "values": ["cv"]
                    },
                    {
                        "name": "splits",
                        "values": [2, 3, 4, 5, 6, 7, 8, 9, 10]
                    },
                    {
                        "name": "seed",
                        "values": [0, 100000],
                        "range": true
                    },
                    {
                        "name": "fields",
                        "values": ["X,Y"]
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
    const [editName, setEditName] = useState(false);
    const [editDescription, setEditDescription] = useState(false);
    const [openCite, setOpenCite] = useState(false);
    const [openDeletePost, setOpenDeletePost] = useState(false);
    const [openShare, setOpenShare] = useState(false);
    const [collaboratorUsername, setCollaboratorUsername] = useState('');
    const [openPublish, setOpenPublish] = useState(false);
    const [openRun, setOpenRun] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showAlgorithms, setShowAlgorithms] = useState(false);
    const [showParameters, setShowParameters] = useState(false);
    const [showMeta, setShowMeta] = useState(false);
    const [showData, setShowData] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [runCategory, setRunCategory] = useState('');
    const [runAlgorithm, setRunAlgorithm] = useState('');
    const [runParameter, setRunParameter] = useState({});
    const [reloadPost, setReloadPost] = useState(0);
    const [nameEdit, setNameEdit] = useState('');
    const [publishConfirmationWord, setPublishConfirmationWord] = useState('');
    const [descriptionEdit, setDescriptionEdit] = useState('');
    const postUrl = frontendUrl + `/posts/${post.id}`;

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
                setNameEdit(response.data.name);
                setDescription(response.data.description ? response.data.description : '');
                setDescriptionEdit(response.data.description ? response.data.description : '');
                setLoadingHero(false);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchPost();
    }, [id, reloadPost])

    const metas = {
        General: [
            {
                title: "Features",
                variable: post.number_of_features || null,
                tag: "features",
                type: "numeric",
                editable: false
            },
            {
                title: "Instances",
                variable: post.number_of_instances || null,
                tag: "instances",
                type: "numeric",
                editable: false
            },
            {
                title: "Targets",
                variable: post.number_of_targets || null,
                tag: "targets",
                type: "numeric",
                editable: false
            },            
            {
                title: "Classes",
                variable: post.number_of_classes || null,
                tag: "classes",
                type: "numeric",
                editable: false
            },
        ],
        Tasks: [
            {
                title: "Classification",
                variable: post.classification || null,
                tag: "classification",
                type: "boolean",
                editable: true
            },
            {
                title: "Regression",
                variable: post.regression || null,
                tag: "regression",
                type: "boolean",
                editable: true
            },
            {
                title: "Clustering",
                variable: post.clustering || null,
                tag: "clustering",
                type: "boolean",
                editable: true
            },
            {
                title: "Others",
                variable: post.other_tasks || null,
                tag: "other_tasks",
                type: "boolean",
                editable: true
            }
        ],
        Domains: [
            {
                title: "Life Sciences",
                variable: post.life_sciences || null,
                tag: "life_sciences",
                type: "boolean",
                editable: true
            },
            {
                title: "Physical Sciences",
                variable: post.physical_sciences || null,
                tag: "physical_sciences",
                type: "boolean",
                editable: true
            },
            {
                title: "Engineering",
                variable: post.engineering || null,
                tag: "engineering",
                type: "boolean",
                editable: true
            },
            {
                title: "Social",
                variable: post.social || null,
                tag: "social",
                type: "boolean",
                editable: true
            },
            {
                title: "Business",
                variable: post.business || null,
                tag: "business",
                type: "boolean",
                editable: true
            },
            {
                title: "Finances",
                variable: post.finances || null,
                tag: "finances",
                type: "boolean",
                editable: true
            },
            {
                title: "Astronomy",
                variable: post.astronomy || null,
                tag: "astronomy",
                type: "boolean",
                editable: true
            },
            {
                title: "Medical",
                variable: post.medical || null,
                tag: "medical",
                type: "boolean",
                editable: true
            },
            {
                title: "Others",
                variable: post.other_domains || null,
                tag: "other_domains",
                type: "boolean",
                editable: true
            }
        ],
        Features: [
            {
                title: "Categorical",
                variable: post.categorical || null,
                tag: "categorical",
                type: "boolean",
                editable: true
            },
            {
                title: "Numerical",
                variable: post.numerical || null,
                tag: "numerical",
                type: "boolean",
                editable: true
            },
            {
                title: "Text",
                variable: post.text || null,
                tag: "text",
                type: "boolean",
                editable: true
            },
            {
                title: "Images",
                variable: post.images || null,
                tag: "images",
                type: "boolean",
                editable: true
            },
            {
                title: "Time Series",
                variable: post.time_series || null,
                tag: "time_series",
                type: "boolean",
                editable: true
            },
            {
                title: "Others",
                variable: post.other_features || null,
                tag: "other_features",
                type: "boolean",
                editable: true
            }
        ]
    }

    const textBox = (text) => {
        return (
            <div className="content-box margin-very-small">
                {loadingHero ?
                    <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                    <div className="flex-row padding-sides-small padding-vertical-small text-box">
                        {text}
                    </div>
                }
            </div>
        )
    }

    function handleTextAreaAdjust(element) {
        element.style.height = (element.scrollHeight) + "px";
    }

    async function handlePostMetaUpdate(tag, state) {
        console.log(tag)

        const data = {
            [tag]: !state
        }

        try {
            await api.put(`posts/${id}`, data);
            var newPost = { ...post };
            newPost[tag] = !state;
            setPost(newPost);
        } catch (error) {
            notifyError(error);
        }
    }

    const overviewBox = (text) => {

        return (
            <div className="content-box margin-very-small">
                {loadingHero ?
                    <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                    <>
                        <button className={`${showData ? "button-negative" : "button-primary"} margin-small`} onClick={() => setShowData(!showData)}>
                            {showData ? "Hide Data" : "Show Data"}
                        </button>
                        <button className={`${showMeta ? "button-negative" : "button-primary"} margin-small`} onClick={() => setShowMeta(!showMeta)}>
                            {showMeta ? "Hide Meta" : "Show Meta"}
                        </button>
                        {
                            showData &&
                            <div className="padding-sides-small padding-bottom-medium padding-top-small">
                                <div className="flex-row-nowrap overflow-x-auto content-box padding-very-small">
                                    <table className="width100 text-center">
                                        {post.head.map((row, index) =>
                                            <tr>
                                                {row.map((data) =>
                                                    index === 0 ?
                                                        <th className="padding-very-small box">{data}</th> :
                                                        <td className="padding-very-small box">{data}</td>
                                                )}
                                            </tr>
                                        )}
                                    </table>
                                </div>
                            </div>
                        }
                        {
                            showMeta &&
                            <div className="padding-sides-small padding-bottom-medium padding-top-small">
                                <div className="flex-column content-box">
                                    {Object.entries(metas).map(([option, obj]) =>
                                        <div key={option}>
                                            <h2 className="padding-small margin-top-small">{option}</h2>
                                            {obj.map((item) =>
                                                <div key={item.tag} className="flex-row flex-axis-center flex-space-between box-horizontal background-hover padding-small">
                                                    <h4>{item.title}</h4>
                                                    {
                                                        loggedUser.username === post.author.username && !post.public ? (
                                                            item.editable ? (
                                                                item.type === "boolean" && (
                                                                    <button className={`icon-medium ${!item.variable && "icon-error"}`} onClick={() => handlePostMetaUpdate(item.tag, item.variable)}>{item.variable ? <ToggleOn /> : <ToggleOff />}</button>
                                                                )
                                                            ) : (
                                                                    item.type === "boolean" ? (
                                                                        <div className={`icon-medium ${!item.variable && "color-error"}`}>{item.variable ? <ToggleOn /> : <ToggleOff />}</div>
                                                                    ) : (
                                                                            <div className={"padding-sides-small"}>{item.variable}</div>
                                                                        )
                                                                )
                                                        ) : (
                                                                item.type === "boolean" ? (
                                                                    <div className={`icon-medium ${!item.variable && "icon-error"}`}>{item.variable ? <ToggleOn /> : <ToggleOff />}</div>
                                                                ) : (
                                                                        <div className={"padding-sides-small"}>{item.variable}</div>
                                                                    )
                                                            )
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        }
                        <h2 className="padding-small">Description</h2>
                        <div className="content-box margin-very-small">
                            <div className="padding-sides-small padding-vertical-small text-box">
                                {editDescription ?
                                    <div className="flex-column">
                                        <div className="flex-row">
                                            <button className="icon-normal" onClick={() => setEditDescription(false)}><Clear className="icon-secondary" /></button>
                                            <button className="icon-normal" onClick={handleEditDescriptionSubmit}><Save className="icon-secondary" /></button>
                                        </div>
                                        <form className="form-edit-description">
                                            <textarea
                                                onKeyUp={e => handleTextAreaAdjust(e.target)}
                                                onClick={e => handleTextAreaAdjust(e.target)}
                                                placeholder={description}
                                                value={descriptionEdit}
                                                onChange={e => setDescriptionEdit(e.target.value)}
                                            />
                                        </form>
                                    </div> :
                                    <div className="flex-column">
                                        {!post.public &&
                                            <div className="flex-row">
                                                <button className="icon-normal" onClick={() => setEditDescription(true)}><Edit className="icon-secondary" /></button>
                                            </div>
                                        }
                                        <>{text}</>
                                    </div>
                                }
                            </div>
                        </div>
                    </>
                }
            </div>
        )
    }

    const Visualizer = () => {
        const [showingCharts, setShowingCharts] = useState([]);
        const charts = {
            scatter: {
                "title": "Scatter Plot",
                "component": <ScatterPlot postId={id} attrs={post.attrs} />
            }
            //ParallelCoordinatesCanvas
            //distributionplot
            //boxplot
            //pearson correlation matrix
        };

        function handleChartsShowing(e, chart) {
            e.preventDefault();
            var newShowingCharts = [...showingCharts];

            if (newShowingCharts.includes(chart)) {
                newShowingCharts = newShowingCharts.filter(item => item !== chart)
            } else {
                newShowingCharts.push(chart);
            }
            setShowingCharts(newShowingCharts);
        }

        return (
            <div className="content-box margin-very-small">
                {loadingHero ?
                    <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                    <>
                        {Object.entries(charts).map(([option, obj]) =>
                            <button key={option} className={`${showingCharts.includes(option) ? ("button-negative") : "button-primary"} margin-small`} onClick={(e) => handleChartsShowing(e, option)}>{obj.title}</button>
                        )}
                        {
                            showingCharts.length > 0 &&
                            showingCharts.map((chart) =>
                                <div key={chart}>{charts[chart].component}</div>
                            )
                        }
                    </>
                }
            </div>
        )
    }

    // const visualizer = (uuid) => {
    //     return (
    //         <div className="content-box margin-very-small">
    //             <iframe title="iframe-dash" className="iframe-dash" src={`${dashUrl}/${uuid}`}></iframe>
    //         </div>
    //     )
    // }

    const navItems = {
        empty: {
            "name": "empty",
            "url": "/posts/" + id,
            "content": <></>,
            "hide": true
        },
        overview: {
            "name": "Overview",
            "url": "/posts/" + id + "/overview",
            "content": overviewBox(description)
        },
        visualize: {
            "name": "Visualize",
            "url": "/posts/" + id + "/visualize",
            "content": <Visualizer />
        },
        comments: {
            "name": "Comments",
            "url": "/posts/" + id + "/comments",
            "content": <OkaPostComments postId={id} />
        },
        // visualize: {
        //     "name": "Visualize",
        //     "url": "/posts/" + id + "/visualize",
        //     "content": visualizer(post.data_uuid)
        // },        
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
            const resp = await api.post(`downloads/data?pids=${post.id}`);
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

    async function handleEditNameSubmit(e) {
        e.preventDefault()
        const data = {
            name: nameEdit
        }
        try {
            await api.put(`posts/${id}`, data);
            setName(nameEdit);
            setNameEdit(nameEdit);
            setEditName(false);
        } catch (error) {
            notifyError(error);
        }
    }

    async function handleEditDescriptionSubmit(e) {
        e.preventDefault()
        const data = {
            description: descriptionEdit
        }
        try {
            await api.put(`posts/${id}`, data);
            setDescription(descriptionEdit);
            setDescriptionEdit(descriptionEdit);
            setEditDescription(false);
        } catch (error) {
            notifyError(error);
        }
    }

    async function handlePublish() {
        try {
            await api.post(`posts/${id}/publish`);
            NotificationManager.success("Post was successfully published. Now it is available to everyone.", "Publish", 8000)
            const response = await api.get(`posts/${id}`);
            setPost(response.data);
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

    async function handleIconClick(e, postId, data_uuid) {
        e.preventDefault();
        if (postId === null) {
            NotificationManager.info("All histories begin here!", "NoData");
            return
        }

        try {
            const r = await api.get(`sync?cat=data&fetch=false&uuids=${data_uuid}&empty=false`);
            console.log(r)
            if (r.data["has"] === false) {
                NotificationManager.info("This Data was not stored yet!", "NoData");
            } else {
                await api.put(`posts/activate`, { "data_uuid": data_uuid });
                const response = await api.get(`posts/${postId}`);
                setPost(response.data);
                setName(response.data.name);
                setNameEdit(response.data.name);
                setDescription(response.data.description ? response.data.description : '');
                setDescriptionEdit(response.data.description ? response.data.description : '');
                setLoadingHero(false);
                history.push(`/posts/${postId}/overview`);
            }
        } catch (error) {
            notifyError(error);
        }

    }

    async function handleSubmitCollaborator(e, username) {
        e.preventDefault();

        const data = {
            username: username
        }

        try {
            await api.post(`posts/${id}/collaborators`, data);
            setReloadPost(reloadPost + 1);
            NotificationManager.success(`Successfully edited ${username} access.`, "Collaborator", 8000)
            setCollaboratorUsername('');
        } catch (error) {
            notifyError(error);
        }
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

    async function handleRun(e) {
        e.preventDefault();
        const data = {
            category: runCategory,
            algorithm: runAlgorithm,
            parameters: runParameter
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
            setShowAlgorithms(false);
            setShowParameters(false);
        } catch (error) {
            notifyError(error);
        }
    }

    async function handleDeletePost() {
        try {
            await api.delete(`posts/${id}`);
            NotificationManager.success("Post was successfully deleted.", "Delete", 8000);
            setOpenDeletePost(false);
            history.push("/home");
        } catch (error) {
            notifyError(error);
        }
    }

    return (
        <>
            <Modal
                open={openDeletePost}
                onClose={() => setOpenDeletePost(false)}
            >
                <div className="modal padding-big">
                    <h3>Delete post</h3>
                    <h5 className="margin-top-small">You can not undo this action. This dataset will be lost forever.</h5>
                    <button onClick={handleDeletePost} className="button-negative margin-top-small">I want to delete {post.name} forever!</button>
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
                                key={collaborator.username}
                                onClick={(e) => handleSubmitCollaborator(e, collaborator.username)}
                                className={"button-negative margin-very-small"}
                            >
                                {collaborator.username}
                            </button>
                        )
                    }
                    {
                        post.public ?
                            <>
                                <h5>You can share this dataset using the following link</h5>
                                <h5 className="padding-small background-secondary-color-light">{postUrl}</h5>
                            </> :
                            <>
                                <h4 className="margin-top-small bold">Include a new collaborator</h4>
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
                            </>
                    }
                </div>
            </Modal>
            <Modal
                open={openRun}
                onClose={() => setOpenRun(false)}
            >
                <div className="modal padding-big">
                    <h3 className="margin-bottom-small">Run</h3>
                    <form className="flex-column" onSubmit={handleRun}>
                        <h4 className="margin-top-small bold">Select a category</h4>
                        <select onChange={(e) => handleSelectCategory(e)} value={runCategory}>
                            <option value={"select"}>Select</option>
                            {
                                categories.map((category) =>
                                    <option key={category["uuid"]} value={category["uuid"]}>{category["name"]}</option>
                                )
                            }
                        </select>
                        {
                            showAlgorithms &&
                            <>
                                <h4 className="margin-top-small bold">Select the algorithm</h4>
                                <select onChange={(e) => handleSelectAlgorithm(e)} value={runAlgorithm}>
                                    <option value={"select"}>Select</option>
                                    {
                                        categories.map((category) =>
                                            category["algorithms"].map((algorithm) =>
                                                <option key={algorithm["uuid"]} value={algorithm["uuid"]}>{algorithm["name"]}</option>
                                            )
                                        )
                                    }
                                </select>
                            </>
                        }
                        {
                            showAlgorithms && showParameters &&
                            <>
                                <h4 className="margin-top-small bold">Select the parameters</h4>
                                {
                                    categories.map((category) =>
                                        category["algorithms"].map((algorithm) =>
                                            algorithm["parameters"].map((parameter) =>
                                                parameter["values"].length > 1 &&
                                                <div key={parameter["name"]} className="flex-row flex-axis-center flex-space-between">
                                                    <label className="width50" htmlFor={parameter["name"]}>{parameter["name"]}</label>
                                                    {
                                                        parameter["range"] ?
                                                            <input
                                                                className="width50"
                                                                type="number"
                                                                min={parameter["values"][0]}
                                                                max={parameter["values"][1]}
                                                                value={runParameter[parameter["name"]] || ''}
                                                                onChange={e => handleSelectParameter(e, parameter["name"])}
                                                            /> :
                                                            <select className="width50" id={parameter["name"]} onChange={(e) => handleSelectParameter(e, parameter["name"])} value={runParameter[parameter["name"]] || ''}>
                                                                <option value={"select"}>Select</option>
                                                                {
                                                                    parameter["values"].map((value) =>
                                                                        <option key={value} value={value}>{value}</option>
                                                                    )
                                                                }
                                                            </select>
                                                    }
                                                </div>
                                            )
                                        )
                                    )
                                }
                            </>
                        }
                        {
                            showAlgorithms && showParameters && runCategory && runAlgorithm && runParameter &&
                            <button type="submit" className="button-primary margin-top-small">Run</button>
                        }

                    </form>
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
                    <h4 className="margin-top-small bold">Publication Details to be displayed on the published page</h4>
                    <div className="flex-column margin-top-small">
                        <h5>Title: {post.name}</h5>
                        <h5>Author: {post.author && post.author.name}</h5>
                        {
                            post && post.allowed &&
                            <h5>Collaborators:
                                {
                                    post.allowed.map((collaborator, index) =>
                                        <span key={index}> {collaborator.name}{(index !== post.allowed.length - 1) && ","}</span>
                                    )
                                }
                            </h5>
                        }
                    </div>
                    <h4 className="margin-top-small bold color-error">If any of the information above is wrong please correct before proceed</h4>
                    <h4 className="margin-top-small bold">Type {name} bellow to proceed</h4>
                    <input
                        placeholder={name}
                        onChange={e => setPublishConfirmationWord(e.target.value)}
                    />
                    <button onClick={handlePublish} className={`button-primary margin-top-small ${name === publishConfirmationWord ? "active" : "inactive"}`}>I want to make {post.name} of author {post.author && post.author.name} available to everyone forever!</button>
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
                                <button onClick={() => setOpenPublish(true)} className="button-secondary margin-very-small">Publish</button>
                                <button onClick={() => setOpenDeletePost(true)} className="button-negative margin-very-small">Remove</button>
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
                                                        post.history.map((item) =>
                                                            item.data.step.desc.name &&
                                                            <div key={item.id} className="flex-row">
                                                                <button
                                                                    title="Show Dataset" alt="Show Dataset"
                                                                    onClick={(e) => handleIconClick(e, item.post, item.id)}
                                                                    className="box-uuid-history"
                                                                    style={{ backgroundColor: `rgb(${item.data.colors[0][0]}, ${item.data.colors[0][1]}, ${item.data.colors[0][2]})`, border: `var(--border)` }}>
                                                                    <span>&nbsp;</span>
                                                                    {
                                                                        item.data.colors.slice(1).map((color, index) =>
                                                                            <span key={index} style={{ color: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}>{item.id[index]}</span>
                                                                        )
                                                                    }
                                                                </button>
                                                                <div className="flex-column flex-axis-center padding-sides-very-small">
                                                                    <span className="color-tertiary">{item.data.step.desc.name}</span>
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
                                title="Click to copy to clipboard"
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
                        <div className="flex-row flex-axis-center">
                            {editName ?
                                <>
                                    <form className="form-edit-name" onSubmit={handleEditNameSubmit}>
                                        <input
                                            placeholder={name}
                                            value={nameEdit}
                                            onChange={e => setNameEdit(e.target.value)}
                                        />
                                    </form>
                                    <button className="icon-normal" onClick={() => setEditName(false)}><Clear className="icon-secondary" /></button>
                                </> :
                                <>
                                    <h1 className="color-tertiary ellipsis">{name}</h1>
                                    {!post.public &&
                                        <button className="icon-normal" onClick={() => setEditName(true)}><Edit className="icon-secondary" /></button>
                                    }
                                </>
                            }
                        </div>
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
