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
  product.save();
  res.redirect('/');
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
  Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
};
exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body
  Product.delete(id)
  
  res.redirect('/admin/products')
}
