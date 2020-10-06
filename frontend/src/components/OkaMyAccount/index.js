import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import Avatar from 'react-avatar';
import { ExpandMore } from '@material-ui/icons';
import { NotificationManager } from 'react-notifications';

import { LoginContext } from '../../contexts/LoginContext';
import { logout } from '../../services/auth';
import PopOver from '../PopOver';
import api from '../../services/api';


export default function OkaMyAccount() {
    const loggedUser = useContext(LoginContext);

    function handleLogout() {
        logout();
        window.location.href = '/';
        return
    }

    async function handleLogoutAllDevices() {
        try {
            await api.delete('/auth/revoke-all-tokens');
            handleLogout();
        } catch (error) {
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("network error", "error", 4000)
            }
        }
    }

    return (
        <PopOver
            component={ExpandMore}
            componentClasses="icon-tertiary cursor-pointer"
            content=
            {
                <div className="flex-column flex-axis-center padding-big">
                    <Link className="margin-top-small" to={`/users/${loggedUser.username}/uploads`}><Avatar name={loggedUser.name} size="70" round={true} /></Link>
                    <Link className="margin-top-small" to={`/users/${loggedUser.username}/uploads`}><h1 className="ellipsis-15ch">{loggedUser.name}</h1></Link>
                    <Link className="flex-row flex-crossaxis-center margin-top-medium padding-vertical-small box background-hover width100" to={`/users/${loggedUser.username}/uploads`}>Uploads/Favorites</Link>
                    <Link className="flex-row flex-crossaxis-center padding-vertical-small box background-hover width100" to={`/client`}>Oka Client</Link>
                    <button onClick={handleLogout} className="padding-vertical-small box background-hover width100">Logout</button>
                    <button onClick={handleLogoutAllDevices} className="margin-bottom-small padding-vertical-small box background-hover width100">Logout From All Devices</button>
                </div>
            }
        />

    )
}