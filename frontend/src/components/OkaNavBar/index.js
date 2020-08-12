import React from 'react';
import { NavLink } from 'react-router-dom';

export default function OkaNavBar({ navItems, setLoading }) {
    return (
        <nav className="flex-row flex-crossaxis-center padding-top-small oka-hero-background">
            {
                Object.entries(navItems)
                    .map(([key, value]) =>
                        <NavLink key={key} to={value.url? value.url: "/notfound"} activeClassName="nav-button-secondary-active" onClick={() => setLoading && setLoading(true)}>
                            <button className="nav-button-secondary">{value.name}</button>
                        </NavLink>
                    )
            }
        </nav>
    )
}