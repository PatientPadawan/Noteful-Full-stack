import React from 'react'
import Note from '../Note/note'
import NotefulContext from '../notefulcontext';
import { findNote } from '../notes-helpers';
import PropTypes from 'prop-types';
import './notepage.css'

export default class NotePage extends React.Component {
  static defaultProps = {
    match: {
      params: {}
    }
  }

  static contextType = NotefulContext

  handleDeleteNote = noteId => {
    this.props.history.push('/')
  }

  render() {
    const { notes=[] } = this.context
    const { noteId } = this.props.match.params
    const note = findNote(notes, noteId) || {content: ''}

    return (
      <section className='notePage'>
        <div className='noteBox'>
          <Note
            id={note.id}
            name={note.note_name}
            modified={note.modified}
            onDeleteNote={this.handleDeleteNote}
            className='note'
          />
        </div>
        <div className='notePageContent'>
          {note.content.split(/\n \r|\n/).map((para, i) =>
            <p key={i}>{para}</p>
          )}
        </div>
      </section>
    )
  }
}

NotePage.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object
}