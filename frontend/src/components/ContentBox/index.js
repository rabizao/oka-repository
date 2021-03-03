import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Message, Favorite, FavoriteBorder } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import TimeAgo from 'timeago-react';

import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

import './styles.css';
import { notifyError } from '../../utils';
import Gravatar from '../Gravatar';

export default function ContentBox(props) {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [render, setRender] = useState(0);
    const [page, setPage] = useState();
    const [lastPage, setLastPage] = useState();
    const page_size = 20;
    const user = useContext(LoginContext);

    const history = useHistory();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`${props.fetchUrl}?page_size=${page_size}`);
                const pagination = JSON.parse(response.headers['x-pagination']);
                setPosts(response.data);
                setPage(pagination.page);
                setLastPage(pagination.last_page);
                setError(false);
            } catch (error) {
                notifyError(error, false);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [props.fetchUrl, user.renderFeed, render])

    async function handleFavoriteButton(e, post, index) {
        e.preventDefault();
        var newPosts = [...posts];

        try {
            await api.post(`posts/${post.id}/favorite`);
            if (post.favorites.includes(user.id)) {
                newPosts[index].favorites = newPosts[index].favorites.filter(item => item !== user.id)
            } else {
                newPosts[index].favorites.push(user.id)
            }
        } catch (error) {
            notifyError(error);
        }

        setPosts(newPosts);
    }

    function handleShowCommentsBox(e, post) {
        e.preventDefault();
        var newComments = [...comments];
        if (comments[post.id] != null) {
            newComments[post.id] = null;
        } else {
            newComments[post.id] = post.comments;
        }
        history.push(`/posts/${post.id}/comments`);
        setComments(newComments);
    }

    async function handleNextPage() {
        var newPosts = [...posts];
        try {
            const response = await api.get(`${props.fetchUrl}?page=${page + 1}&page_size=${page_size}`);
            const pagination = JSON.parse(response.headers['x-pagination']);
            Array.prototype.push.apply(newPosts, response.data);
            setPosts(newPosts);
            setPage(pagination.page);
            setLastPage(pagination.last_page);
        } catch (error) {
            notifyError(error);
        }
    }

    function handleReload() {
        setRender(render + 1);
        setLoading(true);
    }

    return (
        <div className={`content-box padding-bottom-big ${props.className}`}>
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :

                error ?
                    <div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
                        <div className="margin-sides-verysmall">Problem loading, try to </div>
                        <button className="button-primary" onClick={handleReload}>Reload</button>
                    </div> :
                    <>
                        <h2 className="padding-sides-small margin-top-medium">{props.titleLink ? <Link to={props.titleLink}>{props.title}</Link> : props.title}</h2>
                        {posts.length === 0 ? <h4 className="padding-sides-small margin-top-medium">Nothing to show yet</h4> :
                            <ul className="content-list margin-top-medium">
                                {posts.map((post, index) =>
                                    <li key={post.id} className="background-hover">
                                        <div className="content-item flex-row padding-small">
                                            <Link to={`/users/${post.author.username}/uploads`} ><Gravatar link={post.author.gravatar} size={40} rounded={true} /></Link>
                                            <Link className="padding-left-small width100 nowrap" to={`/posts/${post.id}/overview`}>
                                                <div className="flex-column">
                                                    <div className="ellipsis">
                                                        <span className="font-size-medium bold">{post.author.name}</span> - <span>{post.author.username}</span> - <TimeAgo datetime={post.timestamp + 'Z'} />
                                                    </div>
                                                    <span className="bold ellipsis width100">{post.name}</span>
                                                    <span className="ellipsis-3 text-box">{post.description.replace(/<[^>]*>/g, '')}</span>
                                                    <span className="padding-top-small">
                                                        <ul className="flex-row ul-padding-sides-not-first">
                                                            <li><button onClick={e => handleFavoriteButton(e, post, index)}>{post.favorites.includes(user.id) ? <><Favorite /> {post.favorites.length}</> : <><FavoriteBorder /> {post.favorites.length}</>}</button></li>
                                                            <li><button onClick={e => handleShowCommentsBox(e, post)}><Message /> {post.comments.length}</button></li>
                                                        </ul>
                                                        <ul>
                                                            {
                                                                comments[post.id] &&
                                                                <>
                                                                    {post.comments.map((comment) =>
                                                                        <li key={post.id + "/" + comment.id}>
                                                                            {comment.body}
                                                                        </li>
                                                                    )}
                                                                </>
                                                            }
                                                        </ul>
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    </li>
                                )}
                                {posts.length > 0 && (
                                    page < lastPage ?
                                        <li className="flex-row flex-crossaxis-center margin-top-small">
                                            <button className="button-primary" onClick={handleNextPage}>Load more</button>
                                        </li> :
                                        <li className="flex-row flex-crossaxis-center margin-top-small">Nothing more to show</li>)
                                }
                            </ul>
                        }
                    </>
            }
        </div>

    )
}