const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user')

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
    body('email', 'Please provide a valid email')
        .isEmail(),
    body('password', 'Please provide a valid password with only letters and at least 5 characters long')
        .isLength({ min: 5 })
        .isAlphanumeric()
], authController.postLogin);

router.post('/signup', [
    check('email')
        .isEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email already exists, please pick a different one.')
                    }
                })
        }),
    body('password', 'Please enter a password with only numbers and letters and is at least 5 characters long')
        .isLength({ min: 5 })
        .isAlphanumeric(),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value === req.body.password) {
                return true
            }
            throw new Error('Passwords do not match')
        })
        .trim()
], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
