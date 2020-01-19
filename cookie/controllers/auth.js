const User = require('../models/user')

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.isLoggedIn
    })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body
    User.findOne({ email })
        .then(user => {
            console.log('the result is, ', user)
            if (user) {
                req.session.user = user
                req.session.isLoggedIn = true
                res.redirect('./')
            } else {
                req.session.user = null
                req.session.isLoggedIn = false
                console.log('user not found')
            }
        })
        .catch(error => console.log('finding the user, ', error))
}
exports.postLogout = (req, res, next) => {
    req.session.destroy((error) => {
        console.log('destroyed, ', error)
        res.redirect('/')
    })
}