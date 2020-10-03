import React, { useContext, useState } from "react";
import { Link } from 'react-router-dom';

import './styles.css';

import { LoginContext } from '../../contexts/LoginContext';
import { logout } from '../../services/auth';
import PopOver from '../../components/PopOver';
import api from '../../services/api';

import uspLogoImg from '../../assets/usp-logo-png.png';
import okaIconOnImg from '../../assets/okaicon-on.png';
import okaIconOffImg from '../../assets/okaicon-off.png';
// import okaViewIconOnImg from '../../assets/exploreicon-on.png';
// import okaViewIconOffImg from '../../assets/exploreicon-off.png';
import e2edsImg from '../../assets/e2eds.png';

import Avatar from 'react-avatar';
import { AccountCircle, Help } from '@material-ui/icons';
import { ScrollingProvider, useScrollSection, Section } from 'react-scroll-section';
import { NotificationManager } from 'react-notifications';

const StaticMenu = () => {
    const homeSection = useScrollSection('home');
    const e2edsSection = useScrollSection('e2eds');
    const getSection = useScrollSection('get');
    const exploreSection = useScrollSection('explore');
    const learnSection = useScrollSection('learn');
    const explainSection = useScrollSection('explain');
    const reproduceSection = useScrollSection('reproduce');
    const whoweareSection = useScrollSection('whoweare');

    return (
        <div className="flex-wrap flex-space-between">
            <div onClick={homeSection.onClick} selected={homeSection.selected} className={`color-tertiary padding-left-small cursor-pointer ${homeSection.selected && "underline-active"}`}>Home</div>
            <div id="small-hide" onClick={e2edsSection.onClick} selected={e2edsSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${e2edsSection.selected && "underline-active"}`}>End-to-End</div>
            <div id="small-hide" onClick={getSection.onClick} selected={getSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${getSection.selected && "underline-active"}`}>Get</div>
            <div id="small-hide" onClick={exploreSection.onClick} selected={exploreSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${exploreSection.selected && "underline-active"}`}>Explore</div>
            <div id="small-hide" onClick={learnSection.onClick} selected={learnSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${learnSection.selected && "underline-active"}`}>Learn</div>
            <div id="small-hide" onClick={explainSection.onClick} selected={explainSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${explainSection.selected && "underline-active"}`}>Explain</div>
            <div id="small-hide" onClick={reproduceSection.onClick} selected={reproduceSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${reproduceSection.selected && "underline-active"}`}>Reproduce</div>
            <div onClick={whoweareSection.onClick} selected={whoweareSection.selected} className={`color-tertiary padding-left-medium cursor-pointer ${whoweareSection.selected && "underline-active"}`}>Who we are</div>
        </div>
    );
};

export default function Index() {
    const loggedUser = useContext(LoginContext);
    const [okaIconOn, setOkaIconOn] = useState(false);
    // const [okaViewIconOn, setOkaViewIconOn] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    function handleLogout() {
        logout();
        window.location.href = '/';
        return
    }

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
            if (error.response) {
                for (var prop in error.response.data.errors.json) {
                    NotificationManager.error(error.response.data.errors.json[prop], `${prop}`, 4000)
                }
            } else {
                NotificationManager.error("network error", "error", 4000)
            }
        }
    }

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
                                <button className="button-primary" type="submit">Submit</button>
                            </form>
                        </div>
                    }
                />
            </div>
            <ScrollingProvider>
                <Section id="home" />
                <div className="flex-row flex-axis-center flex-space-between background-primary-color padding-medium">
                    <h1 className="color-secondary">Analytics Lab</h1>
                    <img className="max-height-50" src={uspLogoImg} alt="USP Logo" />
                </div>

                <div className="flex-row flex-space-between background-primary-color padding-big sticky">
                    <StaticMenu />
                    <div className="padding-left-medium">
                        {loggedUser.logged ?
                            <div className="icon-normal">
                                <PopOver
                                    component={AccountCircle}
                                    componentClasses="icon-tertiary cursor-pointer"
                                    content=
                                    {
                                        <div className="flex-column flex-axis-center padding-vertical-medium">
                                            <Link className="padding-sides-medium" to={`/users/${loggedUser.username}/uploads`}><Avatar name={loggedUser.name} size="70" round={true} /></Link>
                                            <button onClick={handleLogout} className="margin-top-medium padding-sides-medium padding-vertical-small box background-hover width100">Logout</button>
                                        </div>
                                    }
                                />
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

                <Section id="e2eds" className="margin-vertical-big padding-top-navbar">
                    <div className="flex-column flex-axis-center padding-top-big">
                        <h1 className="underline-active">End-to-End Data Science</h1>
                        <h4 className="padding-top-medium">With Oka you can handle the entire data science pipeline</h4>
                        <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                    </div>
                </Section>

                <Section id="get" className="margin-vertical-big padding-top-navbar">
                    <div className="flex-column flex-axis-center padding-top-big">
                        <h1 className="underline-active">Oka Repository</h1>
                        <h4 className="padding-top-medium">Get new data or store all your data safely</h4>
                        <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                    </div>
                </Section>

                <Section id="explore" className="margin-vertical-big padding-top-navbar">
                    <div className="flex-column flex-axis-center padding-top-big">
                        <h1 className="underline-active">Tupa View</h1>
                        <h4 className="padding-top-medium">Visualize and explore your data online</h4>
                        <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                    </div>
                </Section>

                <Section id="learn" className="margin-vertical-big padding-top-navbar">
                    <div className="flex-column flex-axis-center padding-top-big">
                        <h1 className="underline-active">Extract Metafeatures</h1>
                        <h4 className="padding-top-medium">Use our automatated tool to get the best pipeline to make predictions or classifications in your data</h4>
                        <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                    </div>
                </Section>

                <Section id="explain" className="margin-vertical-big padding-top-navbar">
                    <div className="flex-column flex-axis-center padding-top-big">
                        <h1 className="underline-active">Explain</h1>
                        <h4 className="padding-top-medium">Use our interpretation tool to understand what is behind your model</h4>
                        <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                    </div>
                </Section>

                <Section id="reproduce" className="margin-vertical-big padding-top-navbar padding-bottom-big">
                    <div className="flex-column flex-axis-center padding-top-big">
                        <h1 className="underline-active">Reproduce</h1>
                        <h4 className="padding-top-medium">You can always reproduce your experiments and get the entire pipeline of public experiments</h4>
                        <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                    </div>
                </Section>

                <Section id="whoweare" className="background-primary-color margin-top-big padding-bottom-big padding-top-navbar">
                    <div className="flex-column flex-axis-center padding-top-big">
                        <h1 className="underline-active color-tertiary">Who we are</h1>
                        <h4 className="padding-top-medium color-tertiary">We are a small (but productive!) team of scientists</h4>
                        <img src={e2edsImg} className="padding-top-big max-width-images" alt="End to End Data Science" />
                    </div>
                </Section>
                <footer className="padding-big flex-wrap flex-crossaxis-center background-primary-color">
                    <h6 className="color-tertiary">CeMEAI - ICMC - University of São Paulo | Av. Trabalhador São Carlense, 200 - São Carlos/SP - Brazil</h6>
                </footer>
            </ScrollingProvider>
        </>

    );
}