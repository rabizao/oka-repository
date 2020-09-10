import React, { useState } from 'react';
import { useLocation } from 'react-router';
import queryString from 'query-string';

import './styles.css';

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaFilterBox from '../../components/OkaFilterBox';
import OkaPostsBox from '../../components/OkaPostsBox';

export default function Search(props) {
    const location = useLocation();
    const section = props.match.params.section;
    const parsedQueries = queryString.parse(location.search);

    const [filter, setFilter] = useState(false);

    const textBox = (text) => {
        return (
            <div className="content-box margin-very-small">
                <div className="flex-row flex-space-between padding-sides-small padding-vertical-small text-box">
                    {text}
                </div>
            </div>
        )
    }

    const datasets = () => {
        return (
            <div className="content-box margin-very-small">
                <button className="button-primary margin-small" onClick={() => setFilter(!filter)}>
                    {filter ? "Clear Filters" : "Filter"}
                </button>
                {filter &&
                    <div className="padding-sides-small padding-bottom-medium">
                        <OkaFilterBox query={location.search} />
                    </div>
                }
                <OkaPostsBox fetch_url={"/posts" + location.search} />
            </div>
        )
    }

    const navItems = {
        datasets: {
            "name": "Datasets",
            "url": "/search/datasets" + location.search,
            "content": datasets()
        },
        people: {
            "name": "People",
            "url": "/search/people" + location.search,
            "content": textBox("People not implemented yet.")
        },
        tags: {
            "name": "Tags",
            "url": "/search/tags" + location.search,
            "content": textBox("Tags not implemented yet.")
        }
    }

    return (
        <>
            <OkaHeader query={parsedQueries.name} />
            <div className="oka-hero-background padding-sides-small padding-top-big">
                <h3 className="color-tertiary">{parsedQueries.name ? `Search results for: ${parsedQueries.name}` : `Browsing all ${section}`}</h3>
            </div>

            <OkaNavBar navItems={navItems} />
            {section in navItems ? <>{navItems[section].content}</> : textBox("Section not found.")}
        </>
    )
}