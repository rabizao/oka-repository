import React, { useState } from 'react';

import './styles.css';

import OkaHeader from '../../components/OkaHeader';
import Modal from '@material-ui/core/Modal';
import api from '../../services/api';
import { notifyError } from '../../utils';

export default function OkaClient() {
    const [openApiToken, setOpenApiToken] = useState(false);
    const [apiToken, setApiToken] = useState('');

    function handleOpenApiToken() {
        setOpenApiToken(true);
    }

    function handleCloseApiToken() {
        setOpenApiToken(false);
    }

    async function handleGetApiToken() {
        try {
            const response = await api.post('auth/create-api-token')
            setApiToken(response.data.api_token)
        } catch (error) {
            notifyError(error);
        }
    }

    return (
        <>
            <Modal
                open={openApiToken}
                onClose={handleCloseApiToken}
            >
                <div className="modal padding-big">
                    <h3 className="margin-top-small">Request API Token</h3>
                    <br />
                    <span>A token is used to interact with OKA without having to enter in the web interface. Please click on
                    the button bellow to generate your token. After generating your token, store it in a safe place.
                    Please note that if you generate a new token the old one will not be valid anymore.
                    </span>
                    <br />
                    <button onClick={handleGetApiToken} className="button-primary margin-top-small">Generate Token</button>
                    <br />
                    {apiToken && <div className="padding-small wrapword background-secondary-color-light">{apiToken}</div>}
                </div>
            </Modal>
            <OkaHeader />
            <div className="content-box margin-very-very-small">
                <div className="flex-column flex-axis-center padding-sides-small">
                    <h1 className="margin-top-big">OKA Client</h1>
                    <h5 className="margin-top-small">With OKA Client you can have access to all data sets directly from your Machine Learning model code</h5>
                    <div className="flex-row flex-axis-center margin-top-small margin-bottom-big">
                        <button onClick={handleOpenApiToken} className="button-primary">Get Token</button>
                        <a className="margin-left-small" href="https://rabizao.github.io/oka" target="blank"><button className="button-primary">Documentation</button></a>
                    </div>                    
                </div>
            </div>
        </>
    )
}