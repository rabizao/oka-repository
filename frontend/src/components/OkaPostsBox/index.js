import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { CheckBoxOutlineBlank, CheckBox, CloudDownload, Search, ArrowLeft, ArrowRight } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import { saveAs } from 'file-saver';
import TimeAgo from 'timeago-react';
import queryString from 'query-string';

import api, { downloadsUrl } from '../../services/api';

export default function OkaPostsBox({ fetch_url }) {
    let location = useLocation();
    const history = useHistory();
    const [selection, setSelection] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [filter, setFilter] = useState('');
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState();
    const [totalPages, setTotalPages] = useState();
    const [lastPage, setLastPage] = useState();
    const [pageSize, setPageSize] = useState(queryString.parse(location.search).page_size || 10);    

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`${fetch_url}`);
                const pagination = JSON.parse(response.headers['x-pagination']);
                setPage(pagination.page);
                setTotalPages(pagination.total_pages);
                setLastPage(pagination.last_page);
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
        try {
            var serializedSelection = JSON.stringify(selection);
            serializedSelection = serializedSelection.replace(/","/g, '&uuids=').replace('["', "").replace('"]', "")
            const resp = await api.get('/downloads/data?uuids=' + serializedSelection);
            var status = setInterval(async function () {
                try {
                    const response = await api.get(`tasks/${resp.data}/status`);
                    if (response.data.status === "done") {
                        saveAs(downloadsUrl + response.data.result, "datasets.zip");
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
                    clearInterval(status);
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

    function handleFilter(e) {
        e.preventDefault();
        var newPosts = posts.filter(post => {
            return post.name.toLowerCase().match(filter.toLowerCase());
        });
        setFilteredPosts(newPosts);
    }

    function handlePreviousPage() {
        let newParsedQueries = queryString.parse(location.search);
        newParsedQueries['page'] = page - 1;
        history.push(location.pathname + "?" + queryString.stringify(newParsedQueries));
    }

    function handleNextPage() {
        let newParsedQueries = queryString.parse(location.search);
        newParsedQueries['page'] = page + 1;
        history.push(location.pathname + "?" + queryString.stringify(newParsedQueries));
    }

    function handleChangePageSize(e) {
        setPageSize(e.target.value);
        let newParsedQueries = queryString.parse(location.search);
        newParsedQueries['page_size'] = e.target.value;
        newParsedQueries['page'] = 1;
        history.push(location.pathname + "?" + queryString.stringify(newParsedQueries));
    }

    return (
        <div className="content-box margin-very-small">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                <>
                    <div className="flex-row padding-sides-small padding-vertical-small">
                        <form className="search-form" onKeyUp={(e) => handleFilter(e)} onSubmit={(e) => handleFilter(e)}>
                            <input
                                placeholder="Filter by name"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            />
                            <button type="submit"><Search className="icon-primary" /></button>
                        </form>
                    </div>

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
                        <div className="flex-row">
                            <span>Rows</span>
                            <div className="padding-left-small">
                                <select name="pageSize" id="pageSize" onChange={(e) => handleChangePageSize(e)} value={pageSize}>
                                    <option value={2}>2</option>
                                    <option value={10}>10</option>                                    
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <span className="padding-sides-small">{page} of {totalPages}</span>
                            {
                                page > 1 ?
                                    <button onClick={handlePreviousPage}><ArrowLeft /></button> :
                                    <ArrowLeft className="icon-primary-deactivated" />
                            }
                            {
                                page < lastPage ?
                                    <button onClick={handleNextPage}><ArrowRight className="icon-primary" /></button> :
                                    <ArrowRight className="icon-primary-deactivated" />
                            }
                        </div>
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
                                    <div className="bold padding-sides-small max-width-very-huge min-width-huge ellipsis">
                                        {post.name}
                                    </div>
                                    <div className="ellipsis padding-sides-small width100">
                                        {post.description}
                                    </div>
                                    <div className="padding-sides-small">
                                        <TimeAgo className="nowrap" datetime={post.timestamp + 'Z'} />
                                    </div>
                                </Link>
                            </div>
                    )}
                </>
            }
        </div>

    )
}

