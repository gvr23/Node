const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const stripe = require('stripe')('sk_test_uHOOivhzZcBWta9Wp11wf4R2')

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ((page * ITEMS_PER_PAGE) < totalItems),
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ((page * ITEMS_PER_PAGE) < totalItems),
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};
exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId
  Order.findById(orderId)
    .then(order => {
      if (order) {
        if (order.user.userId.toString() === req.user._id.toString()) {
          const invoiceName = `invoice-${orderId}.pdf`
          const invoicePath = path.join('data', 'invoices', invoiceName)

          /* fs.readFile(invoicePath, (err, data) => {
            if (err) {
              return next(err)
            }
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-disposition', `ìnline; filename="${invoiceName}"`)
            // res.setHeader('Content-disposition', `attachment; filename="${invoiceName}"`)
            res.send(data)
          }) */
          // const file = fs.createReadStream(invoicePath)
          const pdfDoc = new PDFDocument()
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-disposition', `ìnline; filename="${invoiceName}"`)
          pdfDoc.pipe(fs.createWriteStream(invoicePath))
          pdfDoc.pipe(res)

          pdfDoc.fontSize(26).text('Invoice', { underline: true })
          pdfDoc.text('------------------------------------------')
          let totalPrice = 0.00
          order.products.forEach(prod => {
            totalPrice += (prod.quantity * prod.product.price)
            pdfDoc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x ${prod.product.price}`)
          })
          pdfDoc.text('------------------------------------------')
          pdfDoc.fontSize(20).text(`Total price: $${totalPrice}`)
          pdfDoc.end()
        } else {
          next(new Error('Unauthorized'))
        }
      } else {
        next(new Error('No order found.'))
      }

    })
    .catch(err => next(err))
}
exports.getCheckout = (req, res, next) => {
  let products
  let total = 0
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      products = user.cart.items
      total = products.reduce((acc, current) => acc + (current.quantity * current.productId.price), total)

      return stripe.checkout.sessions.create({
        payment_method_type: ['card'],
        line_items: products.map(p => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity
          }
        }),
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`
      })
        .then(session => {
          res.render('shop/checkout', {
            path: '/checkout',
            pageTitle: 'Checkout',
            products,
            totalSum: total,
            sessionId: session.id
          })
        })
    })
}
exports.getCheckOutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
}
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
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};
exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};
exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};
