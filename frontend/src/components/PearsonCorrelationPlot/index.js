import React, { useEffect, useState } from 'react';

import { ResponsiveHeatMap } from '@nivo/heatmap';
// import api from '../../services/api';
import { notifyError } from '../../utils';
import { CircularProgress } from '@material-ui/core';

const mockData = [
    {
        "country": "AD",
        "hot dog": 23,
        "hot dogColor": "hsl(336, 70%, 50%)",
        "burger": 51,
        "burgerColor": "hsl(111, 70%, 50%)",
        "sandwich": 13,
        "sandwichColor": "hsl(177, 70%, 50%)",
        "kebab": 70,
        "kebabColor": "hsl(263, 70%, 50%)",
        "fries": 77,
        "friesColor": "hsl(294, 70%, 50%)",
        "donut": 70,
        "donutColor": "hsl(144, 70%, 50%)",
        "junk": 98,
        "junkColor": "hsl(137, 70%, 50%)",
        "sushi": 12,
        "sushiColor": "hsl(250, 70%, 50%)",
        "ramen": 51,
        "ramenColor": "hsl(23, 70%, 50%)",
        "curry": 92,
        "curryColor": "hsl(21, 70%, 50%)",
        "udon": 64,
        "udonColor": "hsl(324, 70%, 50%)"
    },
    {
        "country": "AE",
        "hot dog": 69,
        "hot dogColor": "hsl(257, 70%, 50%)",
        "burger": 28,
        "burgerColor": "hsl(299, 70%, 50%)",
        "sandwich": 47,
        "sandwichColor": "hsl(132, 70%, 50%)",
        "kebab": 50,
        "kebabColor": "hsl(225, 70%, 50%)",
        "fries": 80,
        "friesColor": "hsl(173, 70%, 50%)",
        "donut": 38,
        "donutColor": "hsl(297, 70%, 50%)",
        "junk": 3,
        "junkColor": "hsl(37, 70%, 50%)",
        "sushi": 30,
        "sushiColor": "hsl(293, 70%, 50%)",
        "ramen": 72,
        "ramenColor": "hsl(280, 70%, 50%)",
        "curry": 91,
        "curryColor": "hsl(314, 70%, 50%)",
        "udon": 9,
        "udonColor": "hsl(303, 70%, 50%)"
    },
    {
        "country": "AF",
        "hot dog": 5,
        "hot dogColor": "hsl(228, 70%, 50%)",
        "burger": 19,
        "burgerColor": "hsl(312, 70%, 50%)",
        "sandwich": 12,
        "sandwichColor": "hsl(219, 70%, 50%)",
        "kebab": 3,
        "kebabColor": "hsl(71, 70%, 50%)",
        "fries": 31,
        "friesColor": "hsl(98, 70%, 50%)",
        "donut": 89,
        "donutColor": "hsl(321, 70%, 50%)",
        "junk": 55,
        "junkColor": "hsl(215, 70%, 50%)",
        "sushi": 29,
        "sushiColor": "hsl(257, 70%, 50%)",
        "ramen": 97,
        "ramenColor": "hsl(264, 70%, 50%)",
        "curry": 43,
        "curryColor": "hsl(343, 70%, 50%)",
        "udon": 44,
        "udonColor": "hsl(305, 70%, 50%)"
    },
    {
        "country": "AG",
        "hot dog": 99,
        "hot dogColor": "hsl(22, 70%, 50%)",
        "burger": 31,
        "burgerColor": "hsl(334, 70%, 50%)",
        "sandwich": 71,
        "sandwichColor": "hsl(343, 70%, 50%)",
        "kebab": 0,
        "kebabColor": "hsl(109, 70%, 50%)",
        "fries": 6,
        "friesColor": "hsl(175, 70%, 50%)",
        "donut": 85,
        "donutColor": "hsl(163, 70%, 50%)",
        "junk": 25,
        "junkColor": "hsl(118, 70%, 50%)",
        "sushi": 75,
        "sushiColor": "hsl(303, 70%, 50%)",
        "ramen": 44,
        "ramenColor": "hsl(172, 70%, 50%)",
        "curry": 40,
        "curryColor": "hsl(75, 70%, 50%)",
        "udon": 70,
        "udonColor": "hsl(50, 70%, 50%)"
    }
]

export default function PearsonCorrelationPlot({ postId, attrs }) {
    // const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [render, setRender] = useState(0);

    useEffect(() => {
        async function fetchData() {
            try {
                // const response = await api.get(`posts/${postId}/visualize?plt=pearsoncorrelation`);
                // setChartData(response.data);
                setError(false);
            } catch (error) {
                notifyError(error, false);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [postId, render])

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
                            <h2>Pearson Correlation Plot</h2>
                            <h5>Description</h5>
                        </div>
                        <div className="height-chart">
                            <ResponsiveHeatMap
                                data={mockData}
                                keys={[
                                    'hot dog',
                                    'burger',
                                    'sandwich',
                                    'kebab',
                                    'fries',
                                    'donut',
                                    'junk',
                                    'sushi',
                                    'ramen',
                                    'curry',
                                    'udon'
                                ]}
                                indexBy="country"
                                margin={{ top: 100, right: 60, bottom: 60, left: 60 }}
                                forceSquare={true}
                                axisTop={{ orient: 'top', tickSize: 5, tickPadding: 5, tickRotation: -90, legend: '', legendOffset: 36 }}
                                axisRight={null}
                                axisBottom={null}
                                axisLeft={{
                                    orient: 'left',
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: 'country',
                                    legendPosition: 'middle',
                                    legendOffset: -40
                                }}
                                cellOpacity={1}
                                cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                                labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
                                defs={[
                                    {
                                        id: 'lines',
                                        type: 'patternLines',
                                        background: 'inherit',
                                        color: 'rgba(0, 0, 0, 0.1)',
                                        rotation: -45,
                                        lineWidth: 4,
                                        spacing: 7
                                    }
                                ]}
                                fill={[{ id: 'lines' }]}
                                animate={true}
                                motionConfig="wobbly"
                                motionStiffness={80}
                                motionDamping={9}
                                hoverTarget="cell"
                                cellHoverOthersOpacity={0.25}
                            />
                        </div>
                    </>
            }
        </div>
    )
}