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
  const product = new Product(null, title, imageUrl, description, price);
  product.save()
    .then(result => {
      console.log('This is the result from saving, ', result)
      res.redirect('/');
    })
    .catch(error => console.log('Error saving the product, ', error))
};
exports.getEditProduct = (req, res, next) => {
  const editMode = (req.query.edit === 'true')
  if (!editMode) {
    return res.redirect('/')
  }
  const { id } = req.params
  Product.findById(id, (product) => {
    if (!product) {
      return res.redirect('/')
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product
    });
  })
};
exports.postEditProduct = (req, res, next) => {
  const { id, title, imageUrl, price, description } = req.body
  const editedProduct = new Product(id, title, imageUrl, description, price)
  editedProduct.save()
  res.redirect('/admin/products')
}
exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([rows]) => {
      res.render('admin/products', {
        prods: rows,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(error => console.log('Admin error reading the products, ', error));
};
exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body
  Product.delete(id)
  
  res.redirect('/admin/products')
}
