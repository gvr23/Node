const Product = require('../models/product-models');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      const prods = products.filter(product => product.active !== false)
      res.render('shop/product-list', {
        prods,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(error => console.log('this error from looking at the products, ', error))
};

exports.getProduct = (req, res, next) => {
  const { id } = req.params
  Product.findByPk(id)
    .then(product => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product
      })
    })
}

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      const prods = products.filter(product => product.active !== false)
      res.render('shop/index', {
        prods,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(error => { console.log('Error finding all in the index, ', error) })
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(cart => {
      if (!cart) {
        console.log('the cart is empty')
        res.redirect('/')
      }
      return cart.getProducts()
    })
    .then((products) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products
      });
    })
    .catch(error => console.log('Error getting the cart, ', error))
};
exports.deleteFromCart = (req, res, next) => {
  const { id, price } = req.body
  console.log('the id is, ', id)
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id } })
    })
    .then(products => {
      const product = products[0]
      return product.cartItem.destroy()
    })
    .then(result => {
      console.log('Product deleted from cart, ', result)
      res.redirect('/cart')
    })
    .catch(error => console.log('trying to delete, ', error))
}
exports.addToCart = (req, res, next) => {
  const { id } = req.body
  let fetchedCart
  let newQty = 1
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart
      return cart.getProducts({ where: { id } })
    })
    .then(products => {
      let product
      if (products.length > 0) {
        product = products[0]
      }
      if (product) {
        newQty = product.cartItem.qty + 1
        return product
      }
      return Product.findByPk(id)
    })
    .then(product => {
      return fetchedCart.addProduct(product, { through: { qty: newQty } })
    })
    .then(() => {
      res.redirect('/cart')
    })
    .catch(error => console.log('error adding to the cart, ', error))
}
exports.createOrder = (req, res, next) => {
  let fetchedCart
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart
      return cart.getProducts()
    })
    .then(products => {
      return req.user.createOrder()
        .then(order => {
          order.addProducts(products.map(product => {
            product.orderItem = { qty: product.cartItem.qty }
            return product
          }))
        })
        .then(result => {
          return fetchedCart.setProducts(null)
        })
        .then(result => {
          res.redirect('/orders')
        })
        .catch(error => console.log('error adding the products to the order, ', error))
    })
    .catch(error => console.log('creating the order error, ', error))
}
exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders
      });
    })
    .catch(error => console.log('error getting my order, ', error))
};
