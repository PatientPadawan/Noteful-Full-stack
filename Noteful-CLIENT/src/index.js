import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AppError from './ErrorBoundaries/appError';
import './index.css';

ReactDOM.render(
    <BrowserRouter>
        <AppError>
            <App />
        </AppError>
    </BrowserRouter>, 
    document.getElementById('root') 
);