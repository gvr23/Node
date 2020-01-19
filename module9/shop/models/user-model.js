const getDb = require('../util/database').getDb
const mongodb = require('mongodb')
const Product = require('../models/product-models')

class User {
    constructor(name, email, cart, id) {
        this.name = name
        this.email = email
        this.cart = cart
        this._id = new mongodb.ObjectID(id)
    }

    save() {
        const db = getDb()
        return db.collection('users').insertOne(this)
    }
    addToCart(product) {
        let newQty = 1
        const updatedCartItems = [...this.cart.items]
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString()
        })
        if (cartProductIndex >= 0) {
            newQty = updatedCartItems[cartProductIndex].quantity + 1
            updatedCartItems[cartProductIndex].quantity = newQty
        } else {
            product.quantity = newQty
            updatedCartItems.push({ productId: new mongodb.ObjectID(product._id), quantity: newQty })
        }

        const updatedCart = { items: updatedCartItems }
        const db = getDb()
        return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } })


    }
    addOrder() {
        const db = getDb()
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        id: this._id,
                        name: this.name
                    }
                }
                return db.collection('orders').insertOne(order)
            })
            .then(result => {
                this.cart = { items: [] }
                return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: { items: [] } } })
            })
            .catch(error => console.log('the error adding the order is, ', error))
    }
    getOrders() {
        const db = getDb()
        return db.collection('orders').find({'user.id': this._id}).toArray()
    }
    getCart() {
        const db = getDb()
        const productIds = this.cart.items.map(p => p.productId)
        return db.collection('products')
            .find({ _id: { $in: productIds }, active: true })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items.find(prds => {
                            return prds.productId.toString() === p._id.toString()
                        }).quantity
                    }
                })
            })
        /*  return Product.fetchAll()
             .then(products => {
                 const myProds = [...this.cart.items]
                 const showProds = []
                 myProds.forEach(myPrd => {
                     products.forEach(prd => {
                         if (myPrd.productId.toString() === prd._id.toString()) {
                             showProds.push({...prd, quantity: myPrd.quantity})
                             return
                         }
                     })
                 })
                 return Promise.resolve(showProds)
             })
             .catch(error => console.log('error retrieving the products cart, ', error)) */
    }
    deleteFromCart(id) {
        const db = getDb()
        const updatedCartItems = this.cart.items.filter(p => p.productId.toString() !== id.toString())
        return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: { items: updatedCartItems } } })
    }
    static findById(id) {
        const db = getDb()
        return db.collection('users').findOne({ _id: new mongodb.ObjectID(id) })
    }
}

module.exports = User