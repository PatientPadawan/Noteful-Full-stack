import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import DeleteFolder from './DeleteFolder';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <BrowserRouter>
        <DeleteFolder />
    </BrowserRouter>, 
    div);
  ReactDOM.unmountComponentAtNode(div);
});