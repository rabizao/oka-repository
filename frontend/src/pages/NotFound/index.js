import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <>
            <div className="margin-top-big flex-column flex-axis-center">
                <h1><Link to="/">Oka</Link></h1>
                <h5 className="margin-top-small">Page not found</h5>
                <h5 className="margin-top-small">Go to <Link className="link-underline" to="/">home</Link></h5>
            </div>
        </>
    )
}