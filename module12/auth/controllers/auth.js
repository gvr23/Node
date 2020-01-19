const crypto = require('crypto')
const User = require('../models/user');
const bcrypt = require('bcryptjs')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey('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')

// GET -- GET -- GET -- GET -- GET  GET -- GET -- GET -- GET -- GET  GET -- GET -- GET -- GET -- GET  GET -- GET -- GET -- GET -- GET
exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};
exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};
exports.getReset = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset',
    errorMessage: message
  })
}
exports.getNewPassword = (req, res, next) => {
  const { token } = req.params
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        req.flash('error', 'token not found')
        return res.redirect('/')
      }
      let message = req.flash('error')
      if (message.length > 0) {
        message = message[0]
      }
      else {
        message = null
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      })
    })
    .catch(error => console.log(error))
}
// GET -- GET -- GET -- GET -- GET  GET -- GET -- GET -- GET -- GET  GET -- GET -- GET -- GET -- GET  GET -- GET -- GET -- GET -- GET

// POST -- POST -- POST --POST POST -- POST -- POST --POST POST -- POST -- POST --POST POST -- POST -- POST --POST POST -- POST -- POST
exports.postLogin = (req, res, next) => {
  const { email, password } = req.body
  User.findOne({ email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email')
        return res.redirect('/login')
      }
      bcrypt
        .compare(password, user.password)
        .then(match => {
          if (match) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid password')
          return res.redirect('/login')
        })
        .catch(error => {
          console.log('error comparing passwords, ', error)
        })
    })
    .catch(err => console.log(err));
};
exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const newUser = new User({ email, password: hashedPassword, cart: { items: [] } })
      return newUser.save()
    })
    .then(result => {
      res.redirect('/login')
      const msg = {
        to: email,
        from: 'shop@nodecomplete.com',
        subject: 'Signup succeeded!',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<h1>You successfully signed up</h1>'
      }
      sgMail.send(msg)
        .catch(error => console.log('sending error, ', error))
    })
    .catch(error => {
      console.log('error creating the user, ', error)
      req.flash('error', 'Email already exists')
      res.redirect('/signup')
    })
};
exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
exports.postReset = (req, res, next) => {
  const { email } = req.body
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      console.log('this is the error using crypto, ', error)
      return res.redirect('/')
    }
    const token = buffer.toString('hex')
    User.findOne({ email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email was found.')
          return res.redirect('/reset')
        }
        user.resetToken = token
        user.resetTokenExpiration = Date.now() + 3600000
        return user.save()
          .then(result => {
            const msg = {
              to: email,
              from: 'shop@nodecomplete.com',
              subject: 'Password reset',
              html: `
              <p>You requested a password reset</p>
              <p>Click this <a href="http://localhost:3000/new-password/${token}">link</a> to reset your password</p>
            `
            }
            res.redirect('/')
            sgMail.send(msg)
          })
          .catch(error => console.log('this is the error, ', error))
      })
      .catch(error => {
        console.log(error)
      })
  })
}
exports.postNewPassword = (req, res, next) => {
  const { password, confirmPassword, userId, passwordToken } = req.body
  console.log('let me see the password, ', password)
  let usr
  User.findOne({ _id: userId, resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      console.log('ley me see the user, ', user)
      usr = user
      return bcrypt.hash(password, 12)
    })
    .then(hashedPassword => {
      usr.password = hashedPassword
      usr.resetToken = null
      usr.resetTokenExpiration = undefined
      return usr.save()
    })
    .then(result => {
      res.redirect('/login')
    })
    .catch(error => console.log(error))
}
// POST -- POST -- POST --POST POST -- POST -- POST --POST POST -- POST -- POST --POST POST -- POST -- POST --POST POST -- POST -- POST