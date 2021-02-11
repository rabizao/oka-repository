import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { CheckBoxOutlineBlank, CheckBox, CloudDownload, Search, ArrowLeft, ArrowRight } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import TimeAgo from 'timeago-react';
import queryString from 'query-string';

import api from '../../services/api';
import { notifyError } from '../../utils';
import { RunningTasksBarContext } from '../../contexts/RunningTasksBarContext';
import { NotificationsContext } from '../../contexts/NotificationsContext';

export default function OkaPostsBox({ fetch_url }) {
    let location = useLocation();
    const history = useHistory();
    const [selection, setSelection] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [filter, setFilter] = useState('');
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [render, setRender] = useState(0);
    const [page, setPage] = useState();
    const [totalPages, setTotalPages] = useState();
    const [lastPage, setLastPage] = useState();
    const [pageSize, setPageSize] = useState(queryString.parse(location.search).page_size || 10);

    const runningTasksBar = useContext(RunningTasksBarContext);
    const notificationsContext = useContext(NotificationsContext);

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
                setError(false);
            } catch (error) {
                notifyError(error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [fetch_url, render])

    function handleSelect(e, postId) {
        e.preventDefault();
        var newSelection = [...selection];

        if (newSelection.includes(postId)) {
            newSelection = newSelection.filter(item => item !== postId);
            if (selectAll) {
                setSelectAll(false);
            }
        } else {
            newSelection.push(postId);
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
            posts.map((post) => newSelection.push(post.id));
            setSelection(newSelection);
        }
        setSelectAll(!selectAll);
    }

    async function handleDownload() {
        try {
            var serializedSelection = JSON.stringify(selection);
            serializedSelection = serializedSelection.replace(/,/g, '&pids=').replace('[', "").replace(']', "")
            const resp = await api.post('/downloads/data?pids=' + serializedSelection);
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

    function handleReload() {
        setRender(render + 1);
        setLoading(true);
    }

    return (
        <div className="content-box margin-very-small">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :

                error ?
                    <div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
                        <div className="margin-sides-verysmall">Problem loading, try to </div>
                        <button className="button-primary" onClick={handleReload}>Reload</button>
                    </div> :
                    <>
                        <div className="flex-row padding-sides-small padding-vertical-small">
                            <form className="search-form-secondary" onKeyUp={(e) => handleFilter(e)} onSubmit={(e) => handleFilter(e)}>
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
                                    filteredPosts.length > 0 &&
                                    <button onClick={() => handleSelectAll()}>
                                        {
                                            selectAll ?
                                                <CheckBox className="icon-primary" /> :
                                                <CheckBoxOutlineBlank className="icon-primary" />
                                        }
                                    </button>
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
                                <span className="padding-sides-small">{page ? page : 0} of {totalPages}</span>
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

                        {
                            filteredPosts.length === 0 &&
                            <>
                                <div className="flex-row padding-sides-small padding-vertical-small">
                                    <h4 className="flex-row flex-axis-center">No results found</h4>
                                </div>
                            </>
                        }

                        {filteredPosts.map(
                            (post) =>
                                <div key={post.id} className="flex-row box-horizontal background-hover padding-sides-small">
                                    <button onClick={(e) => handleSelect(e, String(post.id))}>
                                        {
                                            selection.includes(post.id) ?
                                                <CheckBox className="icon-primary" /> :
                                                <CheckBoxOutlineBlank className="icon-primary" />
                                        }
                                    </button>
                                    <Link className="flex-row flex-space-between padding-vertical-small width100" to={`/posts/${post.id}/overview`}>
                                        <div className="bold padding-sides-small min-width-big max-width-very-huge ellipsis width100">
                                            {post.name}
                                        </div>
                                        <div id="small-hide" className="ellipsis padding-sides-small width100">
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

