function makeNotesArray() {
    return [
        {
            id: 1,
            note_name: 'Roses',
            modified: '2029-01-22T23:28:32.615Z',
            content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
            folder_id: 2,
        },
        {
            id: 2,
            note_name: 'Violets',
            modified: '2100-05-22T23:28:32.615Z',
            content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
            folder_id: 1,
        },
        {
            id: 3,
            note_name: 'Tulips',
            modified: '1919-12-22T23:28:32.615Z',
            content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
            folder_id: 2,
        },
        {
            id: 4,
            note_name: 'Monsters',
            modified: '1999-12-22T23:28:32.615Z',
            content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
            folder_id: 3,
        },
    ]
}

function makeBadNote() {
   const maliciousNote = {
       id: 1,
       note_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
       modified: '1999-12-22T23:28:32.615Z',
       content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
       folder_id: '3',
   }
   const expectedNote = {
        id: 1,
        note_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        modified: '1999-12-22T23:28:32.615Z',
        content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        folder_id: '3',
   }
   return {
        maliciousNote,
        expectedNote,
   }
}

module.exports = {
    makeNotesArray,
    makeBadNote
}