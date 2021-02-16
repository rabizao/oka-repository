import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

import { Message } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

import TimeAgo from 'timeago-react';
import Avatar from 'react-avatar';

import api from '../../services/api';
import { notifyError } from '../../utils';

export default function OkaPostComments({ postId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [render, setRender] = useState(0);
    const [page, setPage] = useState();
    const [lastPage, setLastPage] = useState();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`posts/${postId}/comments`);
                const pagination = JSON.parse(response.headers['x-pagination']);
                setPage(pagination.page);
                setLastPage(pagination.last_page);
                setComments(response.data);
                setError(false);
            } catch (error) {
                notifyError(error, false);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [postId, render])

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
            var newReplies = [...replies];
            newReplies[commentId] = ''
            setReplies(newReplies);
        } catch (error) {
            notifyError(error);
        }
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
            setNewComment('');
        } catch (error) {
            notifyError(error);
        }
    }

    async function handleNextPage() {
        var newComments = [...comments];
        try {
            const response = await api.get(`posts/${postId}/comments?page=${page + 1}`);
            const pagination = JSON.parse(response.headers['x-pagination']);
            Array.prototype.push.apply(newComments, response.data);
            setComments(newComments);
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
        <div className="content-box margin-very-very-small padding-bottom-big">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :

                error ?
                    <div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
                        <div className="margin-sides-verysmall">Problem loading, try to </div>
                        <button className="button-primary" onClick={handleReload}>Reload</button>
                    </div> :
                    <>
                        <form className="flex-row margin-small" onSubmit={e => handleSubmitComment(e)}>
                            <textarea
                                className="padding-small width100"
                                placeholder={`Write a new comment`}
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                            />
                            <button className="button-primary margin-small" type="submit">Send</button>
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
                                            <span className="text-box">{comment.text}</span>
                                            <span className="margin-top-small">
                                                <ul className="flex-row ul-padding-sides-not-first">
                                                    <li><button onClick={e => handleShowReplies(e, comment.id)}><Message /> {comment.replies.length}</button></li>
                                                </ul>
                                                <ul className="margin-top-small">
                                                    {
                                                        showReplies[comment.id] &&
                                                        <>
                                                            <form className="flex-row margin-top-small" onSubmit={e => handleSubmitReply(e, comment.id, index)}>
                                                                <textarea
                                                                    className="padding-small width100"
                                                                    placeholder={`Reply to ${comment.author.name}`}
                                                                    value={replies[comment.id] || ''}
                                                                    onChange={e => handleSetReplies(e, comment.id)}
                                                                />
                                                                <button className="button-primary margin-small" type="submit">Send</button>
                                                            </form>
                                                            {comment.replies.map((reply) =>
                                                                <li key={reply.id} className="box flex-column background-hover-strong">
                                                                    <div className="content-item flex-row padding-medium">
                                                                        <div><Link to={`/users/${reply.author.username}/uploads`} ><Avatar name={reply.author.name} size="30" round={true} /></Link></div>
                                                                        <div className="flex-column padding-sides-small width100">
                                                                            <div>
                                                                                <Link to={`/users/${reply.author.username}/uploads`} ><span className="font-size-medium bold link">{reply.author.name}</span></Link> - <span>{reply.author.username}</span> - <TimeAgo datetime={reply.timestamp + 'Z'} />
                                                                            </div>
                                                                            <span className="text-box">{reply.text}</span>
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
                        {comments.length > 0 && (
                            page < lastPage ?
                                <li className="flex-row flex-crossaxis-center margin-top-small">
                                    <button className="button-primary" onClick={handleNextPage}>Load more</button>
                                </li> :
                                <li className="flex-row flex-crossaxis-center margin-top-small">Nothing more to show</li>)
                        }
                    </>

            }
        </div>
    )
}