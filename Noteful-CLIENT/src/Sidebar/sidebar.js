import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FolderList from '../FolderList/folderlist';
import PropTypes from 'prop-types';
import './sidebar.css';

export default class SideBar extends Component {
    render() {
        return (
            <nav className='sideBar'>
                <FolderList />
                <Link
                    to={'/add-folder'} 
                    className="button" 
                    id='addFolder'
                >
                    Add folder
                </Link>
            </nav>
        )
    }
}

SideBar.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
}