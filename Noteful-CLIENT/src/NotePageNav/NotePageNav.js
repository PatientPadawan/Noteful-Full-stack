import React from 'react'
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
    console.log(this.props)
    const { notes, folders } = this.context
    const { noteId } = this.props.match.params
    const note = findNote(notes, noteId) || {}
    const folder = findFolder(folders, note.folderId)

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
        {folder && (
          <h2 className='folderName'>
            {folder.name}
          </h2>
        )}
      </div>
    )
  }
}

NotePageNav.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
}