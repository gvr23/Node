const Product = require('../models/product-models');


exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      const prods = products.filter(product => product.active !== false)
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        prods,
        path: '/admin/products'
      });
    })
    .catch(error => console.log('Finding the products error, ', error))
};
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};
exports.getEditProduct = (req, res, next) => {
  const editMode = (req.query.edit === 'true')
  if (!editMode) {
    return res.redirect('/')
  }
  const { id } = req.params
  Product.fetchProduct(id)
    .then(product => {
      if (!product) {
        return res.redirect('/')
      }
      if (!product.active) {
        return res.redirect('/')
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product
      });
    })
    .catch(error => console.log('error getting the product to be edited, ', error))
};


exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, description, price } = req.body
  const { _id } = req.user
  const newProduct = new Product(title, price, description, imageUrl, true, _id)
  newProduct.save()
    .then(saved => {
      console.log('success saving')
      res.redirect('/admin/products')
    })
    .catch(error => console.log('error saving, ', error))
};
exports.postEditProduct = (req, res, next) => {
  const { id, title, imageUrl, price, description } = req.body
  const productEdited = new Product(title, price, description, imageUrl)
  productEdited.edit(id)
    .then(result => {
      console.log('this is the result, ')
      res.redirect('/admin/products')
    })
    .catch(error => console.log('error updating, ', error))
}
exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body
  Product.fetchProduct(id)
    .then(product => {
      const productToDelete = new Product(product.title, product.price, product.description, product.imageUrl, false)
      return productToDelete.edit(id)
    })
    .then(result => {
      console.log('success deleting, ')
      res.redirect('/admin/products')
    })
    .catch(error => console.log('error deleting, ', error))
}
