import React, { Component } from 'react';
import ValidationError from '../validationerror';
import NotefulContext from '../notefulcontext';
import { findFolderID } from '../notes-helpers';
import config from '../config';
import PropTypes from 'prop-types';
import './DeleteFolder.css';


export default class DeleteFolder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            folder: {
                value: '',
                touched: false
            }, 
        }
    }

    static defaultProps = {
        onDeleteFolder: () => {},
        folders: [],
    }
    static contextType = NotefulContext;
    
    updateFolderName(folderName) {
        this.setState({ folder: { value: folderName, touched: true }})
    }

    handleCancelClick = (e) => {
        e.preventDefault();
        this.props.history.goBack()
    }

    handleSubmitClick = (e) => {
        e.preventDefault();
        const { folder } = this.state;
        const matchingFolder = findFolderID(this.context.folders, folder.value.trim())
        fetch(`${config.API_ENDPOINT}/api/folders/${matchingFolder.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${config.API_KEY}`
            },
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(e => Promise.reject(e))
            }
            // no content on success
        })
        .then(() => {
            this.context.deleteFolder(matchingFolder.id)
            this.props.onDeleteFolder(matchingFolder.id)
            this.props.history.push('/')
        })
        .catch(error => {
            console.error({ error })
        })
    }

    createFolderList() {
        const folders = this.context.folders;
        let foldersList = document.getElementById( "foldersList" )
        folders.forEach((folders) => {
            let option = document.createElement( 'option' );
            option.value = folders.folder_name;
            foldersList.appendChild( option );
        })
    }

    validateFolderName() {
        const folders = this.context.folders;
        const folderName = this.state.folder.value.trim();
        let match = null
        for (let i of folders) {
            if (folderName === i.folder_name) {
                match = true;
                break;
            } else {
                match = false;
            }
        }
        if (match !== true) {
            return 'Folder name must match exactly'
        }
    }

    componentDidMount() {
        this.createFolderList();
    }

    render() {
        const folderNameError = this.validateFolderName();
        return (
            <form className="delFolderForm">
                <h2 className="delFolderHeader">Delete a folder</h2>
                <div className='delNoteInput'>           
                    <label htmlFor='delFolderName'>Folder name: </label>
                    <input
                        list='foldersList'
                        name='delFolderName'
                        id='delFolderName'
                        onChange={e => this.updateFolderName(e.target.value)}
                    />
                    <datalist id='foldersList'>
                        {/* datalist is programmatically rendered by createFolderList function */}
                    </datalist>
                    {this.state.folder.touched && <ValidationError message={folderNameError}/>}
                </div>
                <div className='delFolderButtonGroup'>
                    <button 
                        onClick={this.handleSubmitClick}
                        type='submit'
                        className='delFolderButton'
                        disabled={this.validateFolderName()}
                    >
                    Submit
                    </button>
                    <button
                        onClick={this.handleCancelClick}
                        className='delFolderButton'
                    >
                    Cancel
                    </button>
                </div>
            </form>
        )
    }
}
