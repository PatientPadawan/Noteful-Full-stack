import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import NotefulContext from './notefulcontext';
import Header from './Header/header';
import SideBar from './Sidebar/sidebar';
import NotePageNav from './NotePageNav/NotePageNav';
import Main from './Main/main';
import AddNote from './AddNote/addnote';
import AddFolder from './AddFolder/addfolder';
import DeleteFolder from './DeleteFolder/DeleteFolder';
import NotePage from './NotePage/notepage';
import EditNote from './EditNote/editnote';
import config from './config';
import './App.css';

export default class App extends Component {
  state = {
    notes: [],
    folders: []
  };

  handleAddNote = () => {
    fetch(`${config.API_ENDPOINT}/api/notes`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${config.API_KEY}`
      }
    })
    .then(res => {
      if (!res.ok)
        return res.json().then(e => Promise.reject(e));
      
        return res.json()
    })
    .then(notes => {
      this.setState({notes});
    })
    .catch(error => {
      console.error({ error });
    })
  }

  handleAddFolder = () => {
    fetch(`${config.API_ENDPOINT}/api/folders`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${config.API_KEY}`
      }
    })
    .then(res => {
      if (!res.ok)
        return res.json().then(e => Promise.reject(e));
      
        return res.json()
    })
    .then(folders => {
      this.setState({folders});
    })
    .catch(error => {
      console.error({ error });
    })
  }

  handleDeleteNote = noteId => {
    this.setState({
      notes: this.state.notes.filter(note => note.id !== noteId)
    })
  }

  handleDeleteFolder = folderId => {
    this.setState({
      folders: this.state.folders.filter(folder => folder.id !== folderId),
      notes: this.state.notes.filter(note => note.folder_id !== folderId)
    })
  }

  handleUpdateNote = newNote => {
    this.setState({
      notes: this.state.notes.map(n =>
        (n.id !== newNote.id) ? n : newNote
      )
    })
  }

  componentDidMount() {
    Promise.all([
        fetch(`${config.API_ENDPOINT}/api/notes`, {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${config.API_KEY}`
          }
        }),
        fetch(`${config.API_ENDPOINT}/api/folders`, {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${config.API_KEY}`
          }
        })
    ])
        .then(([notesRes, foldersRes]) => {
            if (!notesRes.ok)
                return notesRes.json().then(e => Promise.reject(e));
            if (!foldersRes.ok)
                return foldersRes.json().then(e => Promise.reject(e));

            return Promise.all([notesRes.json(), foldersRes.json()]);
        })
        .then(([notes, folders]) => {
            this.setState({notes, folders});
        })
        .catch(error => {
            console.error({ error });
        });
  }
  
  renderNavRoutes() {
    return (
        <>
          {['/', '/folder/:folderId'].map(path => (
            <Route
              exact
              key={path}
              path={path}
              component={SideBar}
            />
          ))}
          <Route path="/note/:noteId" component={NotePageNav}/>
          <Route path="/add-folder" component={AddFolder} />
          <Route path="/add-note" component={AddNote} />
        </>
    );
  }

  renderMainRoutes() {
    return (
        <>
          {['/', '/folder/:folderId'].map(path => (
              <Route
                  exact
                  key={path}
                  path={path}
                  component={Main}
              />
          ))}
          <Route path="/note/:noteId" component={NotePage}/>
          <Route path="/edit/:noteId" component={EditNote}/>
          <Route path="/delete-folder" component={DeleteFolder}/>
        </>
    );
  }





  render() {
    const contextValue = {
      notes: this.state.notes,
      folders: this.state.folders,
      addNote: this.handleAddNote,
      addFolder: this.handleAddFolder,
      deleteNote: this.handleDeleteNote,
      deleteFolder: this.handleDeleteFolder,
      updateNote: this.handleUpdateNote,
    }

    return (
      <NotefulContext.Provider value={contextValue}>
        <>
          <header>
            <Header />
          </header>
          <main>       
            {this.renderNavRoutes()}
            {this.renderMainRoutes()}
          </main>
        </>
      </NotefulContext.Provider>
    );
  }
}

