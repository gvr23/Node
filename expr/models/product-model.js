const products = []

const fs = require('fs')
const path = require('path')
const rootDir = require('../utils/path')
const p = path.join(rootDir, 'data', 'products.json')

const getProductsFromFile = (callback) => {
    return fs.readFile(p, (error, data) => {
        if (error) {
            return callback([])
        }
        return callback(JSON.parse(data))
    })
}

module.exports = class Product {
    constructor(title, imageURL, description, price) {
        this.title = title
        this.imageURL = imageURL
        this.description = description
        this.price = price
    }

    save() {
        getProductsFromFile((products) => {
            products.push(this)
            fs.writeFile(p, JSON.stringify(products), (error) => {
                console.log('Error from writing ', error)
            })
        })
    }
    static fetchAll(callback) {
        getProductsFromFile(callback)
    }
}