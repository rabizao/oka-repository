import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Avatar from 'react-avatar';
import { Message, Favorite, FavoriteBorder } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import TimeAgo from 'timeago-react';

import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

import './styles.css';

export default function ContentBox(props) {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useContext(LoginContext);

    const history = useHistory();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(props.fetchUrl);
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
    }, [props.fetchUrl])

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
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
            }
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

        history.push(`/posts/${post.id}/comments`)

        setComments(newComments);
    }

    return (
        <div className={`content-box padding-bottom-big ${props.className}`}>
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                <>
                    <h2 className="padding-sides-small margin-top-medium">{props.titleLink ? <Link to={props.titleLink}>{props.title}</Link> : props.title}</h2>
                    {posts.length === 0 ? <h4 className="padding-sides-small margin-top-medium">Nothing to show yet</h4> :
                        <ul className="content-list margin-top-medium">
                            {posts.map((post, index) =>
                                <li key={post.id} className="background-hover">
                                    <div className="content-item flex-row padding-medium">
                                        <Link to={`/users/${post.author.username}/uploads`} ><Avatar name={post.author.name} size="40" round={true} /></Link>
                                        <Link className="padding-left-small width100 nowrap" to={`/posts/${post.id}/description`}>
                                            <div className="flex-column">
                                                <div className="ellipsis">
                                                    <span className="font-size-medium bold">{post.author.name}</span> - <span>{post.author.username}</span> - <TimeAgo datetime={post.timestamp + 'Z'} />
                                                </div>
                                                <span className="bold ellipsis width100">{post.name}</span>
                                                <span className="ellipsis-3 text-box">{post.description}</span>
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
                        </ul>
                    }
                </>
            }
        </div>

    )
}