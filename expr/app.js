const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const adminRoutes = require('./routes/admin-routes')
const shopRoutes = require('./routes/shop-routes')

const errorController = require('./controllers/error-controller')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorController.error404)

app.listen(3000)