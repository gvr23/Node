const getDb = require('../util/database').getDb
const mongodb = require('mongodb')

class Product {
  constructor(title, price, description, imageUrl, active = true, userId) {
    this.title = title
    this.price = price
    this.description = description
    this.imageUrl = imageUrl
    this.active = active
    this.userId = userId
  }

  save() {
    const db = getDb()
    return db.collection('products').insertOne(this)
  }
  edit(id) {
    const db = getDb()
    return db.collection('products').updateOne({ _id: new mongodb.ObjectID(id) }, {$set: {...this}})
      .then(result => result)
      .catch(error => error)
  }
  static fetchAll() {
    const db = getDb()
    return db.collection('products').find({ active: true }).toArray()
      .then(products => products)
      .catch(error => console.log('error fetching products, ', error))
  }
  static fetchProduct(id) {
    const db = getDb()
    return db.collection('products').findOne({ _id: new mongodb.ObjectID(id) })
      .then(prod => prod)
      .catch(error => console.log('this the errorm ', error))
  }
}

module.exports = Product
