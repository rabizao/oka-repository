import React, { useState } from 'react';
import {useHistory} from 'react-router-dom';

import './styles.css';

import { Search, Apps, Notifications, AccountCircle } from '@material-ui/icons';

export default function OkaHeader(props) {

    const history = useHistory();
    const [search, setSearch] = useState(props.query);

    function handleSearch(e) {
        e.preventDefault();
        history.push('/search/datasets?query=' + search);
    }

    return (
        <div className="oka-header">
            <div className="oka-header-logo">
                <a href="/home"><h1>Oka</h1></a>
            </div>
            <div className="oka-header-search">
                <form className="oka-header-search-form" onSubmit={handleSearch}>
                    <input
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button type="submit"><Search className="icon-tertiary-light" /></button>
                </form>
            </div>
            <div className="oka-header-right-buttons">
                <ul className="ul-padding-sides-not-first">
                    <li className="flex-row"><Apps className="icon-tertiary" /></li>
                    <li className="flex-row"><Notifications className="icon-tertiary" /></li>
                    <li className="flex-row"><AccountCircle className="icon-tertiary" /></li>
                </ul>
            </div>
        </div>
    )
}