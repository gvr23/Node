const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const userRoutes = require('./routes/users')
const generalData = require('./routes/general')

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(userRoutes)
app.use(generalData.router)


app.listen(3000)