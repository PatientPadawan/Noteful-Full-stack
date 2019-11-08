import React, { Component } from 'react';

export default class AppError extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <h2>Could not display the App.</h2>
            );
        }
        return this.props.children;
    }
}