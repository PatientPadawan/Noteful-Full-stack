import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import NotePageNav from './NotePageNav';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <BrowserRouter>
        <NotePageNav />
    </BrowserRouter>, 
    div);
  ReactDOM.unmountComponentAtNode(div);
});