const path = require('path')

const express = require('express')
const router = express.Router()

const rootDir = require('../utils/path')

const products = []

router.get('/add-product', (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
    res.render('add-product', { 
        pageTitle: 'Add Product',
        path: '/admin/add-product' 
    })
})

router.post('/add-product', (req, res, next) => {
    const { title } = req.body;
    products.push({title})
    res.redirect('/')
})

exports.routes = router
exports.products = products
