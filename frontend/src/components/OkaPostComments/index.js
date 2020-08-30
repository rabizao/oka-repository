import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

import { NotificationManager } from 'react-notifications';
import { Message } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

import TimeAgo from 'timeago-react';
import Avatar from 'react-avatar';

import api from '../../services/api';

export default function OkaPostComments({ postId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`posts/${postId}/comments`);
                setComments(response.data);
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
    }, [postId])

    function handleShowReplies(e, commentId) {
        e.preventDefault();

        var newShowReplies = [...showReplies];

        if (showReplies[commentId] != null) {
            newShowReplies[commentId] = null;
        } else {
            newShowReplies[commentId] = true;
        }

        setShowReplies(newShowReplies);
    }

    async function handleSubmitReply(e, commentId, index) {
        e.preventDefault();

        const data = {
            text: replies[commentId]
        }

        try {
            const response = await api.post(`comments/${commentId}/replies`, data);
            const newComments = [...comments];
            newComments[index].replies.push(response.data); //unshift to put at the beginning
            setComments(newComments);
        } catch (error) {
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
            }
        }

        var newReplies = [...replies];
        newReplies[commentId] = ''
        setReplies(newReplies);

    }

    function handleSetReplies(e, commentId) {
        e.preventDefault();

        var newReplies = [...replies];
        newReplies[commentId] = e.target.value
        setReplies(newReplies);
    }

    async function handleSubmitComment(e) {
        e.preventDefault();

        const data = {
            text: newComment
        }

        try {
            const response = await api.post(`posts/${postId}/comments`, data);
            const newComments = [...comments];
            newComments.unshift(response.data);
            setComments(newComments);
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

    return (
        <div className="content-box padding-bottom-big">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                <>
                    <form className="margin-top-small" onSubmit={e => handleSubmitComment(e)}>
                        <input
                            className="padding-small width100"
                            placeholder={`Write a new comment`}
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                        />
                    </form>
                    <ul className="content-list">
                        {comments.map((comment, index) =>
                            <li key={comment.id} className="flex-column background-hover">
                                <div className="content-item flex-row padding-medium">
                                    <div><Link to={`/users/${comment.author.username}/uploads`} ><Avatar name={comment.author.name} size="40" round={true} /></Link></div>
                                    <div className="flex-column padding-sides-small width100">
                                        <div>
                                            <Link to={`/users/${comment.author.username}/uploads`} ><span className="font-size-medium bold link">{comment.author.name}</span></Link> - <span>{comment.author.username}</span> - <TimeAgo datetime={comment.timestamp + 'Z'} />
                                        </div>
                                        <span>{comment.text}</span>
                                        <span className="margin-top-small">
                                            <ul className="flex-row ul-padding-sides-not-first">
                                                <li><button onClick={e => handleShowReplies(e, comment.id)}><Message /> {comment.replies.length}</button></li>
                                            </ul>
                                            <ul className="margin-top-small">
                                                {
                                                    showReplies[comment.id] &&
                                                    <>
                                                        <form className="margin-top-small" onSubmit={e => handleSubmitReply(e, comment.id, index)}>
                                                            <input
                                                                className="padding-small width100"
                                                                placeholder={`Reply to ${comment.author.name}`}
                                                                value={replies[comment.id] || ''}
                                                                onChange={e => handleSetReplies(e, comment.id)}
                                                            />
                                                        </form>
                                                        {comment.replies.map((reply) =>
                                                            <li key={reply.id} className="box flex-column background-hover-strong">
                                                                <div className="content-item flex-row padding-medium">
                                                                    <div><Link to={`/users/${reply.author.username}/uploads`} ><Avatar name={reply.author.name} size="30" round={true} /></Link></div>
                                                                    <div className="flex-column padding-sides-small width100">
                                                                        <div>
                                                                            <Link to={`/users/${reply.author.username}/uploads`} ><span className="font-size-medium bold link">{reply.author.name}</span></Link> - <span>{reply.author.username}</span> - <TimeAgo datetime={reply.timestamp + 'Z'} />
                                                                        </div>
                                                                        <span>{reply.text}</span>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ).reverse()}
                                                    </>
                                                }
                                            </ul>
                                        </span>
                                    </div>
                                </div>
                            </li>
                        )}
                    </ul>
                </>
            }
        </div>
    )
}