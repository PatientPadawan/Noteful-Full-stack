const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeBadFolder } = require('./folders-fixtures')

describe('Folders Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })

        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))

    describe(`Unauthorized requests`, () => {
        const testFolders = makeFoldersArray()

        beforeEach('insert folders', () => {
            return db
            .into('folders')
            .insert(testFolders)
        })

        it(`responds with 401 Unauthorized for GET /api/folders`, () => {
            return supertest(app)
            .get('/api/folders')
            .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for POST /api/folders`, () => {
            return supertest(app)
            .post('/api/folders')
            .send({ folder_name: 'test-name' })
            .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for GET /api/folders/:id`, () => {
            const secondFolder = testFolders[1]
            return supertest(app)
            .get(`/api/folders/${secondFolder.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for DELETE /api/folders/:id`, () => {
            const secondFolder = testFolders[1]
            return supertest(app)
            .delete(`/api/folders/${secondFolder.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for PATCH /api/folders/:id`, () => {
            const secondFolder = testFolders[1]
            return supertest(app)
            .patch(`/api/folders/${secondFolder.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
    })

    describe(`GET /api/folders`, () => {
        context(`Given no folders`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                .get('/api/folders')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, [])
            })
        })

        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray();

            beforeEach(`insert folders`, () => {
                return db
                .into('folders')
                .insert(testFolders)
            })

            it(`responds with 200 and all the folders`, () => {
                return supertest(app)
                .get(`/api/folders`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, testFolders)
            })
        })

        context(`Given an XSS attack`, () => {
            const { maliciousFolder, expectedFolder } = makeBadFolder();

            beforeEach(`insert malicious folder`, () => {
                return db
                .into('folders')
                .insert([maliciousFolder])
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                .get(`/api/folders`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res => {
                    expect(res.body[0].id).to.eql(expectedFolder.id)
                    expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name)
                })
            })
        })
    })

    describe(`GET /api/folders/:folder_id`, () => {
        context(`Given no folders`, () => {
            it(`responds with 404`, () => {
                const folderId = 123
                return supertest(app)
                .get(`/api/folders/${folderId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, { error: { message: `Folder not found` } })
            })
        })
    
        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray()
    
            beforeEach('insert folders', () => {
            return db
            .into('folders')
            .insert(testFolders)
            })

            it('responds with 200 and the specified folder', () => {
                const folderId = 2
                const expectedFolder = testFolders[folderId - 1]
                return supertest(app)
                .get(`/api/folders/${folderId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, expectedFolder)
            })
        })

        context(`Given an XSS attack folder`, () => {
            const { maliciousFolder, expectedFolder } = makeBadFolder()
        
            beforeEach('insert malicious folder', () => {
                return db
                .into('folders')
                .insert([maliciousFolder])
            })
        
            it('removes XSS attack content', () => {
                return supertest(app)
                .get(`/api/folders/${maliciousFolder.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.id).to.eql(expectedFolder.id)
                    expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
                })
            })
        })
    })

    describe('DELETE /api/folders/:id', () => {
        context(`Given no folders`, () => {
            it(`responds 404 when folder doesn't exist`, () => {
                return supertest(app)
                .delete(`/api/folders/123`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, {
                    error: { message: `Folder not found` }
                })
            })
        })
    
        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
            return db
                .into('folders')
                .insert(testFolders)
            })

            it('removes the folder by ID from the store', () => {
                const idToRemove = 2
                const expectedFolders = testFolders.filter(bm => bm.id !== idToRemove)
                return supertest(app)
                .delete(`/api/folders/${idToRemove}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(() =>
                supertest(app)
                    .get(`/api/folders`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(expectedFolders)
                )
            })
        })
    })
    
    describe('POST /api/folders', () => {
        it(`responds with 400 missing 'folder_name' if not supplied`, () => {
            const newFolderMissingName = {
                id: '3',
                // folder_name: 'Awesome',
            }

            return supertest(app)
            .post(`/api/folders`)
            .send(newFolderMissingName)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(400, {
                error: { message: `Folder name is required` }
            })
        })
    
        it('adds a new Folder to the store', () => {
            const newFolder = {
                folder_name: 'the best folder'
            }

            return supertest(app)
            .post(`/api/folders`)
            .send(newFolder)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(201)
            .expect(res => {
                expect(res.body.folder_name).to.eql(newFolder.folder_name)
                expect(res.body).to.have.property('id')
                expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
            })
            .then(res =>
              supertest(app)
                .get(`/api/folders/${res.body.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(res.body)
            )
        })
    
        it('removes XSS attack content from response', () => {
            const { maliciousFolder, expectedFolder } = makeBadFolder()
            return supertest(app)
            .post(`/api/folders`)
            .send(maliciousFolder)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(201)
            .expect(res => {
                expect(res.body.id).to.eql(expectedFolder.id)
                expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
            })
        })
    })

    describe('PATCH /api/folders', () => {
        context(`Given no folders`, () => {
            it(`responds with 404`, () => {
                const folderId = 123456
                return supertest(app)
                .patch(`/api/folders/${folderId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, {
                    error: { message: `Folder not found` }
                })
            })
        })
    
        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                .into('folders')
                .insert(testFolders)
            })

            it('responds with 204 and updates the Folder', () => {
                const idToUpdate = 2
                const updatedFolder = {
                    folder_name: 'updated to the best name'
                }

                const expectedFolder = {
                    ...testFolders[idToUpdate - 1],
                    ...updatedFolder
                }

                return supertest(app)
                .patch(`/api/folders/${idToUpdate}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(updatedFolder)
                .expect(204)
                .then(res =>
                    supertest(app)
                    .get(`/api/folders/${idToUpdate}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(expectedFolder)
                )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2

                return supertest(app)
                .patch(`/api/folders/${idToUpdate}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain folder name`
                    }
                })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2
                const updatedFolder = {
                    folder_name: 'updated folder title',
                }

                const expectedFolder = {
                    ...testFolders[idToUpdate - 1],
                    ...updatedFolder
                }

                return supertest(app)
                .patch(`/api/folders/${idToUpdate}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send({
                    ...updatedFolder,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res =>
                    supertest(app)
                    .get(`/api/folders/${idToUpdate}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(expectedFolder)
                )
            })
        })
    })
})

