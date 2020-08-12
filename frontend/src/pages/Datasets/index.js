import React, { useState, useEffect } from 'react';

import './styles.css';
import { ApiPosts } from '../../components/Api';
import { CircularProgress } from '@material-ui/core'
import { CloudDownload, Favorite, FavoriteBorder } from '@material-ui/icons';

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';


export default function Search(props) {
    const uuid = props.match.params.uuid;
    const section = props.match.params.section;
    const [loadingPost, setLoadingPost] = useState(true);
    const [loadingSection, setLoadingSection] = useState(true);
    const [post, setPost] = useState({});

    const navItems = {
        description: {
            "name": "Description",
            "url": "/datasets/" + uuid + "/description",
            "fetch_url": "/datasets/" + uuid + "/description"
        },
        visualize: {
            "name": "Visualize",
            "url": "/datasets/" + uuid + "/visualize",
            "fetch_url": "/datasets/" + uuid + "/visualize"
        },
        comments: {
            "name": "Comments",
            "url": "/datasets/" + uuid + "/comments",
            "fetch_url": "/datasets/" + uuid + "/comments"
        }
    }

    useEffect(() => {
        async function fetchPost() {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setPost(ApiPosts[1]);
            setLoadingPost(false);
            console.log("Mudando post");
        }
        fetchPost();
    }, [uuid])

    useEffect(() => {
        async function fetchComments() {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setLoadingSection(false);
        }

        if (section === "comments") {
            fetchComments();
        } else {
            setLoadingSection(false);
        }
        
    }, [section])

    return (
        <>
            <OkaHeader />
            <div className="oka-hero-background padding-sides-small padding-top-big">
                <div className="flex-row flex-space-between flex-axis-center">
                    <h2 className="color-tertiary">{loadingPost ? <CircularProgress className="icon-tertiary" /> : post.title}</h2>
                    <div>
                        <button className="button-secondary">Edit</button>
                        <button className="button-secondary margin-left-small">Publish</button>
                    </div>
                </div>

                <h6 className="color-tertiary">{loadingPost ? <CircularProgress className="icon-tertiary" /> : <>{post.downloads} downloads | {post.favorited_total} favorited</>}</h6>
                <h6 className="color-tertiary">OID: {uuid}</h6>
                <div className="margin-top-very-small">
                    <CloudDownload className="icon-secondary" />
                    {post.favorited ? <Favorite className="icon-secondary margin-left-very-small" /> : <FavoriteBorder className="icon-secondary margin-left-very-small" />}
                </div>
            </div>

            <OkaNavBar navItems={navItems} setLoading={setLoadingSection} />

            <div className="content-box padding-big">

                {loadingSection ?
                    <div className="flex-row flex-crossaxis-center"><CircularProgress /></div> :

                    section === "description" ?
                        post.description :
                        section === "visualize" ?
                            <div>Visualization not supported yet</div> :
                            section === "comments" ?
                                <div>Comments not supported yet</div> :
                                ""

                }
            </div>

        </>
    )
}