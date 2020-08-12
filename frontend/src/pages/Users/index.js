import React, { useState } from 'react';

import './styles.css';

import Avatar from 'react-avatar';
import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaPostsBox from '../../components/OkaPostsBox';

export default function Users(props) {
    const username = props.match.params.username;
    const section = props.match.params.section;
    const [loading, setLoading] = useState(true);

    const navItems = {
        uploads: {
            "name": "Uploads",
            "url": "/users/" + username + "/uploads",
            "fetch_url": "/users/" + username + "/uploads"
        },
        favorites: {
            "name": "Favorites",
            "url": "/users/" + username + "/favorites",
            "fetch_url": "/users/" + username + "/favorites"
        },
        basket: {
            "name": "Basket",
            "url": "/users/" + username + "/basket",
            "fetch_url": "/users/" + username + "/basket"
        }
    }

    return (
        <>
            <OkaHeader />
            <div className="flex-column flex-axis-center oka-hero-background padding-sides-small padding-top-big">
                <Avatar name="Rafael Bizão" size="80" round={true} />
                <h1 className="color-tertiary margin-top-medium">Rafael Bizão</h1>
                <h5 className="color-tertiary margin-top-very-small">Researcher at USP</h5>
                <h6 className="color-tertiary margin-top-small">10 following | 6 followers</h6>
                <button className="button-secondary margin-vertical-small">Follow</button>
            </div>
            <OkaNavBar navItems={navItems} setLoading={setLoading} />
            <OkaPostsBox navItems={navItems} section={section} loading={loading} setLoading={setLoading} />
        </>
    )
}