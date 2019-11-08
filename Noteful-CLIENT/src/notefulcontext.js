import React from 'react'

const NotefulContext = React.createContext({
    notes: [],
    folders: [],
    addFolder: () => {},
    addNote: () => {},
    deleteNote: () => {},
})

export default NotefulContext