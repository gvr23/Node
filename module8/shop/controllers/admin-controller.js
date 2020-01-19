const Product = require('../models/product-models');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};
exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, description, price } = req.body
  req.user.createProduct({ title, price, imageUrl, description, active: true })
    .then(result => {
      console.log('Product created')
      res.redirect('/admin/products')
    })
    .catch(error => console.log('error adding a prod, ', error))
};
exports.getEditProduct = (req, res, next) => {
  const editMode = (req.query.edit === 'true')
  if (!editMode) {
    return res.redirect('/')
  }
  const { id } = req.params
  req.user
    .getProducts({ where: { id } })
    // Product.findByPk(id)
    .then(products => {
      const product = products[0]
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
    .catch(error => console.log('this is the error trying to edit, ', error))
};
exports.postEditProduct = (req, res, next) => {
  const { id, title, imageUrl, price, description } = req.body
  Product.upsert({ id, title, imageUrl, price, description })
    .then(result => {
      console.log('this is the result, ', result)
      res.redirect('/admin/products')
    })
    .catch(error => console.log('error updating, ', error))
}
exports.getProducts = (req, res, next) => {
  Product.findAll()
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
exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body
  Product.findByPk(id)
    .then(product => {
      product.active = false
      return product.save()
    })
    .then(result => {
      console.log('Product deleted, ', result)
      res.redirect('/admin/products')
    })
    .catch(error => console.log('the error deleting is, ', error))
}
