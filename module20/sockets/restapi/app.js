const path = require('path')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')
const mongoose = require('mongoose')

const feedRoutes = require('./routes/newfeed')
const authRoutes = require('./routes/auth')

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
    next()
})
app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

app.use((error, req, res, next) => {
    const { statusCode = 500, message, data = [] } = error
    console.log('this was the error and yes we got it, ', error)
    res.status(statusCode).json({ message, data })
})


mongoose.connect('mongodb+srv://giovani:rootadmin1234@universalstudios-ifi16.mongodb.net/messages?retryWrites=true&w=majority')
    .then(result => {
        console.log('connected')
        const server = app.listen(8080)
        const io = require('./socket').init(server)
        io.on('connection', socket => {
            console.log('client connected!')
        })
    })
    .catch(err => console.log('error connecting, ', err))