import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import { CheckBoxOutlineBlank, CheckBox, CloudDownload, Search } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';

import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

export default function OkaPostsBox({ section, navItems, loading, setLoading }) {
    const [selection, setSelection] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [filter, setFilter] = useState('');
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);

    const user = useContext(LoginContext);

    useEffect(() => {
        async function fetchData() {
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (section in navItems) {
                try {
                    const response = await api.get(`${navItems[section].fetch_url}`);
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
        }
        fetchData();
        // eslint-disable-next-line
    }, [section, setLoading, user.username])

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

    function handleDownload() {
        console.log(selection);
    }

    function handleFilter(e) {
        e.preventDefault();
        var newPosts = posts.filter(post => {
            return post.name.toLowerCase().match(filter.toLowerCase());
        });
        setFilteredPosts(newPosts);
    }

    return (
        <div className="content-box">
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
                        <form className="search-form" onKeyUp={(e) => handleFilter(e)} onSubmit={(e) => handleFilter(e)}>
                            <input
                                placeholder="Search..."
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            />
                            <button type="submit"><Search className="icon-primary" /></button>
                        </form>
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
                                <Link className="flex-row padding-vertical-small width100" to={`/datasets/${post.data_uuid}/description`}>
                                    <div className="ellipsis bold padding-sides-small">
                                        {post.name}
                                    </div>
                                    <div className="ellipsis padding-sides-small">
                                        {post.body}
                                    </div>
                                </Link>
                            </div>
                    )}
                </>
            }
        </div>

    )
}

