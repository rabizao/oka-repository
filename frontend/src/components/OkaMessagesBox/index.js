import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { ArrowLeft, ArrowRight, Search } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import TimeAgo from 'timeago-react';
import queryString from 'query-string';

import api from '../../services/api';
import { notifyError } from '../../utils';
import { LoginContext } from '../../contexts/LoginContext';
import { NotificationsContext } from '../../contexts/NotificationsContext';
import Gravatar from '../Gravatar';

export default function OkaMessagesBox() {
    let location = useLocation();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [render, setRender] = useState(0);
    const [page, setPage] = useState();
    const [totalPages, setTotalPages] = useState();
    const [lastPage, setLastPage] = useState();
    const [pageSize, setPageSize] = useState(queryString.parse(location.search).page_size || 10);
    const loggedUser = useContext(LoginContext);
    const notificationContext = useContext(NotificationsContext);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`messages/${loggedUser.username}/lasts`);
                const pagination = JSON.parse(response.headers['x-pagination']);
                setPage(pagination.page);
                setTotalPages(pagination.total_pages);
                setLastPage(pagination.last_page);
                setMessages(response.data);
                setFilteredMessages(response.data);
                setError(false);
            } catch (error) {
                notifyError(error, false);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [loggedUser.username, notificationContext.notifyNewMessage, render])

    function handleFilter(e) {
        e.preventDefault();
        var newMessages = messages.filter(message => {
            return message.author.name.toLowerCase().match(filter.toLowerCase());
        });
        setFilteredMessages(newMessages);
    }

    function handlePreviousPage() {
        let newParsedQueries = queryString.parse(location.search);
        newParsedQueries['page'] = page - 1;
        navigate(location.pathname + "?" + queryString.stringify(newParsedQueries));
    }

    function handleNextPage() {
        let newParsedQueries = queryString.parse(location.search);
        newParsedQueries['page'] = page + 1;
        navigate(location.pathname + "?" + queryString.stringify(newParsedQueries));
    }

    function handleChangePageSize(e) {
        setPageSize(e.target.value);
        let newParsedQueries = queryString.parse(location.search);
        newParsedQueries['page_size'] = e.target.value;
        newParsedQueries['page'] = 1;
        navigate(location.pathname + "?" + queryString.stringify(newParsedQueries));
    }

    function handleReload() {
        setRender(render + 1);
        setLoading(true);
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
                            <div>
                                {
                                    filteredMessages.length <= 0 &&
                                    <h4 className="flex-row flex-axis-center">No results found</h4>
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

                        {filteredMessages.map(
                            (message) =>
                                <div key={message.id} className="flex-row box-horizontal background-hover padding-sides-small">
                                    <Link className="flex-row flex-space-between padding-vertical-small width100" to={`/users/${loggedUser.username}/conversation/${message.author.username === loggedUser.username ? message.recipient.username : message.author.username}`}>
                                        <div className="flex-row bold min-width-big max-width-very-huge ellipsis width100">
                                            <Gravatar link={message.author.username === loggedUser.username ? message.recipient.gravatar : message.author.gravatar} size={24} rounded={true} />
                                            <span className="padding-left-small">{message.author.username === loggedUser.username ? message.recipient.name : message.author.name}</span>
                                        </div>
                                        <div id="small-hide" className="ellipsis padding-sides-small width100">
                                            {message.body}
                                        </div>
                                        <div className="padding-sides-small">
                                            <TimeAgo className="nowrap" datetime={message.timestamp + 'Z'} />
                                        </div>
                                    </Link>
                                </div>
                        )}
                    </>

            }
        </div>

    )
}

