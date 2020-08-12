import React from 'react';

import './styles.css';

export default function OkaFilterBox() {

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
                tag: "categorical"
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

    console.log(filterOptions.Domains);

    return (
        <div className="row-nowrap content-box">
            {Object.entries(filterOptions)
                .map(([option, obj]) =>
                    <div className="flex-column padding-small margin-small">
                        <h3 className="padding-vertical-verysmall">{option}</h3>
                        {obj.map((item) => <span className="box padding-small"><h6>{item.title}</h6></span>)}
                    </div>
                )}
        </div>
    )
}