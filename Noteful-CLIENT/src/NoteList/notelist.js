import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Note from '../Note/note';
import NoteError from '../ErrorBoundaries/noteError';
import NotefulContext from '../notefulcontext';
import { getNotesForFolder } from '../notes-helpers';
import PropTypes from 'prop-types';
import './notelist.css';

export default class NoteList extends Component {
    static defaultProps = {
        match: {
            params: {}
        }
    }
    static contextType = NotefulContext

    render() {
        const { folderId } = this.props.match.params
        const { notes=[] } = this.context
        const notesForFolder = getNotesForFolder(notes, folderId)
        return (
            <div id='noteSection'>
                <ul className='noteList'>
                {notesForFolder.map(note =>
                    <li key={note.id} className='note'>
                        <NoteError>
                            <Note
                                id={note.id}
                                name={note.note_name}
                                modified={note.modified}
                            />
                        </NoteError>
                    </li>
                )}
                </ul>
                <Link 
                    to={'/add-note'}
                    className="button" 
                    id='addNote'
                >
                    Add note
                </Link>
            </div>
        )
    }
}

NoteList.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object
}