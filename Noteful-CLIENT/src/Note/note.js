import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NotefulContext from '../notefulcontext';
import config from '../config';
import PropTypes from 'prop-types';
import './note.css';

export default class Note extends Component {
    static defaultProps = {
        onDeleteNote: () => {},
    }
   
    static contextType = NotefulContext;

    handleClickDelete = e => {
        e.preventDefault()
        const noteId = this.props.id

        fetch(`${config.API_ENDPOINT}/api/notes/${noteId}`, {
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
            this.context.deleteNote(noteId)
            this.props.onDeleteNote(noteId)
        })
        .catch(error => {
            console.error({ error })
        })
    }
    
    render() {
        const { name, id, modified } = this.props
        const dateObject = new Date(modified)
        const options = { day: 'numeric', year: 'numeric', month: 'short'}
        const date = dateObject.toLocaleString(['en-GB'], options)
        return (
            <article className='noteContainer'>
                <h2 className='noteTitle'>
                    <Link to={`/note/${id}`} className='linkNote'>
                        {name}
                    </Link>
                </h2>
                <button 
                    className='button' 
                    id='note'
                    onClick={this.handleClickDelete}
                >
                    Delete
                </button>
                <div className='descriptionContainer'> 
                    Date modified on {date}
                </div>
            </article>
        )
    }
}

Note.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    modified: PropTypes.string,
    className: PropTypes.string,
    onDeleteNote: PropTypes.func.isRequired
}