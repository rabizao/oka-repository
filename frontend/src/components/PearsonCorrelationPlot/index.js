import React, { useEffect, useState } from 'react';

import { ResponsiveHeatMap } from '@nivo/heatmap';
import api from '../../services/api';
import { notifyError } from '../../utils';

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
    },
    {
        "country": "AI",
        "hot dog": 2,
        "hot dogColor": "hsl(185, 70%, 50%)",
        "burger": 71,
        "burgerColor": "hsl(38, 70%, 50%)",
        "sandwich": 59,
        "sandwichColor": "hsl(17, 70%, 50%)",
        "kebab": 51,
        "kebabColor": "hsl(356, 70%, 50%)",
        "fries": 47,
        "friesColor": "hsl(121, 70%, 50%)",
        "donut": 95,
        "donutColor": "hsl(207, 70%, 50%)",
        "junk": 40,
        "junkColor": "hsl(163, 70%, 50%)",
        "sushi": 81,
        "sushiColor": "hsl(162, 70%, 50%)",
        "ramen": 80,
        "ramenColor": "hsl(273, 70%, 50%)",
        "curry": 6,
        "curryColor": "hsl(318, 70%, 50%)",
        "udon": 45,
        "udonColor": "hsl(199, 70%, 50%)"
    },
    {
        "country": "AL",
        "hot dog": 83,
        "hot dogColor": "hsl(194, 70%, 50%)",
        "burger": 60,
        "burgerColor": "hsl(51, 70%, 50%)",
        "sandwich": 18,
        "sandwichColor": "hsl(302, 70%, 50%)",
        "kebab": 78,
        "kebabColor": "hsl(303, 70%, 50%)",
        "fries": 36,
        "friesColor": "hsl(215, 70%, 50%)",
        "donut": 14,
        "donutColor": "hsl(65, 70%, 50%)",
        "junk": 80,
        "junkColor": "hsl(276, 70%, 50%)",
        "sushi": 31,
        "sushiColor": "hsl(16, 70%, 50%)",
        "ramen": 99,
        "ramenColor": "hsl(16, 70%, 50%)",
        "curry": 55,
        "curryColor": "hsl(108, 70%, 50%)",
        "udon": 29,
        "udonColor": "hsl(163, 70%, 50%)"
    },
    {
        "country": "AM",
        "hot dog": 2,
        "hot dogColor": "hsl(197, 70%, 50%)",
        "burger": 52,
        "burgerColor": "hsl(295, 70%, 50%)",
        "sandwich": 34,
        "sandwichColor": "hsl(83, 70%, 50%)",
        "kebab": 38,
        "kebabColor": "hsl(190, 70%, 50%)",
        "fries": 19,
        "friesColor": "hsl(62, 70%, 50%)",
        "donut": 76,
        "donutColor": "hsl(203, 70%, 50%)",
        "junk": 82,
        "junkColor": "hsl(199, 70%, 50%)",
        "sushi": 13,
        "sushiColor": "hsl(132, 70%, 50%)",
        "ramen": 61,
        "ramenColor": "hsl(222, 70%, 50%)",
        "curry": 7,
        "curryColor": "hsl(239, 70%, 50%)",
        "udon": 93,
        "udonColor": "hsl(42, 70%, 50%)"
    },
    {
        "country": "AO",
        "hot dog": 5,
        "hot dogColor": "hsl(356, 70%, 50%)",
        "burger": 2,
        "burgerColor": "hsl(253, 70%, 50%)",
        "sandwich": 51,
        "sandwichColor": "hsl(67, 70%, 50%)",
        "kebab": 78,
        "kebabColor": "hsl(86, 70%, 50%)",
        "fries": 55,
        "friesColor": "hsl(260, 70%, 50%)",
        "donut": 72,
        "donutColor": "hsl(239, 70%, 50%)",
        "junk": 46,
        "junkColor": "hsl(166, 70%, 50%)",
        "sushi": 81,
        "sushiColor": "hsl(212, 70%, 50%)",
        "ramen": 35,
        "ramenColor": "hsl(34, 70%, 50%)",
        "curry": 93,
        "curryColor": "hsl(156, 70%, 50%)",
        "udon": 52,
        "udonColor": "hsl(78, 70%, 50%)"
    },
    {
        "country": "AQ",
        "hot dog": 83,
        "hot dogColor": "hsl(128, 70%, 50%)",
        "burger": 47,
        "burgerColor": "hsl(296, 70%, 50%)",
        "sandwich": 86,
        "sandwichColor": "hsl(59, 70%, 50%)",
        "kebab": 89,
        "kebabColor": "hsl(315, 70%, 50%)",
        "fries": 57,
        "friesColor": "hsl(39, 70%, 50%)",
        "donut": 62,
        "donutColor": "hsl(111, 70%, 50%)",
        "junk": 61,
        "junkColor": "hsl(176, 70%, 50%)",
        "sushi": 9,
        "sushiColor": "hsl(235, 70%, 50%)",
        "ramen": 1,
        "ramenColor": "hsl(206, 70%, 50%)",
        "curry": 35,
        "curryColor": "hsl(148, 70%, 50%)",
        "udon": 84,
        "udonColor": "hsl(354, 70%, 50%)"
    }
]

export default function PearsonCorrelationPlot({ postId, attrs }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`posts/${postId}/visualize?plt=pearsoncorrelation`);
                setChartData(response.data);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchData();
    }, [postId])

    return (
        <div className="content-box margin-very-small padding-bottom-big">
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
        </div>
    )
}