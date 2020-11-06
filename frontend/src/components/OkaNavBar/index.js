import React from 'react';
import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LoginContext } from '../../contexts/LoginContext'

export default function OkaNavBar({ navItems, setLoading, shownUserId }) {
    const loggedUser = useContext(LoginContext);
    return (
        <nav className="flex-row-nowrap overflow-x-auto flex-crossaxis-center padding-top-small oka-hero-background">
            {Object.entries(navItems)
                .map(([key, value]) =>
                !value.hide && (
                    value.private ?
                        shownUserId && (shownUserId === loggedUser.id) &&
                        <NavLink key={key} to={value.url} activeClassName="nav-button-secondary-active" onClick={() => setLoading && setLoading(true)}>
                            <button className="nav-button-secondary">{value.name}</button>
                        </NavLink> :
                        <NavLink key={key} to={value.url} activeClassName="nav-button-secondary-active" onClick={() => setLoading && setLoading(true)}>
                            <button className="nav-button-secondary">{value.name}</button>
                        </NavLink>)
                )
            }
        </nav>
    )
}