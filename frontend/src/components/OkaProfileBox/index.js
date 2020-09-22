import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Avatar from 'react-avatar';
import { CircularProgress } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';

import { LoginContext } from '../../contexts/LoginContext';
import api from '../../services/api';

export default function OkaProfileBox({ fetch_url }) {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const loggedUser = useContext(LoginContext);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`${fetch_url}`);
                setUsers(response.data);
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
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("Network error", "Error", 4000)
            }
        }
        setUsers(newUsers);
    }

    return (
        <div className="content-box margin-very-small">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :
                <>
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
                </>
            }
        </div >
    )
}