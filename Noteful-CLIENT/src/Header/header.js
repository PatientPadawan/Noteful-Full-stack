import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
    return(
        <Link to={'/'}>
            <h1>Noteful</h1>
        </Link>
    )
}