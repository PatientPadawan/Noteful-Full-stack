import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import Note from './note';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <BrowserRouter>
        <Note />
    </BrowserRouter>, 
    div);
  ReactDOM.unmountComponentAtNode(div);
});