const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')

exports.signup = (req, res, next) => {
    const errors = validationResult(req)
    console.log('this is the errors logged, ', errors)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }
    const { name, email, password } = req.body
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const newUser = new User({
                email,
                password: hashedPassword,
                name
            })
            return newUser.save()
        })
        .then(result => {
            res.status(201).json({ message: 'User created', userId: result._id })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })

}

exports.login = (req, res, next) => {
    const { email, password } = req.body
    let loadedUser
    User.findOne({ email })
        .then(user => {
            if (!user) {
                const error = new Error('AA user with this email could not be found')
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            return bcrypt.compare(password, user.password)
        })
        .then(result => {
            if (!result) {
                const error = new Error('Wrong password entered.')
                error.statusCode = 401
                throw error
            }
            const token = jwt.sign(
                { email: loadedUser.email, userId: loadedUser._id.toString() },
                'somesupersecretsecret',
                { expiresIn: '1h' }
            )
            return res.status(200).json({ token, userId: loadedUser._id.toString() })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}
exports.getStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('User not found.')
                error.statusCode = 401
                throw error
            }
            res.status(200).json({ status: user.status })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}
exports.updateStatus = (req, res, next) => {
    const newStatus = req.body.status
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('User not found.')
                error.statusCode = 401
                throw error
            }
            user.status = newStatus
            return user.save()
        })
        .then(result => {
            res.status(200).json({ message: 'User updated' })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}