import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import queryString from 'query-string';

import './styles.css';

import OkaHeader from '../../components/OkaHeader';
import OkaNavBar from '../../components/OkaNavBar';
import OkaPostsBox from '../../components/OkaPostsBox';
import OkaProfileBox from '../../components/OkaProfileBox';

const filterOptions = {
    Tasks: [
        {
            title: "Classification",
            tag: "classification"
        },
        {
            title: "Regression",
            tag: "regression"
        },
        {
            title: "Clustering",
            tag: "clustering"
        },
        {
            title: "Others",
            tag: "other_tasks"
        }
    ],
    Domains: [
        {
            title: "Life Sciences",
            tag: "life_sciences"
        },
        {
            title: "Physical Sciences",
            tag: "physical_sciences"
        },
        {
            title: "Engineering",
            tag: "engineering"
        },
        {
            title: "Social",
            tag: "social"
        },
        {
            title: "Business",
            tag: "business"
        },
        {
            title: "Finances",
            tag: "finances"
        },
        {
            title: "Astronomy",
            tag: "astronomy"
        },
        {
            title: "Medical",
            tag: "medical"
        },
        {
            title: "Others",
            tag: "other_domains"
        }
    ],
    Features: [
        {
            title: "Categorical",
            tag: "categorical"
        },
        {
            title: "Numerical",
            tag: "numerical"
        },
        {
            title: "Text",
            tag: "text"
        },
        {
            title: "Images",
            tag: "images"
        },
        {
            title: "Time Series",
            tag: "time_series"
        },
        {
            title: "Others",
            tag: "other_features"
        }
    ]
}

export default function Search(props) {
    const location = useLocation();
    const section = props.match.params.section;
    const history = useHistory();
    const [parsedQueries, setParsedQueries] = useState(queryString.parse(location.search));
    const [filter, setFilter] = useState(false);

    useEffect(() => {
        setParsedQueries(queryString.parse(location.search));
    }, [location.search])

    function handleSelection(tag) {
        var newParsedQueries = { ...parsedQueries };

        if (newParsedQueries[tag]) {
            delete newParsedQueries[tag];
        } else {
            newParsedQueries[tag] = "true";
        }

        setParsedQueries(newParsedQueries);
        history.push("datasets?" + queryString.stringify(newParsedQueries));
    }

    const textBox = (text) => {
        return (
            <div className="content-box margin-very-small">
                <div className="flex-row flex-space-between padding-sides-small padding-vertical-small text-box">
                    {text}
                </div>
            </div>
        )
    }

    function handleFilterButton() {
        if (filter === true) {
            const newParsedQueries = { "logic": "and", "name": parsedQueries.name };
            setParsedQueries(newParsedQueries);
            history.push("datasets?" + queryString.stringify(newParsedQueries));

        }
        setFilter(!filter);
    }

    const datasets = () => {
        return (
            <div className="content-box margin-very-small">
                <button className={`${filter ? "button-negative" : "button-primary"} margin-small`} onClick={handleFilterButton}>
                    {filter ? "Clear Filters" : "Filter"}
                </button>
                {filter &&
                    <div className="padding-sides-small padding-bottom-medium">
                        <div className="flex-column content-box padding-small">
                            {Object.entries(filterOptions).map(([option, obj]) =>
                                <div key={option}>
                                    <h3 className="margin-very-small">{option}</h3>
                                    {obj.map((item) =>
                                        <button
                                            key={item.tag}
                                            onClick={() => handleSelection(item.tag)}
                                            className={`${parsedQueries[item.tag] ? ("button-negative") : "button-primary"} margin-very-small`}
                                        >
                                            {item.title}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                }
                <OkaPostsBox fetch_url={"/posts" + location.search} />
            </div>
        )
    }

    const people = () => {
        return (
            <OkaProfileBox fetch_url={"/users" + location.search} />
        )
    }

    const navItems = {
        datasets: {
            "name": "Datasets",
            "url": "/search/datasets?" + queryString.stringify(parsedQueries) + "&logic=and",
            "content": datasets()
        },
        people: {
            "name": "People",
            "url": "/search/people?name=" + parsedQueries.name,
            "content": people()
        }
    }

    return (
        <>
            <OkaHeader query={parsedQueries.name} section={section}/>
            <div className="oka-hero-background padding-sides-small padding-top-big">
                <h3 className="color-tertiary">{parsedQueries.name ? `Search results for: ${parsedQueries.name}` : `Browsing all ${section}`}</h3>
            </div>

            <OkaNavBar navItems={navItems} />
            <div className="margin-bottom-huge">{section in navItems ? navItems[section].content : textBox("Section not found.")}</div>
        </>
    )
}