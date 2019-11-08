import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import FolderList from './folderlist';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <BrowserRouter>
        <FolderList />
    </BrowserRouter>, 
    div);
  ReactDOM.unmountComponentAtNode(div);
});