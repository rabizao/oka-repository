import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';

import './styles.css';

import { NotificationManager } from 'react-notifications';
import { CloudDownload, Favorite, FavoriteBorder, ChevronLeft, ChevronRight, FormatQuote, Share, PlayArrow } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import { saveAs } from 'file-saver';
import { ResponsiveScatterPlot } from '@nivo/scatterplot'

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaPostComments from '../../components/OkaPostComments';
import OkaPostsBox from '../../components/OkaPostsBox';
import api, { downloadsUrl } from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';
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


const data = [
    {
        "id": "group A",
        "data": [
            {
                "x": 37,
                "y": 94
            },
            {
                "x": 66,
                "y": 20
            },
            {
                "x": 7,
                "y": 88
            },
            {
                "x": 14,
                "y": 115
            },
            {
                "x": 96,
                "y": 41
            },
            {
                "x": 22,
                "y": 86
            },
            {
                "x": 38,
                "y": 34
            },
            {
                "x": 97,
                "y": 101
            },
            {
                "x": 31,
                "y": 90
            },
            {
                "x": 27,
                "y": 63
            },
            {
                "x": 0,
                "y": 111
            },
            {
                "x": 0,
                "y": 42
            },
            {
                "x": 51,
                "y": 35
            },
            {
                "x": 57,
                "y": 107
            },
            {
                "x": 42,
                "y": 7
            },
            {
                "x": 90,
                "y": 72
            },
            {
                "x": 80,
                "y": 110
            },
            {
                "x": 73,
                "y": 18
            },
            {
                "x": 72,
                "y": 20
            },
            {
                "x": 85,
                "y": 22
            },
            {
                "x": 40,
                "y": 61
            },
            {
                "x": 93,
                "y": 60
            },
            {
                "x": 57,
                "y": 90
            },
            {
                "x": 12,
                "y": 92
            },
            {
                "x": 48,
                "y": 38
            },
            {
                "x": 27,
                "y": 86
            },
            {
                "x": 69,
                "y": 90
            },
            {
                "x": 17,
                "y": 64
            },
            {
                "x": 70,
                "y": 24
            },
            {
                "x": 61,
                "y": 38
            },
            {
                "x": 10,
                "y": 120
            },
            {
                "x": 66,
                "y": 119
            },
            {
                "x": 1,
                "y": 5
            },
            {
                "x": 14,
                "y": 23
            },
            {
                "x": 37,
                "y": 49
            },
            {
                "x": 32,
                "y": 16
            },
            {
                "x": 51,
                "y": 42
            },
            {
                "x": 60,
                "y": 5
            },
            {
                "x": 16,
                "y": 64
            },
            {
                "x": 67,
                "y": 42
            },
            {
                "x": 62,
                "y": 45
            },
            {
                "x": 7,
                "y": 106
            },
            {
                "x": 100,
                "y": 113
            },
            {
                "x": 92,
                "y": 101
            },
            {
                "x": 70,
                "y": 28
            },
            {
                "x": 63,
                "y": 93
            },
            {
                "x": 64,
                "y": 62
            },
            {
                "x": 22,
                "y": 2
            },
            {
                "x": 26,
                "y": 50
            },
            {
                "x": 15,
                "y": 65
            }
        ]
    },
    {
        "id": "group B",
        "data": [
            {
                "x": 94,
                "y": 48
            },
            {
                "x": 53,
                "y": 113
            },
            {
                "x": 19,
                "y": 77
            },
            {
                "x": 63,
                "y": 41
            },
            {
                "x": 72,
                "y": 74
            },
            {
                "x": 55,
                "y": 43
            },
            {
                "x": 48,
                "y": 89
            },
            {
                "x": 57,
                "y": 45
            },
            {
                "x": 98,
                "y": 36
            },
            {
                "x": 78,
                "y": 94
            },
            {
                "x": 35,
                "y": 10
            },
            {
                "x": 16,
                "y": 34
            },
            {
                "x": 17,
                "y": 10
            },
            {
                "x": 0,
                "y": 92
            },
            {
                "x": 100,
                "y": 31
            },
            {
                "x": 23,
                "y": 55
            },
            {
                "x": 36,
                "y": 52
            },
            {
                "x": 47,
                "y": 79
            },
            {
                "x": 33,
                "y": 26
            },
            {
                "x": 8,
                "y": 50
            },
            {
                "x": 20,
                "y": 55
            },
            {
                "x": 51,
                "y": 91
            },
            {
                "x": 34,
                "y": 4
            },
            {
                "x": 23,
                "y": 43
            },
            {
                "x": 31,
                "y": 39
            },
            {
                "x": 28,
                "y": 16
            },
            {
                "x": 46,
                "y": 46
            },
            {
                "x": 38,
                "y": 69
            },
            {
                "x": 17,
                "y": 114
            },
            {
                "x": 12,
                "y": 28
            },
            {
                "x": 22,
                "y": 114
            },
            {
                "x": 45,
                "y": 53
            },
            {
                "x": 24,
                "y": 89
            },
            {
                "x": 65,
                "y": 0
            },
            {
                "x": 39,
                "y": 102
            },
            {
                "x": 14,
                "y": 95
            },
            {
                "x": 3,
                "y": 26
            },
            {
                "x": 48,
                "y": 81
            },
            {
                "x": 0,
                "y": 120
            },
            {
                "x": 92,
                "y": 17
            },
            {
                "x": 37,
                "y": 76
            },
            {
                "x": 7,
                "y": 52
            },
            {
                "x": 60,
                "y": 13
            },
            {
                "x": 13,
                "y": 79
            },
            {
                "x": 60,
                "y": 77
            },
            {
                "x": 43,
                "y": 46
            },
            {
                "x": 58,
                "y": 35
            },
            {
                "x": 38,
                "y": 54
            },
            {
                "x": 87,
                "y": 55
            },
            {
                "x": 99,
                "y": 59
            }
        ]
    },
    {
        "id": "group C",
        "data": [
            {
                "x": 76,
                "y": 46
            },
            {
                "x": 62,
                "y": 42
            },
            {
                "x": 79,
                "y": 55
            },
            {
                "x": 30,
                "y": 34
            },
            {
                "x": 76,
                "y": 103
            },
            {
                "x": 31,
                "y": 68
            },
            {
                "x": 8,
                "y": 56
            },
            {
                "x": 21,
                "y": 65
            },
            {
                "x": 19,
                "y": 20
            },
            {
                "x": 2,
                "y": 46
            },
            {
                "x": 26,
                "y": 113
            },
            {
                "x": 96,
                "y": 113
            },
            {
                "x": 42,
                "y": 6
            },
            {
                "x": 52,
                "y": 54
            },
            {
                "x": 22,
                "y": 35
            },
            {
                "x": 92,
                "y": 90
            },
            {
                "x": 52,
                "y": 54
            },
            {
                "x": 8,
                "y": 47
            },
            {
                "x": 61,
                "y": 115
            },
            {
                "x": 55,
                "y": 82
            },
            {
                "x": 98,
                "y": 49
            },
            {
                "x": 60,
                "y": 99
            },
            {
                "x": 46,
                "y": 7
            },
            {
                "x": 36,
                "y": 49
            },
            {
                "x": 89,
                "y": 116
            },
            {
                "x": 45,
                "y": 120
            },
            {
                "x": 27,
                "y": 79
            },
            {
                "x": 66,
                "y": 1
            },
            {
                "x": 93,
                "y": 75
            },
            {
                "x": 95,
                "y": 31
            },
            {
                "x": 75,
                "y": 14
            },
            {
                "x": 59,
                "y": 5
            },
            {
                "x": 51,
                "y": 77
            },
            {
                "x": 74,
                "y": 37
            },
            {
                "x": 32,
                "y": 20
            },
            {
                "x": 89,
                "y": 3
            },
            {
                "x": 42,
                "y": 94
            },
            {
                "x": 56,
                "y": 31
            },
            {
                "x": 12,
                "y": 114
            },
            {
                "x": 46,
                "y": 24
            },
            {
                "x": 89,
                "y": 68
            },
            {
                "x": 28,
                "y": 71
            },
            {
                "x": 77,
                "y": 89
            },
            {
                "x": 82,
                "y": 113
            },
            {
                "x": 55,
                "y": 5
            },
            {
                "x": 46,
                "y": 107
            },
            {
                "x": 88,
                "y": 47
            },
            {
                "x": 78,
                "y": 22
            },
            {
                "x": 87,
                "y": 67
            },
            {
                "x": 100,
                "y": 39
            }
        ]
    },
    {
        "id": "group D",
        "data": [
            {
                "x": 63,
                "y": 10
            },
            {
                "x": 17,
                "y": 25
            },
            {
                "x": 28,
                "y": 102
            },
            {
                "x": 45,
                "y": 14
            },
            {
                "x": 81,
                "y": 117
            },
            {
                "x": 75,
                "y": 102
            },
            {
                "x": 37,
                "y": 19
            },
            {
                "x": 57,
                "y": 84
            },
            {
                "x": 90,
                "y": 49
            },
            {
                "x": 39,
                "y": 33
            },
            {
                "x": 52,
                "y": 56
            },
            {
                "x": 72,
                "y": 46
            },
            {
                "x": 1,
                "y": 95
            },
            {
                "x": 64,
                "y": 77
            },
            {
                "x": 0,
                "y": 107
            },
            {
                "x": 71,
                "y": 15
            },
            {
                "x": 58,
                "y": 105
            },
            {
                "x": 94,
                "y": 62
            },
            {
                "x": 50,
                "y": 66
            },
            {
                "x": 90,
                "y": 43
            },
            {
                "x": 3,
                "y": 63
            },
            {
                "x": 66,
                "y": 33
            },
            {
                "x": 68,
                "y": 81
            },
            {
                "x": 29,
                "y": 102
            },
            {
                "x": 96,
                "y": 87
            },
            {
                "x": 31,
                "y": 99
            },
            {
                "x": 63,
                "y": 52
            },
            {
                "x": 78,
                "y": 34
            },
            {
                "x": 53,
                "y": 87
            },
            {
                "x": 79,
                "y": 93
            },
            {
                "x": 83,
                "y": 32
            },
            {
                "x": 87,
                "y": 51
            },
            {
                "x": 5,
                "y": 96
            },
            {
                "x": 62,
                "y": 77
            },
            {
                "x": 84,
                "y": 8
            },
            {
                "x": 80,
                "y": 25
            },
            {
                "x": 32,
                "y": 52
            },
            {
                "x": 58,
                "y": 25
            },
            {
                "x": 74,
                "y": 78
            },
            {
                "x": 4,
                "y": 33
            },
            {
                "x": 39,
                "y": 48
            },
            {
                "x": 46,
                "y": 32
            },
            {
                "x": 13,
                "y": 43
            },
            {
                "x": 38,
                "y": 64
            },
            {
                "x": 99,
                "y": 47
            },
            {
                "x": 73,
                "y": 27
            },
            {
                "x": 70,
                "y": 25
            },
            {
                "x": 88,
                "y": 80
            },
            {
                "x": 59,
                "y": 25
            },
            {
                "x": 25,
                "y": 24
            }
        ]
    },
    {
        "id": "group E",
        "data": [
            {
                "x": 58,
                "y": 97
            },
            {
                "x": 46,
                "y": 113
            },
            {
                "x": 49,
                "y": 50
            },
            {
                "x": 54,
                "y": 100
            },
            {
                "x": 49,
                "y": 19
            },
            {
                "x": 38,
                "y": 25
            },
            {
                "x": 73,
                "y": 113
            },
            {
                "x": 76,
                "y": 19
            },
            {
                "x": 82,
                "y": 62
            },
            {
                "x": 3,
                "y": 113
            },
            {
                "x": 4,
                "y": 36
            },
            {
                "x": 86,
                "y": 62
            },
            {
                "x": 39,
                "y": 87
            },
            {
                "x": 51,
                "y": 13
            },
            {
                "x": 59,
                "y": 66
            },
            {
                "x": 75,
                "y": 32
            },
            {
                "x": 36,
                "y": 81
            },
            {
                "x": 63,
                "y": 1
            },
            {
                "x": 84,
                "y": 9
            },
            {
                "x": 98,
                "y": 68
            },
            {
                "x": 54,
                "y": 62
            },
            {
                "x": 15,
                "y": 12
            },
            {
                "x": 23,
                "y": 28
            },
            {
                "x": 83,
                "y": 84
            },
            {
                "x": 19,
                "y": 5
            },
            {
                "x": 61,
                "y": 94
            },
            {
                "x": 12,
                "y": 40
            },
            {
                "x": 63,
                "y": 34
            },
            {
                "x": 46,
                "y": 15
            },
            {
                "x": 72,
                "y": 0
            },
            {
                "x": 3,
                "y": 84
            },
            {
                "x": 74,
                "y": 84
            },
            {
                "x": 67,
                "y": 58
            },
            {
                "x": 41,
                "y": 43
            },
            {
                "x": 93,
                "y": 88
            },
            {
                "x": 10,
                "y": 80
            },
            {
                "x": 22,
                "y": 50
            },
            {
                "x": 64,
                "y": 70
            },
            {
                "x": 71,
                "y": 66
            },
            {
                "x": 44,
                "y": 29
            },
            {
                "x": 85,
                "y": 94
            },
            {
                "x": 79,
                "y": 113
            },
            {
                "x": 27,
                "y": 56
            },
            {
                "x": 91,
                "y": 8
            },
            {
                "x": 65,
                "y": 48
            },
            {
                "x": 99,
                "y": 24
            },
            {
                "x": 25,
                "y": 25
            },
            {
                "x": 27,
                "y": 36
            },
            {
                "x": 45,
                "y": 58
            },
            {
                "x": 72,
                "y": 86
            }
        ]
    }
]

