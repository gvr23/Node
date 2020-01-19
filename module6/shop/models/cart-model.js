const fs = require('fs')
const path = require('path')

const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json')

getCartFromFile = (callback) => {
    fs.readFile(p, (error, data) => {
        let cart = { products: [], total: 0 }
        if (!error) {
            return callback(JSON.parse(data))
        }
        callback(cart)
    })
}

module.exports = class Cart {
    static addProduct(id, productPrice) {
        getCartFromFile(cart => {
            const existingProductIndex = cart.products.findIndex(product => product.id === id)
            const existingProduct = cart.products[existingProductIndex]
            let updatedProduct
            if (existingProduct) {
                updatedProduct = { ...existingProduct }
                updatedProduct.qty = updatedProduct.qty + 1
                cart.products = [...cart.products]
                cart.products[existingProductIndex] = updatedProduct
            } else {
                updatedProduct = { id, qty: 1 }
                cart.products = [...cart.products, updatedProduct]
            }
            cart.total = (+cart.total + +productPrice).toFixed(2)
            fs.writeFile(p, JSON.stringify(cart), (error) => {
                console.log('writing error, ', error)
            })
        })
    }
    static deleteProduct(id, price) {
        getCartFromFile(cart => {
            if (cart.total === 0) {
                return
            }
            const productIndex = cart.products.findIndex(product => { return product.id === id })
            if (!productIndex) {
                return
            }
            const totalPrice = cart.products[productIndex].qty * price
            const updatedCart = {...cart}
            updatedCart.products = updatedCart.products.filter(product => product.id !== id)
            updatedCart.total = (+updatedCart.total - +totalPrice).toFixed(2)
            fs.writeFile(p, JSON.stringify(updatedCart), (error) => {
                console.log('deleting the file error is, ', error)
            })
        })
    }
    static fetchAll(callback) {
        getCartFromFile(callback)
    }
}