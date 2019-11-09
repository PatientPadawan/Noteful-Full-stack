import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import './folder.css';

export default function Folder(props) {
    return (
        <li className='folder'>
           <NavLink 
                to={`/folder/${props.id}`} 
                className="navLink"
            >
                {props.folderName}
           </NavLink>
        </li>
    )
}

Folder.propTypes = {
    id: PropTypes.number.isRequired,
    folderName: PropTypes.string.isRequired
}