import React, { useState, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';

import './styles.css';

import Avatar from 'react-avatar';
import { Search, Apps, Notifications, AccountCircle } from '@material-ui/icons';

import { LoginContext } from '../../contexts/LoginContext';
import { logout } from '../../services/auth';
import PopOver from '../PopOver';

export default function OkaHeader(props) {

    const history = useHistory();
    const [search, setSearch] = useState(props.query || "");
    const loggedUser = useContext(LoginContext);

    function handleSearch(e) {
        e.preventDefault();
        history.push(`${props.section ?
            `/search/${props.section}?name=${search}&logic=and` :
            `/search/datasets?name=${search}&logic=and`}`);
    }

    function handleLogout() {
        logout();
        window.location.href = '/';
        return
    }

    return (
        <div className="flex-row flex-axis-center flex-space-between background-primary-color padding-medium">
            <Link to="/home"><h1 className="color-secondary">Oka</h1></Link>
            <div className="oka-header-search">
                <form className="oka-header-search-form" onSubmit={handleSearch}>
                    <input
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className="icon-normal" type="submit"><Search className="icon-tertiary-light" /></button>
                </form>
            </div>
            <div className="oka-header-right-buttons">
                <ul className="ul-padding-sides-not-first">
                    <li className="flex-row cursor-pointer">
                        <div className="icon-normal">
                            <PopOver
                                component={Apps}
                                componentClasses="icon-tertiary"
                                content=
                                {
                                    <div className="flex-wrap flex-space-between max-width-huge padding-medium">
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                        <Apps />
                                    </div>
                                }
                            />
                        </div>
                    </li>
                    <li className="flex-row cursor-pointer">
                        <div className="icon-normal">
                            <PopOver
                                component={Notifications}
                                componentClasses="icon-tertiary"
                                content=
                                {
                                    <>
                                        <h6 className="padding-sides-small padding-top-medium">Notifications</h6>
                                        <div className="flex-column padding-vertical-small">
                                            <Link className="padding-sides-small padding-vertical-small box background-hover width100" to={`/users/${loggedUser.username}/uploads`}>Notification 1</Link>
                                            <Link className="padding-sides-small padding-vertical-small box background-hover width100" to={`/users/${loggedUser.username}/favorites`}>Notification 2</Link>
                                        </div>
                                    </>
                                }
                            />
                        </div>
                    </li>
                    <li className="flex-row cursor-pointer">
                        <div className="icon-normal">
                            <PopOver
                                component={AccountCircle}
                                componentClasses="icon-tertiary"
                                content=
                                {
                                    <div className="flex-column flex-axis-center padding-vertical-medium">
                                        <Link className="padding-sides-medium" to={`/users/${loggedUser.username}/uploads`}><Avatar name={loggedUser.name} size="70" round={true} /></Link>
                                        <button onClick={handleLogout} className="margin-top-medium padding-sides-medium padding-vertical-small box background-hover width100">Logout</button>
                                        {/* <Link className="padding-sides-medium padding-vertical-small box background-hover width100" to={`/users/${loggedUser.username}/favorites`}>Your favorites</Link> */}
                                    </div>
                                }
                            />
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    )
}