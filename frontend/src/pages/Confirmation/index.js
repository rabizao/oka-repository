import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import './styles.css';

export default function Confirmation(props) {
    const history = useHistory();
    const [key, setKey] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        history.push(`/confirmation/submit?username=${props.location.state.username}&key=${key}`)
    }

    return (
        <div className="margin-top-big flex-column flex-axis-center">
            <h1><Link to="/home">Oka</Link></h1>
            {
                props.location && props.location.state && props.location.state.username && props.location.state.email ? (
                    <>
                        <h6 className="margin-top-small max-width-very-huge">We sent a confirmation key to {props.location.state.email}. Please write it down below in order to confirm your email.</h6>
                        <form className="form flex-column content-box margin-very-small margin-top-small" onSubmit={handleSubmit}>
                            <input
                                placeholder="key"
                                value={key}
                                onChange={e => setKey(e.target.value)}
                            />
                            <button className="button-primary" type="submit">Send</button>
                        </form>
                    </>
                ) :
                    <h6 className="margin-top-small max-width-very-huge">Not possible to confirm your email here. Please click on the link we sent you by email.</h6>
            }
            <h6 className="margin-top-small"><Link className="link-underline" to="/confirmation/resend">Resend confirmation key</Link></h6>
            <h6 className="margin-top-small"><Link className="link-underline" to="/login">Login instead</Link></h6>
        </div>
    )
}