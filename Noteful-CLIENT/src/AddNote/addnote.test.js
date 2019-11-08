import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import AddNote from './addnote';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <BrowserRouter>
        <AddNote />
    </BrowserRouter>, 
    div);
  ReactDOM.unmountComponentAtNode(div);
});