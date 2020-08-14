import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Avatar from 'react-avatar';
import { Message, Favorite, FavoriteBorder } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import TimeAgo from 'timeago-react';

import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

import './styles.css';

export default function ContentBox(props) {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const history = useHistory()
    const user = useContext(LoginContext);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(props.fetchUrl);
                await new Promise(resolve => setTimeout(resolve, 2000));
                setPosts(response.data);
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
    }, [])

    function handleFavoriteButton(e, post, index) {
        e.preventDefault();
        var newPosts = [...posts];

        if (post.favorites.includes(user.id)) {
            // call api and change in backend
            newPosts[index].favorites = newPosts[index].favorites.filter(item => item !== user.id)
        } else {
            // call api and change in backend
            newPosts[index].favorites.push(user.id)
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

        setComments(newComments);
    }

    function handleRedirect(e, link) {
        console.log(link);
        e.preventDefault();
        history.push(link);
    }

    return (
        <>
            <NotificationContainer />
            <div className="content-box padding-bottom-big">
                {loading ?
                    <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                    <>
                        <h2 className="padding-sides-small margin-top-medium">{props.title}</h2>
                        <ul className="content-list margin-top-medium">
                            {posts.map((post, index) =>
                                <li key={post.id} className="flex-column background-hover ">
                                    {/* {favorites[post.id] = post.favorited} */}
                                    <div className="content-item flex-row padding-medium">
                                        {!props.hideAvatar && <Link to={`/users/${post.author.username}/uploads`} ><Avatar name={post.author.name} size="40" round={true} /></Link>}
                                        <Link to={`/datasets/${post.data_uuid}/description`}>
                                            <div className="flex-column padding-sides-small" style={{ maxWidth: props.maxWidth ? props.maxWidth : "300px" }}>
                                                <div>
                                                    {!props.hideAuthor && <><span className="font-size-medium bold">{post.author.name}</span> - <span>{post.author.username}</span> - <TimeAgo datetime={post.timestamp} /></>}
                                                </div>
                                                <div>
                                                    <span className="bold">{post.name}</span>{props.hideAuthor && <span> - <TimeAgo datetime={post.timestamp} /></span>}
                                                </div>
                                                <span className="ellipsis">{post.body}</span>
                                                <span className="padding-top-small">
                                                    <ul className="flex-row ul-padding-sides-not-first">
                                                        <li><button onClick={e => handleFavoriteButton(e, post, index)}>{post.favorites.includes(user.id) ? <><Favorite /> {post.favorites.length}</> : <><FavoriteBorder /> {post.favorites.length}</>}</button></li>
                                                        <li><button onClick={e => handleShowCommentsBox(e, post)}><Message /> {post.comments_total}</button></li>
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
                        </ul>
                    </>
                }
            </div>
        </>
    )
}