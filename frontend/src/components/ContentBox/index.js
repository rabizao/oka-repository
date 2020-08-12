import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Avatar from 'react-avatar';
import { Message, Favorite, FavoriteBorder } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

import './styles.css';

import { ApiPosts } from '../../components/Api';

export default function ContentBox(props) {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const history = useHistory()

    useEffect(() => {
        async function fetchData() {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setPosts(ApiPosts);
            setLoading(false);
        }

        fetchData();
    }, [])

    function handlePostChanges(e, post, event) {
        e.preventDefault();

        if (event === "favorite") {

        }
    }

    function handleFavoriteButton(e, post) {
        e.preventDefault();
        var newPosts = [...posts];

        if (posts[post.id].favorited) {
            // call api and change in backend
            newPosts[post.id].favorited = false
        } else {
            // call api and change in backend
            newPosts[post.id].favorited = true
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
        <div className="content-box padding-bottom-big">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                <>
                    <h2 className="padding-sides-small margin-top-medium">{props.title}</h2>
                    <ul className="content-list margin-top-medium">
                        {posts.map((post) =>
                            <li key={post.id} className="flex-column background-hover ">
                                {/* {favorites[post.id] = post.favorited} */}
                                <div className="content-item flex-row padding-medium">
                                    {!props.hideAvatar && <Link to={`/users/${post.author.username}/uploads`} ><Avatar name={post.author.name} size="40" round={true} /></Link>}
                                    <Link to={`/datasets/${post.data_uuid}/description`}>
                                        <div className="flex-column padding-sides-small" style={{ maxWidth: props.maxWidth ? props.maxWidth : "300px" }}>
                                            <div>
                                                {!props.hideAuthor && <><span className="font-size-medium bold">{post.author.name}</span> - <span>{post.author.username}</span> - {post.time}</>}
                                            </div>
                                            <div>
                                                <span className="bold">{post.title}</span>{props.hideAuthor && <span> - {post.time}</span>}
                                            </div>
                                            <span className="ellipsis">{post.description}</span>
                                            <span className="padding-top-small">
                                                <ul className="flex-row ul-padding-sides-not-first">
                                                    <li><button onClick={e => handleFavoriteButton(e, post)}>{post.favorited ? <><Favorite /> {post.favorited_total}</> : <><FavoriteBorder /> {post.favorited_total}</>}</button></li>
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
    )
}