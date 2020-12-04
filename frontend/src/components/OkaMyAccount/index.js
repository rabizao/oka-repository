import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';

import Avatar from 'react-avatar';
import { ExpandMore } from '@material-ui/icons';

import { LoginContext } from '../../contexts/LoginContext';
import { logout, timeStart } from '../../services/auth';
import PopOver from '../PopOver';
import api from '../../services/api';
import { notifyError } from '../../utils';
import { NotificationsContext } from '../../contexts/NotificationsContext';


export default function OkaMyAccount() {
    const loggedUser = useContext(LoginContext);
    const notificationsContext = useContext(NotificationsContext);
    const history = useHistory();

    function handleLogout() {
        logout();
        loggedUser.setLogged(false);
        notificationsContext.setNotifications([]);
        notificationsContext.setSince(timeStart);
        notificationsContext.setFirst(true);
        history.push('/');
    }

    async function handleLogoutAllDevices() {
        try {
            await api.delete('/auth/revoke-all-tokens');
            handleLogout();
        } catch (error) {
            notifyError(error);
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