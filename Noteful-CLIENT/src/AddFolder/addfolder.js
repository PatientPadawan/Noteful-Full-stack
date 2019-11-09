import React, { Component } from 'react';
import ValidationError from '../validationerror';
import NotefulContext from '../notefulcontext';
import config from '../config';
import PropTypes from 'prop-types';
import './addfolder.css';

export default class AddFolder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            folderName: {
                value: '',
                touched: false
            }
        }
    }
    static defaultProps = {
        onAddFolder: () => {},
        goBack: () => {}
    }
    static contextType = NotefulContext;

    updateFolderName(name) {
        this.setState({ folderName: { value: name, touched: true }})
    }

    handleCancelClick = (e) => {
        e.preventDefault();
        this.props.history.goBack()
    }

    handleSubmitClick = (e) => {
        e.preventDefault();
        const folder = this.state.folderName.value
        fetch(`${config.API_ENDPOINT}/api/folders`, {
            method: 'POST',
            body: JSON.stringify({
                "folder_name": `${folder}`
            }),
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${config.API_KEY}`
            },
        })
        .then(res => {
            if (!res.ok)
            return res.json()
        })
        .then(() => {
            this.context.addFolder()
            this.props.onAddFolder()
            this.props.history.goBack()
        })
        .catch(error => {
            console.error({ error })
        })
    }

    validateFolderName() {
        const folderName = this.state.folderName.value.trim();
        if (folderName.length === 0) {
            return 'Folder name is required to proceed';
        }
    }
    

    render() {
        const folderNameError = this.validateFolderName();
        return (
            <form className="addFolderForm">
                <h2 className="addFolderHeader">Create a new folder</h2>
                <div className='addFolderInputContainer'>
                    <label htmlFor='folderName'>Folder name: </label>
                    <input
                        type='text'
                        className='addFolderInput'
                        name='folderName'
                        id='folderName'
                        onChange={e => this.updateFolderName(e.target.value)}
                    />
                    {this.state.folderName.touched && <ValidationError message={folderNameError}/>}
                </div>
                <div className='addFolderButtonGroup'>
                    <button 
                        onClick={this.handleSubmitClick}
                        type='submit'
                        className='addFolderButton'
                        disabled={this.validateFolderName()}
                    >
                    Submit
                    </button>
                    <button
                        onClick={this.handleCancelClick}
                        className='addFolderButton'
                    >
                    Cancel
                    </button>
                </div>
            </form>
        )
    }
}

AddFolder.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    goBack: PropTypes.func.isRequired, 
    onAddFolder: PropTypes.func.isRequired   
}