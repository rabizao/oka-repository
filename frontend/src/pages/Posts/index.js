import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import './styles.css';

import { NotificationManager } from 'react-notifications';
import { CloudDownload, Favorite, FavoriteBorder, ChevronLeft, ChevronRight, FormatQuote, Share, PlayArrow, Edit, Clear, Save, ToggleOn, ToggleOff } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Markup } from 'interweave';

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
// import ParallelCoordinatesPlot from '../../components/ParallelCoordinatesPlot';
import HistogramPlot from '../../components/HistogramPlot';
// import PearsonCorrelationPlot from '../../components/PearsonCorrelationPlot';
import NotFound from '../NotFound';
import TimeAgo from 'timeago-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';


const categories = {
	evaluation: {
		"name": "Evaluation",
		algorithms: {
			partition: {
				"name": "Partition",
				"parameters": [
					{
						"name": "mode",
						"values": ["cv"] // , "holdout"
					},
					{
						"name": "splits",
						"values": [2, 3, 4, 5, 6, 7, 8, 9, 10]
					},
					{
						"name": "test_size",
						"values": [0.1, 0.2, 0.25, 0.3, 0.3333, 0.4, 0.5],
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
			},
			// split: {
			//     "name": "Split",
			//     "parameters": [
			//         {
			//             "name": "mode",
			//             "values": ["cv", "holdout"]
			//         },
			//         {
			//             "name": "splits",
			//             "values": [2, 3, 4, 5, 6, 7, 8, 9, 10]
			//         },
			//         {
			//             "name": "test_size",
			//             "values": [0.1, 0.2, 0.25, 0.3, 0.3333, 0.4, 0.5]
			//         },
			//         {
			//             "name": "seed",
			//             "values": [0, 100000],
			//             "range": true
			//         },
			//         {
			//             "name": "fields",
			//             "values": ["X,Y"]
			//         }
			//     ]
			// }            
		}
	}
}


const metas = {
	General: [
		{
			title: "Features",
			variable: "number_of_features",
			tag: "features",
			type: "numeric",
			editable: false
		},
		{
			title: "Instances",
			variable: "number_of_instances",
			tag: "instances",
			type: "numeric",
			editable: false
		},
		{
			title: "Targets",
			variable: "number_of_targets",
			tag: "targets",
			type: "numeric",
			editable: false
		},
		{
			title: "Classes",
			variable: "number_of_classes",
			tag: "classes",
			type: "numeric",
			editable: false
		},
	],
	Tasks: [
		{
			title: "Classification",
			variable: "classification",
			tag: "classification",
			type: "boolean",
			editable: true
		},
		{
			title: "Regression",
			variable: "regression",
			tag: "regression",
			type: "boolean",
			editable: true
		},
		{
			title: "Clustering",
			variable: "clustering",
			tag: "clustering",
			type: "boolean",
			editable: true
		},
		{
			title: "Other Tasks",
			variable: "other_tasks",
			tag: "other_tasks",
			type: "boolean",
			editable: true
		}
	],
	Domains: [
		{
			title: "Life Sciences",
			variable: "life_sciences",
			tag: "life_sciences",
			type: "boolean",
			editable: true
		},
		{
			title: "Physical Sciences",
			variable: "physical_sciences",
			tag: "physical_sciences",
			type: "boolean",
			editable: true
		},
		{
			title: "Engineering",
			variable: "engineering",
			tag: "engineering",
			type: "boolean",
			editable: true
		},
		{
			title: "Social",
			variable: "social",
			tag: "social",
			type: "boolean",
			editable: true
		},
		{
			title: "Business",
			variable: "business",
			tag: "business",
			type: "boolean",
			editable: true
		},
		{
			title: "Finances",
			variable: "finances",
			tag: "finances",
			type: "boolean",
			editable: true
		},
		{
			title: "Astronomy",
			variable: "astronomy",
			tag: "astronomy",
			type: "boolean",
			editable: true
		},
		{
			title: "Medical",
			variable: "medical",
			tag: "medical",
			type: "boolean",
			editable: true
		},
		{
			title: "Other Domains",
			variable: "other_domains",
			tag: "other_domains",
			type: "boolean",
			editable: true
		}
	],
	Features: [
		{
			title: "Categorical",
			variable: "categorical",
			tag: "categorical",
			type: "boolean",
			editable: true
		},
		{
			title: "Numerical",
			variable: "numerical",
			tag: "numerical",
			type: "boolean",
			editable: true
		},
		{
			title: "Text",
			variable: "text",
			tag: "text",
			type: "boolean",
			editable: true
		},
		{
			title: "Images",
			variable: "images",
			tag: "images",
			type: "boolean",
			editable: true
		},
		{
			title: "Time Series",
			variable: "time_series",
			tag: "time_series",
			type: "boolean",
			editable: true
		},
		{
			title: "Other Features",
			variable: "other_features",
			tag: "other_features",
			type: "boolean",
			editable: true
		}
	]
}


export default function Posts() {
	let params = useParams();
	const id = params.id;
	const section = params.section ? params.section : "empty";
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [render, setRender] = useState(0);
	const [accessDenied, setAccessDenied] = useState(false);
	const [post, setPost] = useState({});
	const [editName, setEditName] = useState(false);
	const [editDescription, setEditDescription] = useState(false);
	const [openCite, setOpenCite] = useState(false);
	const [openDeletePost, setOpenDeletePost] = useState(false);
	const [openShare, setOpenShare] = useState(false);
	const [collaboratorUsername, setCollaboratorUsername] = useState('');
	const [openPublish, setOpenPublish] = useState(false);
	const [openRun, setOpenRun] = useState(false);
	const [openOperationDescription, setOpenOperationDescription] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [showMeta, setShowMeta] = useState(false);
	const [showFields, setShowFields] = useState(false);
	const [metaSet, setMetaSet] = useState([]);
	const [showData, setShowData] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [operationCode, setOperationCode] = useState('');
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
	const navigate = useNavigate();

	useEffect(() => {
		async function fetchPost() {
			try {
				const response = await api.get(`posts/${id}`);
				setPost(response.data);
				setName(response.data.name);
				setNameEdit(response.data.name);
				setDescription(response.data.description ? response.data.description : '');
				setDescriptionEdit(response.data.description ? response.data.description : '');
				setError(false);
				handleSetMetas(response.data);
			} catch (error) {
				setError(true);
				const resp = notifyError(error, false);
				if (resp.accessDenied) {
					setAccessDenied(true);
				}
			} finally {
				setLoading(false);
			}
		}
		fetchPost();
	}, [id, reloadPost, render])

	const textBox = (text) => {
		return (
			<div className="content-box margin-very-very-small">
				{loading ?
					<div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :

					error ?
						<div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
							<div className="margin-sides-verysmall">Problem loading, try to </div>
							<button className="button-primary" onClick={handleReload}>Reload</button>
						</div> :

						<div className="flex-row padding-sides-small padding-vertical-small text-box">
							{text}
						</div>
				}
			</div>
		)
	}

	function handleSetMetas(p) {
		var metasSet = [];
		Object.entries(metas).map(([, obj]) =>
			obj.map((item) =>
				item.editable && (p[item.variable] && metasSet.push(item.tag))
			)
		)
		setMetaSet(metasSet);
	}

	async function handlePostMetaUpdate(tag, state) {

		const data = {
			[tag]: !state
		}

		try {
			await api.put(`posts/${id}`, data);
			var newPost = { ...post };
			newPost[tag] = !state;
			setPost(newPost);
			handleSetMetas(newPost)
		} catch (error) {
			notifyError(error);
		}
	}

	function handleReload() {
		setRender(render + 1);
		setLoading(true);
	}

	const overviewBox = (text) => {

		return (
			<div className="content-box margin-very-very-small">
				{loading ?
					<div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :

					error ?
						<div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
							<div className="margin-sides-verysmall">Problem loading, try to </div>
							<button className="button-primary" onClick={handleReload}>Reload</button>
						</div> :
						<>
							<button className={`${showFields ? "button-negative" : "button-primary"} margin-very-very-small`} onClick={() => setShowFields(!showFields)}>
								{showFields ? "Hide Fields" : "Show Fields"}
							</button>
							<button className={`${showData ? "button-negative" : "button-primary"} margin-very-very-small`} onClick={() => setShowData(!showData)}>
								{showData ? "Hide Data" : "Show Data"}
							</button>
							<button className={`${showMeta ? "button-negative" : "button-primary"} margin-very-very-small`} onClick={() => setShowMeta(!showMeta)}>
								{showMeta ? "Hide Meta" : "Show Meta"}
							</button>
							{
								showFields &&
								<div className="padding-sides-small padding-bottom-medium padding-top-small">
									<div className="content-box padding-small">
										<h2 className="padding-small">Fields</h2>
										<div className="margin-top-small">
											{
												post.fields.map((field, index) =>
													<span key={index}> {field}{(index !== post.fields.length - 1) && ", "}</span>
												)
											}
										</div>
									</div>
								</div>
							}
							{
								showData &&
								<div className="padding-sides-small padding-bottom-medium padding-top-small">
									<div className="content-box padding-small">
										<h4>Showing the first 10 rows and columns (field X and field Y)</h4>
										<div className="flex-row-nowrap overflow-x-auto">
											<table className="width100 text-center">
												<tbody>
													{post.head.map((row, index) =>
														<tr key={index}>
															{row.map((data, index2) =>
																index === 0 ?
																	<th key={index2} className="padding-very-small box">{data}</th> :
																	<td key={index2} className="padding-very-small box">{data}</td>
															)}
														</tr>
													)}
												</tbody>
											</table>
										</div>
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
																		<button className={`icon-medium ${!post[item.variable] ? "icon-error": undefined}`} onClick={() => handlePostMetaUpdate(item.tag, post[item.variable])}>{post[item.variable] ? <ToggleOn /> : <ToggleOff />}</button>
																	)
																) : (
																	item.type === "boolean" ? (
																		<div className={`icon-medium ${!post[item.variable] ? "color-error": undefined}`}>{post[item.variable] ? <ToggleOn /> : <ToggleOff />}</div>
																	) : (
																		<div className={"padding-sides-small"}>{post[item.variable]}</div>
																	)
																)
															) : (
																item.type === "boolean" ? (
																	<div className={`icon-medium ${!post[item.variable] ? "icon-error": undefined}`}>{post[item.variable] ? <ToggleOn /> : <ToggleOff />}</div>
																) : (
																	<div className="padding-sides-small">{post[item.variable]}</div>
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
							<div className="content-box margin-very-very-small">
								<div className="padding-sides-small padding-vertical-small">
									{editDescription ?

										<div className="flex-column text-box">
											<div className="flex-row">
												<button className="icon-normal" onClick={() => setEditDescription(false)}><Clear className="icon-secondary" /></button>
												<button className="icon-normal" onClick={handleEditDescriptionSubmit}><Save className="icon-secondary" /></button>
											</div>
											<ReactQuill
												modules={{
													toolbar: [
														[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
														['bold', 'italic', 'underline'],
														['blockquote', 'code-block'],
														[{ 'script': 'sub' }, { 'script': 'super' }],
														['link', 'image', 'video'],
														[{ 'indent': '-1' }, { 'indent': '+1' }],
														[{ 'list': 'ordered' }, { 'list': 'bullet' }],
														[{ 'direction': 'rtl' }],
														['clean']
													]
												}}
												theme="snow"
												value={descriptionEdit}
												toolbarOptions={{}}
												onChange={setDescriptionEdit}
											/>
										</div> :
										<div className="flex-column">
											{!post.public &&
												<div className="flex-row">
													<button className="icon-normal" onClick={() => setEditDescription(true)}><Edit className="icon-secondary" /></button>
												</div>
											}
											<Markup content={text} />
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
				"title": "Scatter",
				"component": <ScatterPlot postId={id} attrs={post.attrs} />
			},
			histogram: {
				"title": "Histogram",
				"component": <HistogramPlot postId={id} attrs={post.attrs} />
			},
			// parallelcoordinates: {
			//     "title": "Parallel Coordinates",
			//     "component": <ParallelCoordinatesPlot postId={id} attrs={post.attrs} />
			// },
			// pearsoncorrelation: {
			//     "title": "Pearson Correlation",
			//     "component": <PearsonCorrelationPlot postId={id} attrs={post.attrs} />
			// }
			//boxplot
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
			<div className="content-box margin-very-very-small">
				{loading ?
					<div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :

					error ?
						<div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
							<div className="margin-sides-verysmall">Problem loading, try to </div>
							<button className="button-primary" onClick={handleReload}>Reload</button>
						</div> :
						<>
							{Object.entries(charts).map(([option, obj]) =>
								<button key={option} className={`${showingCharts.includes(option) ? ("button-negative") : "button-primary"} margin-very-very-small`} onClick={(e) => handleChartsShowing(e, option)}>{obj.title}</button>
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
			const resp = await api.post(`downloads/posts?ids=${post.id}`);
			var newTasks = { ...runningTasksBar.tasks };
			newTasks[resp.data.id] = {
				description: "Starting..."
			};
			runningTasksBar.setTasks(newTasks);
			runningTasksBar.setActive(true);
			notificationsContext.isWaitingDownload.current = true;
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
			if (r.data["has"] === false) {
				NotificationManager.info("This Data has not been stored yet!", "NoData");
			} else {
				await api.put(`posts/activate`, { "data_uuid": data_uuid });
				const response = await api.get(`posts/${postId}`);
				setPost(response.data);
				setName(response.data.name);
				setNameEdit(response.data.name);
				setDescription(response.data.description ? response.data.description : '');
				setDescriptionEdit(response.data.description ? response.data.description : '');
				setLoading(false);
				navigate(`/posts/${postId}/overview`);
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
		} catch (error) {
			notifyError(error);
		}
	}

	async function handleDeletePost() {
		try {
			await api.delete(`posts/${id}`);
			NotificationManager.success("Post was successfully deleted.", "Delete", 8000);
			setOpenDeletePost(false);
			navigate("/home");
		} catch (error) {
			notifyError(error);
		}
	}

	function handleOperationClick(operation) {
		setOpenOperationDescription(true);
		setOperationCode(operation.code);
	}

	return (
		loading ?
			<div className="flex-row flex-crossaxis-center"><CircularProgress className="icon-primary" /></div> :
			accessDenied ?
				<NotFound /> :
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
										className={"button-negative margin-very-very-small"}
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
								<select onChange={(e) => setRunCategory(e.target.value)} value={runCategory}>
									<option>Select</option>
									{
										Object.entries(categories).map(([category, value]) =>
											<option key={category} value={category}>{value["name"]}</option>
										)
									}
								</select>
								{
									runCategory && categories[runCategory] &&
									<>
										<h4 className="margin-top-small bold">Select the algorithm</h4>
										<select onChange={(e) => setRunAlgorithm(e.target.value)} value={runAlgorithm}>
											<option>Select</option>
											{
												Object.entries(categories[runCategory]["algorithms"]).map(([algorithm, value]) =>
													<option key={algorithm} value={algorithm}>{value["name"]}</option>
												)
											}
										</select>
									</>
								}
								{
									runCategory && runAlgorithm && categories[runCategory] && categories[runCategory]["algorithms"][runAlgorithm] &&
									<>
										<h4 className="margin-top-small bold">Select the parameters</h4>
										{
											categories[runCategory]["algorithms"][runAlgorithm]["parameters"].map((parameter) =>
												parameter["values"].length > 1 &&
												<div key={parameter["name"]}>
													<div className="flex-row flex-axis-center flex-space-between">
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
																	<option>Select</option>
																	{
																		parameter["values"].map((value) =>
																			value.constructor === Object ?
																				Object.entries(value).map(([name, _]) =>
																					<option key={name} value={name}>{name}</option>
																				) :
																				<option key={value} value={value}>{value}</option>
																		)
																	}
																</select>
														}

													</div>

													{
														parameter["values"].map((value) =>
															value.constructor === Object &&
															Object.entries(value).map(([name, nestedArray]) =>
																name === runParameter[parameter["name"]] &&
																nestedArray.map((nestedParameter) =>
																	nestedParameter["values"].length > 1 &&
																	<div key={nestedParameter["name"]}>
																		<div className="flex-row flex-axis-center flex-space-between">
																			<label className="width50" htmlFor={nestedParameter["name"]}>{nestedParameter["name"]}</label>
																			{
																				parameter["range"] ?
																					<input
																						className="width50"
																						type="number"
																						min={nestedParameter["values"][0]}
																						max={nestedParameter["values"][1]}
																						value={runParameter[nestedParameter["name"]] || ''}
																						onChange={e => handleSelectParameter(e, nestedParameter["name"])}
																					/> :
																					<select className="width50" id={nestedParameter["name"]} onChange={(e) => handleSelectParameter(e, nestedParameter["name"])} value={runParameter[nestedParameter["name"]] || ''}>
																						<option>Select</option>
																						{
																							nestedParameter["values"].map((value) =>
																								value.constructor === Object ?
																									Object.entries(value).map(([name, _]) =>
																										<option key={name} value={name}>{name}</option>
																									) :
																									<option key={value} value={value}>{value}</option>
																							)
																						}
																					</select>
																			}
																		</div>
																	</div>
																)

															)
														)
													}



												</div>
											)
										}
									</>
								}
								{
									runCategory && runAlgorithm && runParameter &&
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
							<h3>Publish your dataset</h3>
							<h5 className="margin-top-small"><span className="color-error bold">You can not undo this action.</span> Please note that after publishing your dataset it will be available to everyone forever. If you want to make this dataset available to a specific group of people please use share button instead.
							</h5>
							<h4 className="margin-top-small bold">Publication Details to be displayed on the published page</h4>
							<div className="flex-column">
								<h5>Title: {post.name}</h5>
								<h5>Author: {post.author && post.author.name}</h5>
								{
									post && post.allowed && post.allowed.length > 0 &&
									<h5>Collaborators:
										{
											post.allowed.map((collaborator, index) =>
												<span key={index}> {collaborator.name}{(index !== post.allowed.length - 1) && ", "}</span>
											)
										}
									</h5>
								}
							</div>
							<h4 className="margin-top-small bold">Metafeatures to be used in the dataset search</h4>
							{
								post &&
								<h5>
									{
										metaSet.length > 0 ?
											metaSet.map((meta, index) =>
												<span key={index}>{meta}{(index !== metaSet.length - 1) && ", "}</span>) :
											<span className="color-error bold">No metafeatures set so far. Please set then before publish. To do so go to overview tab and click on "Show Meta" button.</span>
									}
								</h5>
							}

							{
								post && (
									(metaSet.length >= 3 && metaSet.length <= 5) ?
										(
											<>
												<h4 className="margin-top-small bold color-error">If any of the information above is wrong please correct before proceed</h4>
												<h4 className="margin-top-small bold">Type {name} bellow to proceed</h4>
												<input
													placeholder={name}
													onChange={e => setPublishConfirmationWord(e.target.value)}
												/>
												<button onClick={handlePublish} className={`button-primary margin-top-small ${name === publishConfirmationWord ? "active" : "inactive"}`}>I want to make {post.name} of author {post.author && post.author.name} available to everyone forever!</button>
											</>
										) :
										<h5 className="color-error bold">Please provide minimum 3 and maximum 5 metafeatures before proceed.</h5>
								)
							}


						</div>
					</Modal>
					<Modal
						open={openOperationDescription}
						onClose={() => setOpenOperationDescription(false)}
					>
						<div className="modal padding-big" style={{ maxWidth: "100%" }}>
							<h3 className="margin-bottom-small">Operation Function</h3>
							{
								operationCode ?
									<SyntaxHighlighter language="python" style={docco}>
										{operationCode}
									</SyntaxHighlighter> :
									"Code not provided."
							}
						</div>
					</Modal>
					<OkaHeader />
					<div className="oka-hero-background padding-sides-small padding-top-big">
						{loading ?
							<div className="flex-row flex-crossaxis-center"><CircularProgress className="icon-tertiary" /></div> :

							error ?
								<div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
									<div className="margin-sides-verysmall color-tertiary">Problem loading, try to </div>
									<button className="button-secondary" onClick={handleReload}>Reload</button>
								</div> :
								<>
									{
										!post.public && post.author && post.author.username === loggedUser.username &&
										<div className="flex-row flex-crossaxis-center">
											<button onClick={() => setOpenPublish(true)} className="button-secondary margin-very-very-small">Publish</button>
											<button onClick={() => setOpenDeletePost(true)} className="button-negative margin-very-very-small">Remove</button>
										</div>
									}

									<div className="flex-row-nowrap flex-axis-center overflow-x-auto margin-top-small">
										{
											post.history.length > 0 &&
											(
												showHistory ?
													<>
														<button className="margin-very-very-small icon-medium" title="Hide History" onClick={() => setShowHistory(!showHistory)}><ChevronLeft className="icon-tertiary" /></button>
														{
															post.history.map((item) =>
																// item.data.step.desc.name &&
																<div key={item.id} className="flex-row-nowrap">
																	<button
																		title="Show Dataset" alt="Show Dataset"
																		onClick={(e) => handleIconClick(e, item.post, item.id)}
																		className="box-uuid-history"
																		style={{ backgroundColor: `rgb(${item.rgb[0][0]}, ${item.rgb[0][1]}, ${item.rgb[0][2]})`, border: `var(--border)` }}
																	>
																		{
																			item.rgb.slice(1).map((color, index) =>
																				<span key={index} style={{ color: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}>{item.id[index]}</span>
																			)
																		}
																	</button>
																	<button onClick={() => handleOperationClick(item)}>
																		<div className="flex-column flex-axis-center padding-sides-very-small" title={item.metadata}>
																			{/* <span className="color-tertiary">{item.data.step.desc.name}</span> */}
																			<span className="color-tertiary">{item.name}</span>
																			<span className="color-tertiary">→</span>
																		</div>
																	</button>
																</div>
															)
														}
													</> :
													<button className="margin-very-very-small icon-medium" title="Expand History" onClick={() => setShowHistory(!showHistory)}><ChevronRight className="icon-tertiary" /></button>
											)
										}
										<div className="flex-row-nowrap">
											<button
												onClick={(e) => copyToClipboard(e, post.data_uuid)}
												title="Click to copy to clipboard"
												className="box-uuid"
												style={{ backgroundColor: `rgb(${post.data_uuid_colors[0][0]}, ${post.data_uuid_colors[0][1]}, ${post.data_uuid_colors[0][2]})`, border: `var(--border)` }}
											>
												{
													post.data_uuid_colors.slice(1).map((color, index) =>
														<span key={index} style={{ color: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}>{post.data_uuid[index]}</span>
													)
												}
											</button>
										</div>
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
										<h6 className="color-tertiary margin-left-small">{post.public ? "Public" : "Private"}</h6>
									</div>
									<h6 className="color-tertiary">OID: <span className="font-courier color-tertiary">{post.data_uuid}</span></h6>
									<h6 className="color-tertiary">uploaded by {post.author.name} - <Link className="color-tertiary link-underline" to={`/users/${post.author.username}/uploads`}>{post.author.username}</Link></h6>
									<h6 className="color-tertiary">{post.downloads} downloads | {post.favorites.length} favorited</h6>
									{post.public && <h6 className="color-tertiary">Published {<TimeAgo className="color-tertiary" datetime={post.publish_timestamp + 'Z'} />}</h6>}
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
