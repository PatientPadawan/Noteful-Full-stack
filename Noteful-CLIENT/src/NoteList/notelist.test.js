import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import NoteList from './notelist';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <BrowserRouter>
        <NoteList />
    </BrowserRouter>, 
    div);
  ReactDOM.unmountComponentAtNode(div);
});