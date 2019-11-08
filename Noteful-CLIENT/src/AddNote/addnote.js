import React, { Component } from 'react';
import ValidationError from '../validationerror';
import NotefulContext from '../notefulcontext';
import { findFolderID } from '../notes-helpers';
import config from '../config';
import PropTypes from 'prop-types';
import './addnote.css';

export default class AddNote extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: {
                value: '',
                touched: false
            },
            content: {
                value: '',
                touched: false
            },
            folder: {
                value: '',
                touched: false
            },
        }
    }
    static defaultProps = {
        onAddNote: () => {},
        folders: [],
        history: {
            goBack: () => {}
        }
    }
    static contextType = NotefulContext;

    updateNoteName(noteName) {
        this.setState({ name: { value: noteName, touched: true }})
    }

    updateNoteContent(noteContent) {
        this.setState({ content: {value: noteContent, touched: true }})
    }

    updateNoteFolder(noteFolder) {
        this.setState({ folder: {value: noteFolder, touched: true }})
    }

    handleCancelClick = (e) => {
        e.preventDefault();
        this.props.history.goBack();
    }

    handleSubmitClick = (e) => {
        e.preventDefault();
        const modified = new Date();
        const { name, content, folder } = this.state;
        const matchingFolder = findFolderID(this.context.folders, folder.value)
        fetch(`${config.API_ENDPOINT}/notes`, {
            method: 'POST',
            body: JSON.stringify({
                "id": "",
                "name": `${name.value}`,
                "modified": `${modified.toISOString()}`,
                "folderId": `${matchingFolder.id}`,
                "content": `${content.value}`
            }),
            headers: {
                'content-type': 'application/json',
            },
        })
        .then(res => {
            if (!res.ok)
                return res.json().then(e => Promise.reject(e));
        })
        .then(() => {
            this.context.addNote()
            this.props.onAddNote()
            this.props.history.goBack()
        })
        .catch(error => {
            console.error({ error })
        })
    }

    createFolderList() {
        const folders = this.context.folders;
        let noteFolders = document.getElementById( "noteFolders" )
        folders.forEach((folder) => {
            let option = document.createElement( 'option' );
            option.value = folder.name;
            noteFolders.appendChild( option );
        })
    }

    validateNoteName() {
        const noteName = this.state.name.value.trim();
        if (noteName.length === 0) {
            return 'Note name is required to proceed';
        }
    }

    validateNoteContent() {
        const noteContent = this.state.content.value.trim();
        if (noteContent.length === 0) {
            return 'Note content is required to proceed';
        }
    }

    validateFolderName() {
        const folders = this.context.folders;
        const folderName = this.state.folder.value.trim();
        let match = null
        for (let i of folders) {
            if (folderName === i.name) {
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

    render() {
        const noteNameError = this.validateNoteName();
        const noteContentError = this.validateNoteContent();
        const noteFolderError = this.validateFolderName();
        return(
            <form className='addNoteForm'>
                <h2 className='addNoteHeader'>Create a new note</h2>
                <div className='addNoteInputContainer'>
                    <div className='addNoteInput'>
                        <label htmlFor='noteName'>Note name: </label>
                        <input
                            type='text'
                            name='noteName'
                            id='noteName'
                            onChange={e => this.updateNoteName(e.target.value)}
                        />
                        {this.state.name.touched && <ValidationError message={noteNameError}/>}
                    </div>
                    <div className='addNoteInput'>
                        <label htmlFor='noteContent'>Content: </label>
                        <input
                            type='text'
                            name='noteContent'
                            id='noteContent'
                        onChange={e => this.updateNoteContent(e.target.value)}
                        />
                        {this.state.content.touched && <ValidationError message={noteContentError}/>}       
                    </div>
                    <div className='addNoteInput'>           
                        <label htmlFor='noteFolderName'>Folder name: </label>
                        <input
                            list='noteFolders'
                            name='noteFolderName'
                            id='noteFolderName'
                            onChange={e => this.updateNoteFolder(e.target.value)}
                        />
                        <datalist id='noteFolders'>
                             {/* datalist is programmatically rendered by createFolderList function */}
                        </datalist>
                        {this.state.folder.touched && <ValidationError message={noteFolderError}/>}
                    </div>
                </div>
                <div className='addNoteButtonGroup'>
                    <button 
                        onClick={this.handleSubmitClick}
                        type='submit'
                        className='addNoteButton'
                        disabled={
                            this.validateNoteName() ||
                            this.validateNoteContent() ||
                            this.validateFolderName() 
                        }
                    >
                    Submit
                    </button>
                    <button
                        onClick={this.handleCancelClick}
                        className='addNoteButton'
                    >
                    Cancel
                    </button>
                </div>
            </form>
        )
    }

    componentDidMount() {
        this.createFolderList();
    }
}

AddNote.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    onAddNote: PropTypes.func.isRequired,
    folders: PropTypes.array.isRequired
}