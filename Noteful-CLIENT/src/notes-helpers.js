
export const findFolder = (folders=[], folderId) =>
folders.find(folder => folder.id === folderId)

export const findNote = (notes=[], noteId) =>
notes.find(note => note.id === parseFloat(noteId))

export const getNotesForFolder = (notes=[], folderId) => (
(!folderId)
  ? notes
  : notes.filter(note => note.folder_id === parseFloat(folderId))
)

export const countNotesForFolder = (notes=[], folderId) =>
notes.filter(note => note.folderId === folderId).length

export const findFolderID = (folders=[], folderName) =>
folders.find(folder => folder.folder_name === folderName)  
