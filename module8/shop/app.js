const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error-controller');
const app = express();
const sequelize = require('./util/database') 
const adminRoutes = require('./routes/admin-routes');
const shopRoutes = require('./routes/shop-routes');
const Product = require('./models/product-models')
const User = require('./models/user-model')
const Cart = require('./models/cart-model')
const CartItem = require('./models/cart-item-model')
const Order = require('./models/order-model')
const OrderItem = require('./models/order-item-model')

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user
            next()
        })
        .catch(error => console.log('error retrieving the user, ', error))
})
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);


Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Product)

User.hasOne(Cart)
Cart.belongsTo(User)

Cart.belongsToMany(Product, {through: CartItem})
Product.belongsToMany(Cart, {through: CartItem})

Order.belongsTo(User)
User.hasMany(Order)

Order.belongsToMany(Product, {through: OrderItem})
Product.belongsToMany(Order, {through: OrderItem})

sequelize
    .sync()
    .then(result => {
        return User.findByPk(1)
    })
    .then(user => {
        if (!user) {
            return User.create({name: 'Giovani', email: 'test@test.com'})
        }
        return Promise.resolve(user)
    })
    .then(user => {
        return user.createCart()    
    })
    .then(cart => {
        console.log('server started!!!')
        app.listen(3000);
    })
    .catch(error => console.log('error syncing, ', error))
