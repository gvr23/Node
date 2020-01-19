const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')
const mongoose = require('mongoose')
const graphQLExpress = require('express-graphql')

const graphQLSchema = require('./graphql/schema')
const graphQLResolver = require('./graphql/resolvers')
const auth = require('./middleware/auth')

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, `${new Date().toISOString()}-${file.originalname}`)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}


app.use(bodyParser.json())
app.use(multer({ storage: fileStorage, fileFilter }).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})
app.use(auth)

app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Not authenticated')
    }
    if (!req.file) {
        return res.status(200).json({ message: 'No file provided!' })
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath)
    }
    return res.status(201).json({ message: 'File stored', filePath: req.file.path })
})

app.use('/graphql', graphQLExpress({
    schema: graphQLSchema,
    rootValue: graphQLResolver,
    graphiql: true,
    customFormatErrorFn(error) {
        if (!error.originalError) {
            return error
        }
        const data = error.originalError.data
        const message = error.message || 'An error occurred'
        const code = error.originalError.code || 500
        return { message, status: code, data }
    }
}))

app.use((error, req, res, next) => {
    const { statusCode = 500, message, data = [] } = error
    console.log('this was the error and yes we got it, ', error)
    res.status(statusCode).json({ message, data })
})


mongoose.connect('mongodb+srv://giovani:rootadmin1234@universalstudios-ifi16.mongodb.net/messages?retryWrites=true&w=majority')
    .then(result => {
        console.log('connected')
        app.listen(8080)
    })
    .catch(err => console.log('error connecting, ', err))

    const clearImage = filePath => {
        filePath = path.join(__dirname, '..', filePath)
        fs.unlink(filePath, err => console.log(err))
    }