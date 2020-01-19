const path = require('path');

const express = require('express');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');
const MONGODB_CONSTANTS = require('./data/constants/db')

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_CONSTANTS.MONGODB_URI,
  collection: 'sessions'
})


app.set('view engine', 'ejs');
app.set('views', 'views');

const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my secret is this', resave: false, saveUninitialized: false, store }))

app.use((req, res, next) => {
  if (req.session.isLoggedIn) {
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  } else {
    next()
  }
});

app.use(authRoutes)
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    MONGODB_CONSTANTS.MONGODB_URI
  )
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Giovani',
          email: 'giovani.inc@gmail.com.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
