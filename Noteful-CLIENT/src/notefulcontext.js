import React from 'react'

const NotefulContext = React.createContext({
    notes: [],
    folders: [],
    addFolder: () => {},
    addNote: () => {},
    deleteNote: () => {},
    deleteFolder: () => {},
    updateNote: () => {},
})

export default NotefulContext