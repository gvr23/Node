const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error-controller');
const app = express();
const adminRoutes = require('./routes/admin-routes');
const shopRoutes = require('./routes/shop-routes');
const mongoConnect = require('./util/database').mongoConnect
const User = require('./models/user-model')

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    User.findById('5df823d17044f2a1eb5c81f1')
        .then(user => {
            const { name, email, cart, _id } = user
            req.user = new User(name, email, cart, _id)
            next()
        })
        .catch(error => {
            console.log('error retrieving the user, ', error)
            next()
        })
})
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);


mongoConnect((client) => {
    app.listen(3000)
})

