function makeFoldersArray() {
    return [
        {
            id: 1,
            folder_name: 'Roses',
        },
        {
            id: 2,
            folder_name: 'Violets',
        },
        {
            id: 3,
            folder_name: 'Tulips'
        }
    ]
}

function makeBadFolder() {
   const maliciousFolder = {
       id: 1,
       folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
   }
   const expectedFolder = {
       id: 1,
       folder_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
   }
   return {
       maliciousFolder,
       expectedFolder,
   }
}

module.exports = {
    makeFoldersArray,
    makeBadFolder
}