const Product = require('../models/product-model')

exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product'
    })
}
exports.postAddProduct = (req, res, next) => {
    const { title, imageURL, price, description } = req.body;
    const product = new Product(title, imageURL, description, price)
    product.save()
    res.redirect('/')
}
exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('admin/products', {
            pageTitle: 'Admin Products',
            path: '/admin/products',
            products
        })
    })
}