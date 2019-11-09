import React from 'react'
import { Link } from 'react-router-dom';
import NotefulContext from '../notefulcontext';
import { findFolder, findNote } from '../notes-helpers';
import PropTypes from 'prop-types';
import './NotePageNav.css'



export default class NotePageNav extends React.Component {
  static defaultProps = {
    history: {
      goBack: () => {}
    },
    match: {
      params: {}
    }
  }
  static contextType = NotefulContext;

  render() {
    const { notes, folders } = this.context
    const { noteId } = this.props.match.params
    const note = findNote(notes, noteId) || {}
    const folder = findFolder(folders, note.folder_id)

    return (
      <div className='notePageNav'>
        <button
          tag='button'
          role='link'
          onClick={() => this.props.history.goBack()}
          id='backButton'
          className='button'
        >
        Back
        </button>
        <Link
          to={`/edit/${noteId}`}
          id='editButton'
          className='button'
        >
        Edit
        </Link>
        {folder && (
          <h2 className='folderName'>
            {folder.folder_name}
          </h2>
        )}
      </div>
    )
  }
}

NotePageNav.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object
}