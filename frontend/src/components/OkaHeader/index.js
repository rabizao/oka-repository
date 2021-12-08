import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Notifications } from '@material-ui/icons'; // Apps, AccountBalance, , ChatBubble
import Badge from '@material-ui/core/Badge';

import './styles.css';

import { NotificationsContext } from '../../contexts/NotificationsContext';
import PopOver from '../PopOver';
import OkaMyAccount from '../OkaMyAccount';
import { notifyError } from '../../utils';
import api from '../../services/api';
import { LoginContext } from '../../contexts/LoginContext';

export default function OkaHeader(props) {

    const navigate = useNavigate();
    const [search, setSearch] = useState(props.query || "");
    const notificationsContext = useContext(NotificationsContext);
    const loggedUser = useContext(LoginContext);

    function handleSearch(e) {
        e.preventDefault();
        navigate(`${props.section ?
            `/search/${props.section}?name=${search}&logic=and` :
            `/search/datasets?name=${search}&logic=and`}`);
    }

    function renderNotification(notification) {
        switch (notification.name) {
            case 'data_uploaded':
                return (
                    <Link key={notification.id} className="padding-medium box background-hover width100" to={`/posts/${notification.payload_json.id}/overview`}>
                        <span className="ellipsis-3">{notification.payload_json.original_name}: </span>
                        <span className={`ellipsis-3 ${notification.payload_json.code === "error" && "color-error"}`}> {notification.payload_json.message}</span>
                    </Link>)
            default:
                break;
        }
    }

    async function handleNotificationsClick() {
        try {
            await api.put('notifications/read');
            notificationsContext.setNotificationsBadgeCount(0);
        } catch (error) {
            notifyError(error);
        }
    }

    // function handleMessageBadgeClick() {
    //     notificationsContext.setMessagesBadgeCount(0);
    //     navigate(`/users/${loggedUser.username}/messages`);
    // }

    return (
        <div className="flex-row flex-axis-center flex-space-between background-primary-color padding-small">
            <Link to="/home"><h1 onClick={() => loggedUser.setRenderFeed(loggedUser.renderFeed + 1)} className="color-secondary">Oka</h1></Link>
            <div id="small-hide">
                <form className="search-form-primary" onSubmit={handleSearch}>
                    <input
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className="icon-normal" type="submit"><Search className="icon-tertiary-light" /></button>
                </form>
            </div>

            <div id="small-show">
                <div className="icon-normal cursor-pointer">
                    <PopOver
                        center={true}
                        component={Search}
                        componentClasses="icon-tertiary"
                        id="search"
                        content=
                        {
                            <form className="search-form-secondary" onSubmit={handleSearch}>
                                <input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <button className="icon-normal" type="submit"><Search className="icon-primary" /></button>
                            </form>
                        }
                    />
                </div>
            </div>

            <div className="oka-header-right-buttons">
                <ul className="ul-padding-sides-not-first">
                    {/* <li className="flex-row cursor-pointer icon-normal">
                        <PopOver
                            component={Apps}
                            componentClasses="icon-tertiary"
                            id="apps"
                            content=
                            {
                                <div className="max-width-very-huge">
                                    <h1 className="padding-sides-small padding-top-medium">Apps</h1>
                                    <div className="flex-wrap flex-space-between max-width-huge padding-big">
                                        <Link to="/" className="icon-medium" title="Go to OKA home">
                                            <AccountBalance />
                                        </Link>
                                    </div>
                                </div>
                            }
                        />
                    </li> */}
                    <li className="flex-row cursor-pointer icon-normal">
                        <Badge badgeContent={notificationsContext.notificationsBadgeCount} color="error">
                            <PopOver
                                component={Notifications}
                                onClick={handleNotificationsClick}
                                id="notifications"
                                componentClasses="icon-tertiary"
                                content=
                                {
                                    <div className="max-width-very-huge">
                                        <h1 className="padding-sides-small padding-top-medium">Notifications</h1>
                                        <div className="flex-column padding-vertical-small">
                                            {
                                                notificationsContext.notifications.length > 0 ?
                                                    notificationsContext.notifications.slice(0).reverse().map((notification) =>
                                                        renderNotification(notification)
                                                    ) :
                                                    <div className="padding-sides-small padding-vertical-small width100">Nothing to show yet</div>
                                            }
                                        </div>
                                    </div>
                                }
                            />
                        </Badge>
                    </li>
                    {/* <li className="flex-row cursor-pointer icon-normal" onClick={handleMessageBadgeClick}>
                        <Badge badgeContent={notificationsContext.messagesBadgeCount} color="error">
                            <ChatBubble className="icon-tertiary" />
                        </Badge>
                    </li> */}
                    <li className="flex-row cursor-pointer icon-normal">
                        <OkaMyAccount />
                    </li>
                </ul>
            </div>
        </div>
    )
}