export default function Posts(props) {
    const id = props.match.params.id;
    const section = props.match.params.section;
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

    const Stats = (datas) => {

        return (
            <div className="content-box margin-very-small padding-bottom-big" style={{ height: "400px" }}>
                <ResponsiveScatterPlot
                    data={data}
                    margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
                    xScale={{ type: 'linear', min: 0, max: 'auto' }}
                    xFormat={function (e) { return e + " kg" }}
                    yScale={{ type: 'linear', min: 0, max: 'auto' }}
                    yFormat={function (e) { return e + " cm" }}
                    blendMode="multiply"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'weight',
                        legendPosition: 'middle',
                        legendOffset: 46
                    }}
                    axisLeft={{
                        orient: 'left',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'size',
                        legendPosition: 'middle',
                        legendOffset: -60
                    }}
                    legends={[
                        {
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 130,
                            translateY: 0,
                            itemWidth: 100,
                            itemHeight: 12,
                            itemsSpacing: 5,
                            itemDirection: 'left-to-right',
                            symbolSize: 12,
                            symbolShape: 'circle',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                />
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
            "content": <Stats data={data} />
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
                    notifyError(error);
                    clearInterval(status);
                }
            }, 1000);
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
            var status = setInterval(async function () {
                try {
                    const response = await api.get(`tasks/${resp.data}/status`);
                    if (response.data.status === "done") {
                        NotificationManager.success(`Your simulation have just finished.`, "Run", 8000)
                        clearInterval(status);
                    }
                } catch (error) {
                    notifyError(error);
                    clearInterval(status);
                }
            }, 1000);
            NotificationManager.success(`Your simulation have just started.`, "Run", 8000)
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
                                                            <div key={transformation.id} className="flex-row">
                                                                <button onClick={(e) => handleCreatePost(e, transformation.label)} className="flex-column flex-crossaxis-center padding-right-very-small">
                                                                    <img height="40px" src={`${downloadsUrl}${transformation.avatar}`} title="Show Dataset" alt="Show Dataset" />
                                                                </button>
                                                                <div className="flex-column flex-axis-center padding-right-very-small">
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
                                className="box-square-medium padding-very-small ellipsis-n font-uuid"
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
            {section in navItems ? <>{navItems[section].content}</> : textBox("Section not found.")}
        </>
    )
}
