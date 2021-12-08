import React, { useEffect, useState } from 'react';

import { ResponsiveBar } from '@nivo/bar';
import api from '../../services/api';
import { notifyError } from '../../utils';
import { CircularProgress } from '@material-ui/core';

export default function HistogramPlot({ postId, attrs }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [render, setRender] = useState(0);
    const [x, setX] = useState("0");
    const axisButtonsLimit = 10;

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`posts/${postId}/visualize?plot=histogram&x=${x}`);
                setChartData(response.data);
                setError(false);
            } catch (error) {
                notifyError(error, false);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [postId, x, render])

    function handleReload() {
        setRender(render + 1);
        setLoading(true);
    }

    return (
        <div className="content-box margin-very-very-small padding-bottom-big">
            {loading ?
                <div className="flex-row flex-crossaxis-center padding-big"><CircularProgress /></div> :

                error ?
                    <div className="flex-row flex-crossaxis-center flex-axis-center padding-big">
                        <div className="margin-sides-verysmall">Problem loading, try to </div>
                        <button className="button-primary" onClick={handleReload}>Reload</button>
                    </div> :
                    <>
                        <div className="flex-column padding-small">
                            <h2>Histogram Plot</h2>
                            <h5>Binarized sample splitted in 10 pieces</h5>
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
                                                            className={`${x === key ? ("button-negative") : "button-primary"} margin-very-very-small`}
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
                                data={chartData}
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
                    </>
            }
        </div>
    )
}