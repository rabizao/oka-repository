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
    const queries = queryString.parse(location.search);
    const query = queries.query ? queries.query : "";
    const queryStr = query ? `?query=${query}` : "";
    const [loadingSection, setLoadingSection] = useState(true);

    const [filter, setFilter] = useState(false);

    const navItems = {
        datasets: {
            "name": "Datasets",
            "url": "/search/datasets" + queryStr,
            "fetch_url": "/search/datasets" + queryStr
        },
        people: {
            "name": "People",
            "url": "/search/people" + queryStr,
            "fetch_url": "/search/people" + queryStr
        },
        tags: {
            "name": "Tags",
            "url": "/search/tags" + queryStr,
            "fetch_url": "/search/tags" + queryStr
        }
    }

    return (
        <>
            <OkaHeader query={query} />
            <div className="oka-hero-background padding-sides-small padding-top-big">
                <h3 className="color-tertiary">{query ? `Search results for: ${query}` : `Browsing all ${section}`}</h3>
                {section === "datasets" &&
                    <button className="button-secondary margin-vertical-small" onClick={() => setFilter(!filter)}>
                        {filter ? "Clear Filters" : "Filter"}
                    </button>
                }
            </div>

            <OkaNavBar navItems={navItems} setLoading={setLoadingSection} />

            {section === "datasets" &&
                (filter &&
                    <div className="padding-sides-small padding-top-medium">
                        <OkaFilterBox />
                    </div>
                )
            }

            {
                section === "datasets" ?
                    <OkaPostsBox navItems={navItems} section={section} loading={loadingSection} setLoading={setLoadingSection} /> :

                    <div className="content-box padding-big">
                        {
                            section === "people" ?
                                <div>Not supported yet</div> :
                                section === "tags" ?
                                    <div>Not supported yet</div> :
                                    <div>Not found</div>
                        }
                    </div>
            }
        </>
    )
}