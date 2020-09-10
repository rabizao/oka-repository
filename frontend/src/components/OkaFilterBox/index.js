import React, { useState } from 'react';

import './styles.css';
import { useHistory } from 'react-router-dom';

export default function OkaFilterBox(props) {
    const history = useHistory();
    const query = props.query || "?";

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

    function handleSelection(tag) {
        history.push(query.concat("&", tag, "=true"));
    }

    return (
        <div className="row-nowrap content-box margin-very-small">
            {Object.entries(filterOptions)
                .map(([option, obj]) =>
                    <div key={option} className="flex-column padding-small margin-small">
                        <h3 className="padding-vertical-verysmall">{option}</h3>
                        {obj.map((item) => <button key={item.tag} onClick={() => handleSelection(item.tag)} className="box padding-small"><h6>{item.title}</h6></button>)}
                    </div>
                )}
        </div>
    )
}