const path = require('path')

const express = require('express')
const router = express.Router()

const rootDir = require('../utils/path')
const adminData = require('./admin')

router.get('/', (req, res, next) => {
    console.log('I\'m very good at learning, and these are the products, ', adminData.products)
    // res.sendFile(path.join(rootDir, 'views', 'shop.html'))
    res.render('shop', { 
        pageTitle: 'Shop', 
        path: '/',
        products: adminData.products 
    })
})

module.exports = router