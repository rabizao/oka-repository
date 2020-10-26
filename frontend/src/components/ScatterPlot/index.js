import React, { useEffect, useState } from 'react';

import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import api from '../../services/api';
import { notifyError } from '../../utils';

const options = [
    {
        id: 0,
        name: "Setosa"
    },
    {
        id: 1,
        name: "Versicolor"
    },
    {
        id: 2,
        name: "Virginia"
    }
]

export default function ScatterPlot({ postId, attrs }) {
    const [chartData, setChartData] = useState([]);
    const [x, setX] = useState("0");
    const [y, setY] = useState("0");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`posts/${postId}/stats?plt=scatter&x=${x}&y=${y}`);
                setChartData(response.data);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchData();
    }, [postId, x, y])

    function handleSelection(id, axis) {
        if (axis == 0) {
            setX(id);
            console.log(id)
        } else {
            setY(id);
        }
    }

    return (
        <div className="content-box margin-very-small padding-bottom-big">
            <div className="flex-column padding-small">
                <h2>Scatter Plot</h2>
                {
                    // options.length > 10 ?
                    //     <h1>Big</h1> :
                    <>
                        <div>
                            {attrs && Object.entries(attrs)
                                .map(([key, value]) =>
                                    <button key={key}
                                        onClick={() => handleSelection(key, 0)}
                                        className={`${x === key ? ("button-negative") : "button-primary"} margin-very-small`}
                                    >                                        
                                        {value}
                                    </button>
                                )}
                        </div>
                        <div>
                            {attrs && Object.entries(attrs)
                                .map(([key, value]) =>
                                    <button key={key}
                                        onClick={() => handleSelection(key, 1)}
                                        className={`${y === key ? ("button-negative") : "button-primary"} margin-very-small`}
                                    >
                                        {value}
                                    </button>
                                )}
                        </div>
                    </>
                }
            </div>
            <div className="height-chart">
                <ResponsiveScatterPlot
                    data={chartData}
                    margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
                    xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                    xFormat={function (e) { return e + " kg" }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                    yFormat={function (e) { return e + " cm" }}
                    blendMode="multiply"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: attrs && attrs[x],
                        legendPosition: 'middle',
                        legendOffset: 46
                    }}
                    axisLeft={{
                        orient: 'left',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: attrs && attrs[y],
                        legendPosition: 'middle',
                        legendOffset: -60
                    }}
                    legends={[
                        {
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 130,
                            translateY: 0,
                            itemWidth: 100,
                            itemHeight: 12,
                            itemsSpacing: 5,
                            itemDirection: 'left-to-right',
                            symbolSize: 12,
                            symbolShape: 'circle',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                />
            </div>
        </div>
    )
}