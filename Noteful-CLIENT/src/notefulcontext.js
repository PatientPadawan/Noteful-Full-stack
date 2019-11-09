import React from 'react'

const NotefulContext = React.createContext({
    notes: [],
    folders: [],
    addFolder: () => {},
    addNote: () => {},
    deleteNote: () => {},
    updateNote: () => {},
})

export default NotefulContext