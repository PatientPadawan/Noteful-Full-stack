const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const bodyParser = express.json()

const xssFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name),
})

foldersRouter
    .route('/')

    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(xssFolder))
            })
            .catch(next)
    })

    .post(bodyParser, (req, res, next) => {
        const { folder_name } = req.body;
        const newFolder = { folder_name }

        if (!req.body.folder_name) {
            logger.error(`folder_name is required`)
            return res
                .status(400)
                .send({error: {message: `Folder name is required`}
            })
        }
    
        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
        .then(folder => {
            logger.info(`folder with id ${folder.id} created.`)
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                .json(xssFolder(folder))
        })
    .catch(next)
})

foldersRouter
    .route('/:folder_id')

    .all((req, res, next) => {
        const { folder_id } = req.params
        FoldersService.getById(req.app.get('db'), folder_id)
        .then(folder => {
            if (!folder) {
                logger.error(`Folder with id ${folder_id} not found.`)
                return res.status(404).json({
                    error: { message: `Folder not found` }
                })
            }
            res.folder = folder
            next()
        })
        .catch(next)
    })

    .get((req, res) => {
       res.json(xssFolder(res.folder))
    })

    .delete((req, res, next) => {
        const { folder_id } = req.params
        FoldersService.deleteFolder(
            req.app.get('db'),
            folder_id
        )
        .then(rowsDeleted => {
            logger.info(`Folder with id ${folder_id} deleted.`)
            res.status(204).end()
        })
        .catch(next)
    })

    .patch(bodyParser, (req, res, next) => {
        const { folder_name } = req.body
        const folderToUpdate = { folder_name } 

        if (!folder_name) {
            logger.error('Invalid update without required folder_name')
            return res
                .status(400)
                .json({
                    error: {
                        message: `Request body must contain folder name`
                    }
                })
        }

        FoldersService.updateFolder(
            req.app.get('db'),
            req.params.folder_id,
            folderToUpdate
        )
        .then(numRowsAffected => {res.status(204).end()})
        .catch(next)
    })

module.exports = foldersRouter

