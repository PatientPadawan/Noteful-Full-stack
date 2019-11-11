const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray } = require('./folders-fixtures')
const { makeNotesArray, makeBadNote } = require('./notes-fixtures')

describe('Notes Endpoints', function() {
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
        const testFolders = makeFoldersArray();
        const testNotes = makeNotesArray()

        beforeEach('insert folders and then notes', () => {
            return db
            .into('folders')
            .insert(testFolders)
            .then(() => {
                return db
                .into('notes')
                .insert(testNotes)
            })
        })

        it(`responds with 401 Unauthorized for GET /api/notes`, () => {
            return supertest(app)
            .get('/api/notes')
            .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for POST /api/notes`, () => {
            return supertest(app)
            .post('/api/notes')
            .send({ note_name: 'test-name' })
            .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for GET /api/notes/:id`, () => {
            const secondNote = testNotes[1]
            return supertest(app)
            .get(`/api/notes/${secondNote.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for DELETE /api/notes/:id`, () => {
            const secondNote = testNotes[1]
            return supertest(app)
            .delete(`/api/notes/${secondNote.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for PATCH /api/notes/:id`, () => {
            const secondNote = testNotes[1]
            return supertest(app)
            .patch(`/api/notes/${secondNote.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
    })

    describe(`GET /api/notes`, () => {
        context(`Given no notes`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, [])
            })
        })

        context(`Given there are notes in the database`, () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray()

            beforeEach('insert folders and then notes', () => {
                return db
                .into('folders')
                .insert(testFolders)
                .then(() => {
                    return db
                    .into('notes')
                    .insert(testNotes)
                })
            })

            it(`responds with 200 and all the notes`, () => {
                return supertest(app)
                .get(`/api/notes`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, testNotes)
            })
        })

        context(`Given an XSS attack`, () => {
            const testFolders = makeFoldersArray();
            const { maliciousNote, expectedNote } = makeBadNote();

            beforeEach('insert folders and then a malicious note', () => {
                return db
                .into('folders')
                .insert(testFolders)
                .then(() => {
                    return db
                    .into('notes')
                    .insert([maliciousNote])
                })
            })
    
            it(`removes XSS attack content`, () => {
                return supertest(app)
                .get(`/api/notes`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res => {
                    expect(res.body[0].id).to.eql(expectedNote.id)
                    expect(res.body[0].note_name).to.eql(expectedNote.note_name)
                })
            })
        })
    })

    describe(`GET /api/notes/:note_id`, () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123
                return supertest(app)
                .get(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, { error: { message: `Note not found` } })
            })
        })
    
        context('Given there are notes in the database', () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray()
    
            beforeEach('insert folders and then notes', () => {
                return db
                .into('folders')
                .insert(testFolders)
                .then(() => {
                    return db
                    .into('notes')
                    .insert(testNotes)
                })
            })

            it('responds with 200 and the specified note', () => {
                const noteId = 2
                const expectedNote = testNotes[noteId - 1]
                return supertest(app)
                .get(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, expectedNote)
            })
        })

        context(`Given an XSS attack note`, () => {
            const testFolders = makeFoldersArray();
            const { maliciousNote, expectedNote } = makeBadNote()
        
            beforeEach('insert folders and then a malicious note', () => {
                return db
                .into('folders')
                .insert(testFolders)
                .then(() => {
                    return db
                    .into('notes')
                    .insert([maliciousNote])
                })
            })
        
            it('removes XSS attack content', () => {
                return supertest(app)
                .get(`/api/notes/${maliciousNote.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.id).to.eql(expectedNote.id)
                    expect(res.body.note_name).to.eql(expectedNote.note_name)
                })
            })
        })
    })

    describe('DELETE /api/notes/:id', () => {
        context(`Given no notes`, () => {
            it(`responds 404 when note doesn't exist`, () => {
                return supertest(app)
                .delete(`/api/notes/123`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, {
                    error: { message: `Note not found` }
                })
            })
        })
    
        context('Given there are notes in the database', () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray()

            beforeEach('insert folders and then notes', () => {
                return db
                .into('folders')
                .insert(testFolders)
                .then(() => {
                    return db
                    .into('notes')
                    .insert(testNotes)
                })
            })

            it('removes the note by ID from the store', () => {
                const idToRemove = 2
                const expectedNotes = testNotes.filter(bm => bm.id !== idToRemove)
                return supertest(app)
                .delete(`/api/notes/${idToRemove}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(() =>
                supertest(app)
                    .get(`/api/notes`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(expectedNotes)
                )
            })
        })
    })
    
    describe('POST /api/notes', () => {
        const testFolders = makeFoldersArray()
        beforeEach('insert folders', () => {
            return db
            .into('folders')
            .insert(testFolders)
        })

        it(`responds with 400 missing 'note_name' if not supplied`, () => {
            const newNoteMissingName = {
                id: '3',
                // note_name: 'Awesome',
            }

            return supertest(app)
            .post(`/api/notes`)
            .send(newNoteMissingName)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(400, {
                error: { message: `note_name is required` }
            })
        })
    
        it('adds a new note to the store', () => {
            const newNote = {
                note_name: 'the best note',
                content: 'the best note content',
                folder_id: 1,
            }

            return supertest(app)
            .post(`/api/notes`)
            .send(newNote)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(201)
            .expect(res => {
                expect(res.body.note_name).to.eql(newNote.note_name)
                expect(res.body.content).to.eql(newNote.content)
                expect(res.body.folder_id).to.eql(newNote.folder_id)
                expect(res.body).to.have.property('id')
                expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
                const expected = new Date().toLocaleString('en', { timeZone: 'UTC' })
                const actual = new Date(res.body.modified).toLocaleString()
                expect(actual).to.eql(expected)
            })
            .then(res =>
              supertest(app)
                .get(`/api/notes/${res.body.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(res.body)
            )
        })
    
        it('removes XSS attack content from response', () => {
            const { maliciousNote, expectedNote } = makeBadNote()
            return supertest(app)
            .post(`/api/notes`)
            .send(maliciousNote)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(201)
            .expect(res => {
                expect(res.body.id).to.eql(expectedNote.id)
                expect(res.body.note_name).to.eql(expectedNote.note_name)
            })
        })
    })

    describe('PATCH /api/notes', () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                .patch(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, {
                    error: { message: `Note not found` }
                })
            })
        })
    
        context(`Given there are notes in the database`, () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray()

            beforeEach('insert folders and then notes', () => {
                return db
                .into('folders')
                .insert(testFolders)
                .then(() => {
                    return db
                    .into('notes')
                    .insert(testNotes)
                })
            })

            it('responds with 204 and updates the note', () => {
                const idToUpdate = 2
                const updatedNote = {
                    note_name: 'updated to the best name'
                }

                const expectedNote = {
                    ...testNotes[idToUpdate - 1],
                    ...updatedNote
                }

                return supertest(app)
                .patch(`/api/notes/${idToUpdate}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(updatedNote)
                .expect(204)
                .then(res =>
                    supertest(app)
                    .get(`/api/notes/${idToUpdate}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(expectedNote)
                )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2

                return supertest(app)
                .patch(`/api/notes/${idToUpdate}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'note_name' or 'content'`
                    }
                })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2
                const updatedNote = {
                    note_name: 'updated note title',
                }

                const expectedNote = {
                    ...testNotes[idToUpdate - 1],
                    ...updatedNote
                }

                return supertest(app)
                .patch(`/api/notes/${idToUpdate}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send({
                    ...updatedNote,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res =>
                    supertest(app)
                    .get(`/api/notes/${idToUpdate}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(expectedNote)
                )
            })
        })
    })
})