import React, { Component } from 'react';
import Folder from '../Folder/folder';
import FolderError from '../ErrorBoundaries/folderError';
import NotefulContext from '../notefulcontext';
import PropTypes from 'prop-types';
import './folderlist.css'

export default class FolderList extends Component {
    static contextType = NotefulContext;
    
    render() {
        const { folders=[] } = this.context
        return (
            <ul className='folderList'>
                {folders.map(function (x, i) {
                    return (
                        <FolderError key={i}>
                            <Folder 
                                key={i} 
                                id={folders[i].id} 
                                folderName={folders[i].name}
                            />
                        </FolderError>
                    )
                })}
            </ul>
        )
    }
}

FolderList.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object
}