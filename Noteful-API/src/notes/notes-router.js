const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const bodyParser = express.json()

const xssNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    modified: note.modified,
    content: xss(note.content),
    folder_id: note.folder_id,
})

notesRouter
    .route('/')

    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(xssNote))
            })
            .catch(next)
    })

    .post(bodyParser, (req, res, next) => {
        const { note_name, modified, content, folder_id } = req.body;
        const newNote = { note_name, modified, content, folder_id }

        for (const field of ['note_name', 'content', 'folder_id']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res
                    .status(400)
                    .send({error: {message: `${field} is required`}
                })
            }
        }
    
        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
        .then(Note => {
            logger.info(`Note with id ${Note.id} created.`)
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${Note.id}`))
                .json(xssNote(Note))
        })
    .catch(next)
})

notesRouter
    .route('/:note_id')

    .all((req, res, next) => {
        const { note_id } = req.params
        NotesService.getById(req.app.get('db'), note_id)
        .then(note => {
            if (!note) {
                logger.error(`Note with id ${note_id} not found.`)
                return res.status(404).json({
                    error: { message: `Note not found` }
                })
            }
            res.note = note
            next()
        })
        .catch(next)
    })

    .get((req, res) => {
       res.json(xssNote(res.note))
    })

    .delete((req, res, next) => {
        const { note_id } = req.params
        NotesService.deleteNote(
            req.app.get('db'),
            note_id
        )
        .then(rowsDeleted => {
            logger.info(`Note with id ${note_id} deleted.`)
            res.status(204).end()
        })
        .catch(next)
    })

    .patch(bodyParser, (req, res, next) => {
        const { note_name, content } = req.body
        const noteToUpdate = { note_name, content } 

        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            logger.error('Invalid update without required fields')
            return res
                .status(400)
                .json({
                    error: {
                        message: `Request body must contain either 'note_name' or 'content'`
                    }
                })
        }

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
        )
        .then(numRowsAffected => {res.status(204).end()})
        .catch(next)
    })

module.exports = notesRouter

