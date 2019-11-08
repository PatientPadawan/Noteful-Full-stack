import React, { Component } from 'react';
import NoteList from '../NoteList/notelist';
import PropTypes from 'prop-types';
import './main.css';

class Main extends Component {
    render() {
        return (
            <section className="mainContainer">
                <NoteList {...this.props}/>
            </section>
        )
    }
}

export default Main;

Main.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
}