import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import AddFolder from './addfolder';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <BrowserRouter>
        <AddFolder />
    </BrowserRouter>, 
    div);
  ReactDOM.unmountComponentAtNode(div);
});