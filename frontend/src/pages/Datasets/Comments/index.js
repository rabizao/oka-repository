import React, { useState, useEffect } from 'react';

import { ApiPosts } from '../../../components/Api';
import { CircularProgress } from '@material-ui/core'
import { CloudDownload, Favorite, FavoriteBorder } from '@material-ui/icons';

import Datasets from '../index';
import OkaNavBar from '../../../components/OkaNavBar';

export default function Comments(props) {
    const uuid = props.match.params.uuid;

    const [loadingPost, setLoadingPost] = useState(true);
    const [loadingSection, setLoadingSection] = useState(true);
    const [post, setPost] = useState({});

    const navItems = {
        description: {
            "name": "Description",
            "url": "/datasets/" + uuid + "/description"
        },
        visualize: {
            "name": "Visualize",
            "url": "/datasets/" + uuid + "/visualize"
        },
        comments: {
            "name": "Comments",
            "url": "/datasets/" + uuid + "/comments"
        }
    }

    // useEffect(() => {
    //     async function fetchPost() {
    //         await new Promise(resolve => setTimeout(resolve, 2000));
    //         setPost(ApiPosts[1]);
    //         console.log(uuid);
    //     }

        

    //     fetchPost();
    //     // setLoadingPost(false);

    // }, [uuid])

    useEffect(() => {
        async function fetchComments() {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        fetchComments();


        setLoadingSection(false);

    }, [])

    return (
        <Datasets uuid={uuid}>
            <OkaNavBar navItems={navItems} setLoading={setLoadingSection} />

            <div className="content-box padding-big">



                {loadingSection ?
                    <div className="flex-row flex-crossaxis-center"><CircularProgress /></div> :

                    <h1>Comments</h1>


                }

            </div>
        </Datasets>
    )
}