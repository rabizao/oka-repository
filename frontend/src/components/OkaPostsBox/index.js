import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { CheckBoxOutlineBlank, CheckBox, CloudDownload, Search } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import { saveAs } from 'file-saver';
import TimeAgo from 'timeago-react';

import api from '../../services/api';

export default function OkaPostsBox({ fetch_url }) {
    const [selection, setSelection] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [filter, setFilter] = useState('');
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`${fetch_url}`);
                setPosts(response.data);
                setFilteredPosts(response.data);
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
        fetchData();
    }, [fetch_url])

    function handleSelect(e, post) {
        e.preventDefault();
        var newSelection = [...selection];

        if (newSelection.includes(post.data_uuid)) {
            newSelection = newSelection.filter(item => item !== post.data_uuid);
            if (selectAll) {
                setSelectAll(false);
            }
        } else {
            newSelection.push(post.data_uuid);
            if (newSelection.length >= posts.length) {
                setSelectAll(true);
            }
        }
        setSelection(newSelection);
    }

    function handleSelectAll() {
        if (selectAll) {
            setSelection([])
        } else {
            var newSelection = []
            posts.map((post) => newSelection.push(post.data_uuid));
            setSelection(newSelection);
        }
        setSelectAll(!selectAll);
    }

    async function handleDownload() {
        console.log(selection);

        try {
            var serializedSelection = JSON.stringify(selection);
            serializedSelection = serializedSelection.replace(/","/g, '&uuids=').replace('["', "").replace('"]', "")
            const response = await api.get('/downloads/data?uuids=' + serializedSelection, { responseType: ['blob'] });
            saveAs(response.data, "datasets.zip");
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

    function handleFilter(e) {
        e.preventDefault();
        var newPosts = posts.filter(post => {
            return post.name.toLowerCase().match(filter.toLowerCase());
        });
        setFilteredPosts(newPosts);
    }

    return (
        <div className="content-box margin-very-small">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                <>
                    <div className="flex-row flex-space-between padding-sides-small padding-vertical-small">
                        <div className="flex-row">
                            {
                                filteredPosts.length > 0 ?
                                    <button onClick={() => handleSelectAll()}>
                                        {
                                            selectAll ?
                                                <CheckBox className="icon-primary" /> :
                                                <CheckBoxOutlineBlank className="icon-primary" />
                                        }
                                    </button> :
                                    <h3 className="flex-row flex-axis-center">No results found</h3>
                            }
                            {
                                selection.length > 0 &&
                                <button onClick={() => handleDownload()} className="padding-sides-small">
                                    <CloudDownload className="icon-primary" />
                                </button>
                            }
                        </div>
                        {filteredPosts.length > 0 &&
                            <form className="search-form" onKeyUp={(e) => handleFilter(e)} onSubmit={(e) => handleFilter(e)}>
                                <input
                                    placeholder="Search..."
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                />
                                <button type="submit"><Search className="icon-primary" /></button>
                            </form>
                        }
                    </div>

                    {filteredPosts.map(
                        (post) =>
                            <div key={post.id} className="flex-row box-horizontal background-hover padding-sides-small">
                                <button onClick={(e) => handleSelect(e, post)}>
                                    {
                                        selection.includes(post.data_uuid) ?
                                            <CheckBox className="icon-primary" /> :
                                            <CheckBoxOutlineBlank className="icon-primary" />
                                    }
                                </button>
                                <Link className="flex-row padding-vertical-small width100" to={`/posts/${post.id}/description`}>
                                    <div className="bold padding-sides-small max-width-big">
                                        {post.name}
                                    </div>
                                    <div className="ellipsis padding-sides-small">
                                        {post.description}
                                    </div>
                                    <div className="padding-sides-small">
                                        <TimeAgo className="nowrap" datetime={post.timestamp+'Z'}/>
                                    </div>
                                </Link>
                            </div>
                    )}
                </>
            }
        </div>

    )
}

