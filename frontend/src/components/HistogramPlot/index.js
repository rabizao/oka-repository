import React, { useEffect, useState } from 'react';

import { ResponsiveBar } from '@nivo/bar';
import api from '../../services/api';
import { notifyError } from '../../utils';

const mockData = [
    {
        "x": 1,
        "count": 50,
    },
    {
        "x": 2,
        "count": 30,
    },
    {
        "x": 3,
        "count": 10,
    },
    {
        "x": 4,
        "count": 20,
    },
    {
        "x": 5,
        "count": 60,
    },
    {
        "x": 6,
        "count": 60,
    },
    {
        "x": 7,
        "count": 70,
    }
]

export default function HistogramPlot({ postId, attrs }) {
    const [chartData, setChartData] = useState([]);
    const [x, setX] = useState("0");
    const axisButtonsLimit = 10;

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`posts/${postId}/visualize?plt=histogram&x=${x}`);
                setChartData(response.data);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchData();
    }, [postId, x])

    return (
        <div className="content-box margin-very-small padding-bottom-big">
            <div className="flex-column padding-small">
                <h2>Histogram Plot</h2>
                <h5>Description</h5>
                {
                    attrs &&
                    <>
                        <div className="box flex-nowrap">
                            <span className="margin-sides-verysmall">X</span>
                            {
                                attrs.length > axisButtonsLimit ?
                                    <select>
                                        {Object.entries(attrs)
                                            .map(([key, value]) =>
                                                <option key={key}
                                                    value={value}
                                                    onClick={() => setX(key)}
                                                >
                                                    {value}
                                                </option>
                                            )}
                                    </select> :
                                    Object.entries(attrs)
                                        .map(([key, value]) =>
                                            <button key={key}
                                                onClick={() => setX(key)}
                                                className={`${x === key ? ("button-negative") : "button-primary"} margin-very-small`}
                                            >
                                                {value}
                                            </button>
                                        )
                            }
                        </div>
                    </>
                }
            </div>
            <div className="height-chart">
                <ResponsiveBar
                    data={mockData}
                    keys={["count"]}
                    indexBy="x"
                    margin={{ top: 50, right: 30, bottom: 50, left: 60 }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: attrs && attrs[x],
                        legendPosition: 'middle',
                        legendOffset: 32
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'count',
                        legendPosition: 'middle',
                        legendOffset: -40
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                />
            </div>
        </div>
    )
}