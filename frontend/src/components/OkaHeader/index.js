import React, { useState, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Search, Apps, Notifications, AccountBalance } from '@material-ui/icons';

import './styles.css';

import { NotificationsContext } from '../../contexts/NotificationsContext';
import PopOver from '../PopOver';
import OkaMyAccount from '../OkaMyAccount';

export default function OkaHeader(props) {

    const history = useHistory();
    const [search, setSearch] = useState(props.query || "");
    const notificationsContext = useContext(NotificationsContext);

    function handleSearch(e) {
        e.preventDefault();
        history.push(`${props.section ?
            `/search/${props.section}?name=${search}&logic=and` :
            `/search/datasets?name=${search}&logic=and`}`);
    }

    return (
        <div className="flex-row flex-axis-center flex-space-between background-primary-color padding-medium">
            <Link to="/home"><h1 className="color-secondary">Oka</h1></Link>
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
                    <li className="flex-row cursor-pointer icon-normal">
                        <PopOver
                            component={Apps}
                            componentClasses="icon-tertiary"
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
                    </li>
                    <li className="flex-row cursor-pointer icon-normal">
                        <PopOver
                            component={Notifications}
                            componentClasses="icon-tertiary"
                            content=
                            {
                                <div className="max-width-very-huge">
                                    <h1 className="padding-sides-small padding-top-medium">Notifications</h1>
                                    <div className="flex-column padding-vertical-small">
                                        {
                                            notificationsContext.notifications.length > 0 ?
                                                notificationsContext.notifications.slice(0).reverse().map((notification) =>
                                                    notification.name === "task_finished" &&
                                                    <Link key={notification.id} className="padding-medium box background-hover width100" to={`/posts/${notification.payload_json.id}/description`}>
                                                        <span className="ellipsis-3">{notification.payload_json.original_name}: </span>
                                                        <span className={`ellipsis-3 ${notification.payload_json.code === "error" && "color-error"}`}> {notification.payload_json.message}</span>
                                                    </Link>
                                                ) :
                                                <div className="padding-sides-small padding-vertical-small width100">Nothing to show yet</div>
                                        }
                                    </div>
                                </div>
                            }
                        />
                    </li>
                    <li className="flex-row cursor-pointer icon-normal">
                        <OkaMyAccount />
                    </li>
                </ul>
            </div>
        </div>
    )
}