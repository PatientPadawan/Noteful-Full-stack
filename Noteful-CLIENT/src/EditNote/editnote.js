import React, { Component } from  'react';
import PropTypes from 'prop-types';
import NotefulContext from '../notefulcontext';
import config from '../config'
import './editnote.css';

const Required = () => (
  <span className='EditNote__required'>*</span>
)

class EditNote extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.object,
    }),
    history: PropTypes.shape({
      push: PropTypes.func,
    }).isRequired,
  };

  static contextType = NotefulContext;

  state = {
    error: null,
    id: '',
    note_name: '',
    content: '',
  };

  componentDidMount() {
    const { noteId } = this.props.match.params
    fetch(config.API_ENDPOINT + `/api/notes/${noteId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.API_KEY}`
      }
    })
      .then(res => {
        if (!res.ok)
        return res.json().then(error => Promise.reject(error))
        return res.json()
      })
      .then(responseData => {
        this.setState({
          id: responseData.id,
          note_name: responseData.note_name,
          content: responseData.content,
        })
      })
      .catch(error => {
        console.error(error)
        this.setState({ error })
      })
  }

  handleChangeNoteName = e => {
    this.setState({ note_name: e.target.value })
  };

  handleChangeContent = e => {
    this.setState({ content: e.target.value })
  };

  handleSubmit = e => {
    e.preventDefault()
    const { noteId } = this.props.match.params
    const { id, note_name, content } = this.state
    const newNote = { id, note_name, content }
    fetch(config.API_ENDPOINT + `/api/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(newNote),
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${config.API_KEY}`
      },
    })
      .then(res => {
        if (!res.ok)
          return res.json().then(error => Promise.reject(error))
      })
      .then(() => {
        this.resetFields(newNote)
        this.context.updateNote(newNote)
        this.props.history.goBack()
      })
      .catch(error => {
        console.error(error)
        this.setState({ error })
      })
  }

  resetFields = (newFields) => {
    this.setState({
      note_name: newFields.note_name || '',
      content: newFields.content || '',
    })
  }

  handleClickCancel = () => {
    this.props.history.push('/')
  };

  render() {
    const { error, note_name, content } = this.state
    return (
      <section className='EditNote'>
        <h2>Edit Note</h2>
        <form
          className='EditNote__form'
          onSubmit={this.handleSubmit}
        >
          <div className='EditNote__error' role='alert'>
            {error && <p>{error.message}</p>}
          </div>
          <input
            type='hidden'
            name='id'
          />
          <div>
            <label htmlFor='note_name'>
              note name
              {' '}
              <Required />
            </label>
            <input
              type='text'
              name='note_name'
              id='note_name'
              placeholder='The best note'
              required
              value={note_name}
              onChange={this.handleChangeNoteName}
            />
          </div>
          <div>
            <label htmlFor='content'>
              content
            </label>
            <textarea
              name='content'
              id='content'
              value={content}
              onChange={this.handleChangeContent}
            />
          </div>
          <div className='EditNote__buttons'>
            <button type='button' onClick={this.handleClickCancel}>
              Cancel
            </button>
            {' '}
            <button type='submit'>
              Save
            </button>
          </div>
        </form>
      </section>
    );
  }
}

export default EditNote;
