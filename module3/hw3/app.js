const path = require('path')

const express = require('express')
const app = express()

const adminRoutes = require('./routes/admin')
const userRoutes = require('./routes/users')

app.use(express.static(path.join(__dirname, 'public')))

app.use(userRoutes)
app.use(adminRoutes)

app.listen(3000)