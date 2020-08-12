import React from 'react';
import { NavLink } from 'react-router-dom';

import './styles.css';

import { Search, Apps, Notifications, AccountCircle, FindInPage, Home, CloudUpload } from '@material-ui/icons';

export default function OkaHeader() {

    function handleClickDropdown(e) {
        console.log(e.target)

    }
    return (
        <div className="oka-selection-menu flex-axis-center">
            <div className="oka-selection-menu-container">
                <a href="/home"><h1>Oka</h1></a>
            </div>
            <nav className="oka-selection-menu-container flex-row">
                <div className="oka-selection-menu-button inherit-width flex-crossaxis-center">
                    <NavLink to="/home" activeClassName="oka-selection-menu-button-active"><Home /></NavLink>
                </div>
                <div className="oka-selection-menu-button inherit-width flex-crossaxis-center">
                    <NavLink to="/search" activeClassName="oka-selection-menu-button-active"><FindInPage /></NavLink>
                </div>
                <div className="oka-selection-menu-button inherit-width flex-crossaxis-center">
                    <NavLink to="/upload" activeClassName="oka-selection-menu-button-active"><CloudUpload /></NavLink>
                </div>


                {/* <form>
                    <input placeholder="Search..."></input>
                    <button type="submit"><Search style={{ fill: "#c4c4c4" }} /></button>
                </form> */}

            </nav>
            <div className="oka-selection-menu-container flex-row align-right">
                <div className="oka-selection-menu-button-right margin-left-small">
                    <Apps />

                </div>
                <div className="oka-selection-menu-button-right margin-left-small">
                    <button className="dropdown"><Notifications /></button>
                </div>
                <div className="oka-selection-menu-button-right margin-left-small">
                    <button className="dropdown" >
                        <AccountCircle onClick={(e) => handleClickDropdown(e)} />
                        <div className="dropdown-content">
                            <a href="#">Link 1</a>
                            <a href="#">Link 2</a>
                            <a href="#">Link 3</a>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}