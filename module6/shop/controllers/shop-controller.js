const Product = require('../models/product-models');
const Cart = require('../models/cart-model')

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getProduct = (req, res, next) => {
  const { id } = req.params
  Product.findById(id, (product) => {
    res.render('shop/product-detail', {
      pageTitle: product.title,
      path: '/products',
      product
    })
  })
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req, res, next) => {
  Cart.fetchAll(cart => {
    const cartProducts = []
    Product.fetchAll(products => {
      cart.products.forEach(el => {
        products.find(product => {
          if (product.id === el.id) {
            cartProducts.push({ productData: product, qty: el.qty })
          }
        })
      });
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    })
  })
};
exports.deleteFromCart = (req, res, next) => {
  const { id, price } = req.body
  Cart.deleteProduct(id, price)
  res.redirect('/cart')
}
exports.addToCart = (req, res, next) => {
  const { id } = req.body
  console.log('the id is, ', id)
  Product.findById(id, (product) => {
    console.log('the product is, ', product)
    Cart.addProduct(product.id, product.price)
    res.redirect('/cart')
  })
}
exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
