import React, { useEffect, useState } from 'react';

import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import api from '../../services/api';
import { notifyError } from '../../utils';


export default function ScatterPlot({ postId, attrs }) {
    const [chartData, setChartData] = useState([]);
    const [x, setX] = useState("0");
    const [y, setY] = useState("0");
    const axisButtonsLimit = 10;

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`posts/${postId}/visualize?plt=scatter&x=${x}&y=${y}`);
                setChartData(response.data);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchData();
    }, [postId, x, y])

    function handleSelection(id, axis) {
        if (axis === 0) {
            setX(id);
        } else {
            setY(id);
        }
    }

    return (
        <div className="content-box margin-very-small padding-bottom-big">
            <div className="flex-column padding-small">
                <h2>Scatter Plot</h2>
                <h5>Binarized sample with maximum 500 entries</h5>
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
                                                    onClick={() => handleSelection(key, 0)}
                                                >
                                                    {value}
                                                </option>
                                            )}
                                    </select> :
                                    Object.entries(attrs)
                                        .map(([key, value]) =>
                                            <button key={key}
                                                onClick={() => handleSelection(key, 0)}
                                                className={`${x === key ? ("button-negative") : "button-primary"} margin-very-small`}
                                            >
                                                {value}
                                            </button>
                                        )
                            }
                        </div>
                        <div className="box flex-nowrap">
                            <span className="margin-sides-verysmall">Y</span>
                            {
                                attrs.length > axisButtonsLimit ?
                                    <select>
                                        {Object.entries(attrs)
                                            .map(([key, value]) =>

                                                <option key={key}
                                                    value={value}
                                                    onClick={() => handleSelection(key, 1)}
                                                >
                                                    {value}
                                                </option>
                                            )}
                                    </select> :
                                    Object.entries(attrs)
                                        .map(([key, value]) =>

                                            <button key={key}
                                                onClick={() => handleSelection(key, 1)}
                                                className={`${y === key ? ("button-negative") : "button-primary"} margin-very-small`}
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
                <ResponsiveScatterPlot
                    data={chartData}
                    margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
                    xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                    xFormat={function (e) { return e }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                    yFormat={function (e) { return e }}
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