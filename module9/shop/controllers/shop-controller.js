const Product = require('../models/product-models');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(error => console.log('this error from looking at the products, ', error))
};

exports.getProduct = (req, res, next) => {
  const { id } = req.params
  Product.fetchProduct(id)
    .then(product => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product
      })
    })
    .catch(error => console.log('error fetching a single product, ', error))
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(error => { console.log('Error finding all in the index, ', error) })
};

exports.getCart = (req, res, next) => {
  const fetchedCart = req.user.cart
  if (!fetchedCart) {
    console.log('the cart is empty')
    return res.redirect('/')
  }
  req.user.getCart()
    .then(prods => {
      console.log('prds to show, ', prods)
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: prods
      });
    })
    .catch(error => console.log('there was an error, ', error))
};
exports.deleteFromCart = (req, res, next) => {
  const { id, price } = req.body
  req.user.deleteFromCart(id)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(error => console.log('trying to delete, ', error))

}
exports.addToCart = (req, res, next) => {
  const { id } = req.body
  Product.fetchProduct(id)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {
      console.log('success adding, ', result)
      res.redirect('/cart')
    })
    .catch(error => console.log('error adding to the cart, ', error))
}
exports.createOrder = (req, res, next) => {
  req.user.addOrder()
    .then(result => {
      res.redirect('/orders')
    })
    .catch(error => console.log('error adding the products to the order, ', error))
}
exports.getOrders = (req, res, next) => {
  req.user.getOrders()
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders
      });
    })
    .catch(error => console.log('error getting my order, ', error))
};
