import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';

import './styles.css';

import { NotificationManager } from 'react-notifications';
import { CloudDownload, Favorite, FavoriteBorder, Help } from '@material-ui/icons';
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
                                    <img height="100px" src={`${downloadsUrl}${post.data_uuid}.jpg`} title="Copy to clipboard" alt="Copy to clipboard" />
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
                                                        <img height="40px" src={`${downloadsUrl}${transformation.avatar}`} title="Show Dataset" alt="Show Dataset" />
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
