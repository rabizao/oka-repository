import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

export default function Index() { 
    return (
        <h1>Go to <Link to="/home">Home</Link></h1>
    )
}