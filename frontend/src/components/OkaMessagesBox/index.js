import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import { Search } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import TimeAgo from 'timeago-react';
import Avatar from 'react-avatar';

import api from '../../services/api';
import { notifyError } from '../../utils';
import { LoginContext } from '../../contexts/LoginContext';
import { NotificationsContext } from '../../contexts/NotificationsContext';

export default function OkaMessagesBox() {
    const [filter, setFilter] = useState('');
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState();
    const [totalPages, setTotalPages] = useState();
    const [lastPage, setLastPage] = useState();
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
                setLoading(false);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchData();
    }, [loggedUser.username, notificationContext.notifyNewMessage])

    function handleFilter(e) {
        e.preventDefault();
        var newMessages = messages.filter(message => {
            return message.author.name.toLowerCase().match(filter.toLowerCase());
        });
        setFilteredMessages(newMessages);
    }

    return (
        <div className="content-box margin-very-small">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
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
                    <div className="flex-row padding-sides-small padding-vertical-small">
                        {
                            filteredMessages.length <= 0 &&
                            <h4 className="flex-row flex-axis-center">No results found</h4>
                        }
                    </div>
                    {filteredMessages.map(
                        (message) =>
                            <div key={message.id} className="flex-row box-horizontal background-hover padding-sides-small">
                                <Link className="flex-row flex-axis-center flex-space-between padding-vertical-small width100" to={`/users/${loggedUser.username}/conversation/${message.author.username === loggedUser.username ? message.recipient.username : message.author.username}`}>
                                    <div className="bold min-width-big max-width-very-huge ellipsis width100">
                                        <Avatar name={message.author.username === loggedUser.username ? message.recipient.name : message.author.name} size="40" round={true} />
                                        <span className="padding-left-small">{message.author.name}</span>
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

