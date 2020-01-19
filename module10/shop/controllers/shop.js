const Product = require('../models/product')
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
  Product.find({ active: true })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};
exports.getIndex = (req, res, next) => {
  Product.find({ active: true })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};
exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: user.cart.items
      });
    })
    .catch(error => console.log('error getting the cart, ', error))
};
exports.getOrders = (req, res, next) => {
  Order.find({ userId: req.user._id })
    .populate('products.productId')
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};
exports.postOrder = (req, res, next) => {
  const modifiedProducts = req.user.cart.items.map(p => {
    return { productId: p.productId, quantity: p.quantity }
  })
  const newOrder = new Order({
    userId: req.user,
    products: modifiedProducts
  })

  newOrder.save()
    .then(result => {
      console.log('creating is, ', result)
      return req.user.clearCart()
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(error => console.log('error creating the order, ', error))
};
