import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

import Avatar from 'react-avatar';
import { CircularProgress } from '@material-ui/core';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';
import queryString from 'query-string';

import { LoginContext } from '../../contexts/LoginContext';
import api from '../../services/api';
import { notifyError } from '../../utils';

export default function OkaProfileBox({ fetch_url }) {
    const history = useHistory();
    let location = useLocation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const loggedUser = useContext(LoginContext);
    const [page, setPage] = useState();
    const [totalPages, setTotalPages] = useState();
    const [lastPage, setLastPage] = useState();
    const [pageSize, setPageSize] = useState(queryString.parse(location.search).page_size || 10);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`${fetch_url}`);
                const pagination = JSON.parse(response.headers['x-pagination']);
                setPage(pagination.page || 0);
                setTotalPages(pagination.total_pages);
                setLastPage(pagination.last_page);
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchData();
    }, [fetch_url])

    async function handleFollow(index) {
        var newUsers = [...users];
        try {
            await api.post(`users/${newUsers[index].username}/follow`);
            if (newUsers[index].followers.includes(loggedUser.id)) {
                newUsers[index].followers = newUsers[index].followers.filter(item => item !== loggedUser.id)
            } else {
                newUsers[index].followers.push(loggedUser.id)
            }
        } catch (error) {
            notifyError(error);
        }
        setUsers(newUsers);
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
                users.length > 0 ?
                    <>
                        <div className="flex-row padding-sides-small padding-vertical-small">
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
                        <div className="flex-wrap flex-crossaxis-center padding-medium">
                            {
                                users.map((user, index) =>
                                    <div key={user.id} className="flex-column flex-axis-center box padding-medium background-hover width-smallest">
                                        <Link to={`/users/${user.username}/uploads`}><Avatar name={user.name} size="80" round={true} /></Link>
                                        <h1 className="color-primary margin-top-medium width100 ellipsis text-center"><Link to={`/users/${user.username}/uploads`}>{user.name}</Link></h1>
                                        <h5 className="color-primary margin-top-very-small width100 ellipsis text-center">{user.about_me}</h5>
                                        <h6 className="color-primary margin-top-small width100 ellipsis text-center">{user.followed && user.followed.length} following | {user.followers && user.followers.length} followers</h6>

                                        {(user.id !== loggedUser.id) &&
                                            <button onClick={() => handleFollow(index)} className="button-primary margin-vertical-small">{user.followers && user.followers.includes(loggedUser.id) ? "Unfollow" : "Follow"}</button>
                                        }
                                    </div>
                                )
                            }
                        </div>
                    </> :
                    <div className="flex-row padding-sides-small padding-vertical-small">
                        {
                            <h4 className="flex-row flex-axis-center">No results found</h4>
                        }
                    </div>
            }
        </div >
    )
}