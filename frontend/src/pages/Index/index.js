import React, { useContext, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

import './styles.css';

import { LoginContext } from '../../contexts/LoginContext';
import PopOver from '../../components/PopOver';
import api, { recaptchaKey } from '../../services/api';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';

import uspLogoImg from '../../assets/usp-logo-png.png';
import okaIconOnImg from '../../assets/okaicon-on.png';
import okaIconOffImg from '../../assets/okaicon-off.png';
// import okaViewIconOnImg from '../../assets/exploreicon-on.png';
// import okaViewIconOffImg from '../../assets/exploreicon-off.png';
import e2edsImg from '../../assets/e2eds.png';
import andreImg from '../../assets/andrecarvalho.webp';
import rafaelImg from '../../assets/rafaelbizao.webp';
import daviImg from '../../assets/davi.png';
import OkaMyAccount from '../../components/OkaMyAccount';

import { Help } from '@material-ui/icons';
import { ScrollingProvider, useScrollSection, Section } from 'react-scroll-section';
import { notifyError } from "../../utils";
import { useEffect } from "react";

const StaticMenu = () => {
    const homeSection = useScrollSection('home');
    const e2edsSection = useScrollSection('e2eds');
    const getSection = useScrollSection('store');
    const exploreSection = useScrollSection('explore');
    // const learnSection = useScrollSection('learn');
    // const explainSection = useScrollSection('explain');
    const reproduceSection = useScrollSection('reproduce');
    const whoweareSection = useScrollSection('whoweare');

    return (
        <div className="flex-wrap flex-space-between">
            <div onClick={homeSection.onClick} selected={homeSection.selected} className={`color-tertiary padding-left-small cursor-pointer ${homeSection.selected && "underline-active"}`}>Home</div>
            <div id="small-hide" onClick={e2edsSection.onClick} selected={e2edsSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${e2edsSection.selected && "underline-active"}`}>End-to-End</div>
            <div id="small-hide" onClick={getSection.onClick} selected={getSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${getSection.selected && "underline-active"}`}>Store</div>
            <div id="small-hide" onClick={exploreSection.onClick} selected={exploreSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${exploreSection.selected && "underline-active"}`}>Explore</div>
            {/* <div id="small-hide" onClick={learnSection.onClick} selected={learnSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${learnSection.selected && "underline-active"}`}>Learn</div>
            <div id="small-hide" onClick={explainSection.onClick} selected={explainSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${explainSection.selected && "underline-active"}`}>Explain</div> */}
            <div id="small-hide" onClick={reproduceSection.onClick} selected={reproduceSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${reproduceSection.selected && "underline-active"}`}>Reproduce</div>
            <div onClick={whoweareSection.onClick} selected={whoweareSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${whoweareSection.selected && "underline-active"}`}>Who we are</div>
        </div>
    );
};

export default function Index() {
    const loggedUser = useContext(LoginContext);
    const [okaIconOn, setOkaIconOn] = useState(false);
    const [blockSubmit, setBlockSubmit] = useState(true);
    // const [okaViewIconOn, setOkaViewIconOn] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedUser.logged) {
            navigate("/home");
        }
    }, [loggedUser.logged, navigate])

    async function handleContactSubmit(e) {
        e.preventDefault()
        const data = {
            name: name,
            email: email,
            message: message
        }

        try {
            await api.post('contacts', data);
            alert("Thanks for the message. We will answer as soon as possible.")
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            notifyError(error);
        }
    }

    const teamMembers = [
        {
            name: "Davi Pereira dos Santos",
            position: "Postdoc Researcher",
            img: daviImg,
        },
        {
            name: "Rafael A. Bizão",
            position: "Postdoc Researcher",
            img: rafaelImg,
        },
        {
            name: "André de Carvalho",
            position: "Leading Professor",
            img: andreImg,
        },
    ];

    var settings = {
        dots: true,
        infinite: false,
        arrows: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    function TeamBadge({ name, position, img, rounded = true }) {
        return (
            <div className="flex-column flex-axis-center padding-sides-small padding-vertical-medium">
                <img
                    src={img}
                    alt="Team member"
                    height="150"
                    width="150"
                    className={`${rounded ? "radius-rounded" : ""} `}
                />
                <div className="margin-top-small">
                    <h4 className="color-tertiary">{name}</h4>
                    {position && <h6 className="lighter color-tertiary">{position}</h6>}
                </div>
            </div>
        );
    }

    const attrs = [
        "sepallength",
        "sepalwidth",
        "petallength",
        "petalwidth"
    ]

    const chartData = [
        {
            "id": "Iris-setosa",
            "data": [
                {
                    "x": 3.2,
                    "y": 1.4
                },
                {
                    "x": 3.5,
                    "y": 1.6
                },
                {
                    "x": 3,
                    "y": 1.3
                },
                {
                    "x": 3.4,
                    "y": 1.5
                },
                {
                    "x": 3.8,
                    "y": 1.5
                },
                {
                    "x": 4.1,
                    "y": 1.5
                },
                {
                    "x": 3.4,
                    "y": 1.6
                },
                {
                    "x": 3.8,
                    "y": 1.9
                },
                {
                    "x": 3.9,
                    "y": 1.7
                },
                {
                    "x": 3,
                    "y": 1.4
                },
                {
                    "x": 3.6,
                    "y": 1
                },
                {
                    "x": 3.5,
                    "y": 1.4
                },
                {
                    "x": 3.4,
                    "y": 1.4
                },
                {
                    "x": 3.1,
                    "y": 1.5
                },
                {
                    "x": 3.5,
                    "y": 1.5
                },
                {
                    "x": 3,
                    "y": 1.4
                },
                {
                    "x": 3.1,
                    "y": 1.6
                },
                {
                    "x": 3.4,
                    "y": 1.5
                },
                {
                    "x": 3.8,
                    "y": 1.6
                },
                {
                    "x": 3.6,
                    "y": 1.4
                },
                {
                    "x": 3.3,
                    "y": 1.7
                },
                {
                    "x": 3,
                    "y": 1.6
                },
                {
                    "x": 4.4,
                    "y": 1.5
                },
                {
                    "x": 3.1,
                    "y": 1.5
                },
                {
                    "x": 3.9,
                    "y": 1.3
                },
                {
                    "x": 2.9,
                    "y": 1.4
                },
                {
                    "x": 3.7,
                    "y": 1.5
                },
                {
                    "x": 3,
                    "y": 1.1
                },
                {
                    "x": 3.4,
                    "y": 1.9
                },
                {
                    "x": 4.2,
                    "y": 1.4
                },
                {
                    "x": 3.1,
                    "y": 1.5
                },
                {
                    "x": 3,
                    "y": 1.4
                },
                {
                    "x": 2.3,
                    "y": 1.3
                },
                {
                    "x": 3.4,
                    "y": 1.5
                },
                {
                    "x": 3.4,
                    "y": 1.6
                },
                {
                    "x": 3.4,
                    "y": 1.4
                },
                {
                    "x": 3.2,
                    "y": 1.2
                },
                {
                    "x": 3.7,
                    "y": 1.5
                },
                {
                    "x": 3.7,
                    "y": 1.5
                },
                {
                    "x": 3.2,
                    "y": 1.3
                },
                {
                    "x": 3.5,
                    "y": 1.4
                },
                {
                    "x": 3.5,
                    "y": 1.3
                },
                {
                    "x": 3.3,
                    "y": 1.4
                },
                {
                    "x": 3.4,
                    "y": 1.7
                },
                {
                    "x": 4,
                    "y": 1.2
                },
                {
                    "x": 3.2,
                    "y": 1.3
                },
                {
                    "x": 3.8,
                    "y": 1.7
                },
                {
                    "x": 3.2,
                    "y": 1.6
                },
                {
                    "x": 3.5,
                    "y": 1.3
                },
                {
                    "x": 3.1,
                    "y": 1.5
                }
            ]
        },
        {
            "id": "Iris-versicolor",
            "data": [
                {
                    "x": 2.9,
                    "y": 4.2
                },
                {
                    "x": 2.8,
                    "y": 4.7
                },
                {
                    "x": 2.3,
                    "y": 4.4
                },
                {
                    "x": 2.7,
                    "y": 3.9
                },
                {
                    "x": 2.9,
                    "y": 4.5
                },
                {
                    "x": 3,
                    "y": 4.2
                },
                {
                    "x": 3.1,
                    "y": 4.4
                },
                {
                    "x": 3.2,
                    "y": 4.5
                },
                {
                    "x": 3.1,
                    "y": 4.7
                },
                {
                    "x": 2.6,
                    "y": 3.5
                },
                {
                    "x": 2.3,
                    "y": 4
                },
                {
                    "x": 3.3,
                    "y": 4.7
                },
                {
                    "x": 3,
                    "y": 4.5
                },
                {
                    "x": 2.7,
                    "y": 5.1
                },
                {
                    "x": 2.3,
                    "y": 3.3
                },
                {
                    "x": 2.4,
                    "y": 3.7
                },
                {
                    "x": 3,
                    "y": 4.6
                },
                {
                    "x": 3.2,
                    "y": 4.7
                },
                {
                    "x": 2,
                    "y": 3.5
                },
                {
                    "x": 2.5,
                    "y": 3.9
                },
                {
                    "x": 2.8,
                    "y": 4
                },
                {
                    "x": 2.8,
                    "y": 4.6
                },
                {
                    "x": 2.9,
                    "y": 4.6
                },
                {
                    "x": 3.1,
                    "y": 4.9
                },
                {
                    "x": 2.8,
                    "y": 4.1
                },
                {
                    "x": 3,
                    "y": 4.4
                },
                {
                    "x": 2.4,
                    "y": 3.8
                },
                {
                    "x": 3,
                    "y": 4.5
                },
                {
                    "x": 3,
                    "y": 5
                },
                {
                    "x": 3.4,
                    "y": 4.5
                },
                {
                    "x": 2.7,
                    "y": 4.2
                },
                {
                    "x": 3.2,
                    "y": 4.8
                },
                {
                    "x": 2.9,
                    "y": 3.6
                },
                {
                    "x": 2.5,
                    "y": 4
                },
                {
                    "x": 2.7,
                    "y": 4.1
                },
                {
                    "x": 2.9,
                    "y": 4.7
                },
                {
                    "x": 2.2,
                    "y": 4
                },
                {
                    "x": 2.7,
                    "y": 3.9
                },
                {
                    "x": 2.6,
                    "y": 4
                },
                {
                    "x": 2.2,
                    "y": 4.5
                },
                {
                    "x": 2.8,
                    "y": 4.8
                },
                {
                    "x": 2.5,
                    "y": 3
                },
                {
                    "x": 2.9,
                    "y": 4.3
                },
                {
                    "x": 3,
                    "y": 4.2
                },
                {
                    "x": 2.8,
                    "y": 4.5
                },
                {
                    "x": 2.4,
                    "y": 3.3
                },
                {
                    "x": 2.5,
                    "y": 4.9
                },
                {
                    "x": 3,
                    "y": 4.1
                },
                {
                    "x": 2.9,
                    "y": 4.3
                },
                {
                    "x": 2.6,
                    "y": 4.4
                }
            ]
        },
        {
            "id": "Iris-virginica",
            "data": [
                {
                    "x": 2.7,
                    "y": 4.9
                },
                {
                    "x": 3,
                    "y": 5.8
                },
                {
                    "x": 3.1,
                    "y": 5.4
                },
                {
                    "x": 3,
                    "y": 5.5
                },
                {
                    "x": 2.7,
                    "y": 5.1
                },
                {
                    "x": 3,
                    "y": 5.1
                },
                {
                    "x": 2.5,
                    "y": 4.5
                },
                {
                    "x": 3,
                    "y": 5.2
                },
                {
                    "x": 2.7,
                    "y": 5.3
                },
                {
                    "x": 2.8,
                    "y": 5.1
                },
                {
                    "x": 3,
                    "y": 6.6
                },
                {
                    "x": 3.1,
                    "y": 5.1
                },
                {
                    "x": 2.8,
                    "y": 5.6
                },
                {
                    "x": 3,
                    "y": 4.8
                },
                {
                    "x": 3.4,
                    "y": 5.4
                },
                {
                    "x": 2.6,
                    "y": 6.9
                },
                {
                    "x": 2.8,
                    "y": 6.1
                },
                {
                    "x": 2.7,
                    "y": 5.1
                },
                {
                    "x": 2.5,
                    "y": 5.8
                },
                {
                    "x": 3.8,
                    "y": 6.7
                },
                {
                    "x": 3.8,
                    "y": 6.4
                },
                {
                    "x": 3.3,
                    "y": 5.7
                },
                {
                    "x": 3,
                    "y": 4.9
                },
                {
                    "x": 3.2,
                    "y": 5.1
                },
                {
                    "x": 3.4,
                    "y": 5.6
                },
                {
                    "x": 2.5,
                    "y": 5
                },
                {
                    "x": 3.3,
                    "y": 6
                },
                {
                    "x": 2.2,
                    "y": 5
                },
                {
                    "x": 3.2,
                    "y": 5.9
                },
                {
                    "x": 3.2,
                    "y": 5.7
                },
                {
                    "x": 2.8,
                    "y": 5.1
                },
                {
                    "x": 3,
                    "y": 5.9
                },
                {
                    "x": 2.8,
                    "y": 4.9
                },
                {
                    "x": 3.2,
                    "y": 5.3
                },
                {
                    "x": 2.5,
                    "y": 5
                },
                {
                    "x": 3,
                    "y": 5.8
                },
                {
                    "x": 2.9,
                    "y": 5.6
                },
                {
                    "x": 2.6,
                    "y": 5.6
                },
                {
                    "x": 2.9,
                    "y": 6.3
                },
                {
                    "x": 3,
                    "y": 5.5
                },
                {
                    "x": 3.6,
                    "y": 6.1
                },
                {
                    "x": 3,
                    "y": 6.1
                },
                {
                    "x": 2.8,
                    "y": 5.6
                },
                {
                    "x": 3.3,
                    "y": 5.7
                },
                {
                    "x": 3.1,
                    "y": 5.6
                },
                {
                    "x": 2.8,
                    "y": 4.8
                },
                {
                    "x": 3.1,
                    "y": 5.5
                },
                {
                    "x": 3,
                    "y": 5.2
                },
                {
                    "x": 3.2,
                    "y": 6
                },
                {
                    "x": 2.8,
                    "y": 6.7
                }
            ]
        }
    ]


    return (
        <>
            <div className="fixed-bottom-right-padding icon-big">
                <PopOver
                    component={Help}
                    componentClasses="icon-secondary cursor-pointer"
                    content=
                    {
                        <div className="margin-medium flex-column flex-axis-center">
                            <h1><Link to="/home">Contact us</Link></h1>
                            <form className="form flex-column margin-small" onSubmit={handleContactSubmit}>
                                <input
                                    placeholder="Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <textarea
                                    placeholder="Message"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                                <div className="margin-very-small">
                                    <ReCAPTCHA
                                        sitekey={recaptchaKey}
                                        onChange={() => setBlockSubmit(false)}
                                    />
                                </div>
                                {
                                    blockSubmit ?
                                        <button className="button-primary-disabled" value="click" disabled>Submit</button> :
                                        <button className="button-primary" type="submit">Submit</button>
                                }
                            </form>
                        </div>
                    }
                />
            </div>
            <ScrollingProvider>
                <Section id="home" />
                <div className="flex-row flex-axis-center flex-space-between background-primary-color padding-medium">
                    <h1 className="color-secondary">Oka</h1>
                    <img className="max-height-50" src={uspLogoImg} alt="USP Logo" />
                </div>

                <div className="flex-row flex-axis-center flex-space-between background-primary-color padding-medium sticky">
                    <StaticMenu />
                    <div className="padding-left-medium">
                        {loggedUser.logged ?
                            <div className="icon-normal">
                                <OkaMyAccount />
                            </div> :
                            <Link className="color-tertiary" to="/login">Login</Link>
                        }
                    </div>
                </div>

                <div className="hero-badges">
                    <div className="hero-badges-item" onMouseEnter={() => setOkaIconOn(true)} onMouseLeave={() => setOkaIconOn(false)}>
                        <Link to="/home">
                            <h1 className="color-tertiary">Oka repository</h1>
                            {okaIconOn ?
                                <img src={okaIconOnImg} alt="Oka repository" /> :
                                <img src={okaIconOffImg} alt="Oka repository" />
                            }
                        </Link>
                    </div>
                    {/* <div className="hero-badges-item" onMouseEnter={() => setOkaViewIconOn(true)} onMouseLeave={() => setOkaViewIconOn(false)}>
                        <Link to="/home">
                            <h1 className="color-tertiary">Explore Data</h1>
                            {okaViewIconOn ?
                                <img src={okaViewIconOnImg} alt="Oka View" /> :
                                <img src={okaViewIconOffImg} alt="Oka View" />
                            }
                        </Link>
                    </div> */}
                </div>
                <div className="padding-sides-small text-center">
                    <Section id="e2eds" className="margin-vertical-big padding-top-navbar">
                        <div className="padding-top-big">
                            <h1 className="underline-active">End-to-End Data Solution</h1>
                            <h4 className="padding-top-medium">With Oka you can store your entire data manipulation pipeline for easy reproducibility</h4>
                            <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                        </div>
                    </Section>

                    <Section id="store" className="margin-vertical-big padding-top-navbar">
                        <div className="padding-top-big">
                            <h1 className="underline-active">Store</h1>
                            <h4 className="padding-top-medium">Store all your datasets safely or download well documented datasets to work with</h4>
                            {/* <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" /> */}
                        </div>
                    </Section>

                    <Section id="explore" className="margin-vertical-big padding-top-navbar">
                        <div className="padding-top-big">
                            <h1 className="underline-active">Visualization</h1>
                            <h4 className="padding-top-medium">Visualize and explore your dataset online</h4>
                            <div className="margin-top-big height-chart content-box">
                                <ResponsiveScatterPlot
                                    data={chartData}
                                    margin={{ top: 60, right: 30, bottom: 70, left: 90 }}
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
                                        legend: attrs[0],
                                        legendPosition: 'middle',
                                        legendOffset: 46
                                    }}
                                    axisLeft={{
                                        orient: 'left',
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: 0,
                                        legend: attrs[1],
                                        legendPosition: 'middle',
                                        legendOffset: -60
                                    }}
                                    legends={[
                                        {
                                            anchor: 'bottom-right',
                                            direction: 'column',
                                            justify: false,
                                            translateX: 0,
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
                    </Section>

                    {/* <Section id="learn" className="margin-vertical-big padding-top-navbar">
                        <div className="padding-top-big">
                            <h1 className="underline-active">Extract Metafeatures</h1>
                            <h4 className="padding-top-medium">Use our automatated tool to get the best pipeline to make predictions or classifications in your data</h4>
                            <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                        </div>
                    </Section>

                    <Section id="explain" className="margin-vertical-big padding-top-navbar">
                        <div className="padding-top-big">
                            <h1 className="underline-active">Explain</h1>
                            <h4 className="padding-top-medium">Use our interpretation tool to understand what is behind your model</h4>
                            <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                        </div>
                    </Section> */}

                    <Section id="reproduce" className="margin-vertical-big padding-top-navbar padding-bottom-big">
                        <div className="padding-top-big">
                            <h1 className="underline-active">Reproduce</h1>
                            <h4 className="padding-top-medium">You can make your experiments easily reproducible and have access to the entire pipeline of transformations of public datasets</h4>
                            {/* <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" /> */}
                        </div>
                    </Section>
                </div>

                <Section id="whoweare" className="background-primary-color margin-top-big padding-bottom-big padding-top-navbar padding-sides-small text-center">
                    <div className="padding-top-big">
                        <h1 className="underline-active color-tertiary">Who we are</h1>
                        <h4 className="padding-top-medium color-tertiary">We are a small (but productive!) team of scientists</h4>
                        <div className="margin-top-medium">
                            <Slider {...settings}>
                                {teamMembers.map((member, index) => (
                                    <TeamBadge
                                        key={index}
                                        name={member.name}
                                        position={member.position}
                                        img={member.img}
                                    />
                                ))}
                            </Slider>
                        </div>
                    </div>
                </Section>

                <footer className="padding-big flex-wrap flex-crossaxis-center background-primary-color">
                    <h6 className="color-tertiary">André Carvalho Lab - CeMEAI - ICMC - University of São Paulo | Av. Trabalhador São Carlense, 200 - São Carlos/SP - Brazil</h6>
                </footer>
            </ScrollingProvider>
        </>

    );
}