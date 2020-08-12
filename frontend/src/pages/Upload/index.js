import React from 'react';

import './styles.css';

import OkaHeader from '../../components/OkaHeader';
import { CloudUpload } from '@material-ui/icons';

export default function Search() {
    return(
        <>
            <OkaHeader />
            <div className="row margin-top-medium">
                <div className="column">
                    <div className="flex-column flex-axis-center flex-crossaxis-center content-box">
                        <h2>Upload your arff datasets here</h2>
                        <CloudUpload style={{ fill: "#A5DE37", fontSize: 50 }} />
                    </div>
                </div>
            </div>
        </>
    )
}