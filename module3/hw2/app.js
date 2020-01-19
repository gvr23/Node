const express = require('express')
const app = express()

app.use('/users', (req, res, next) => {
    res.send('<h1>Hey I\'m awesome</h1>')
})

app.use('/', (req, res, next) => {
    res.send('<h2>This is what I can see by default</h2>')
})


app.listen(3000)
