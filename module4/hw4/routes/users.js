const express = require('express')
const router = express.Router()
const generalData = require('./general')

router.get('/users', (req, res, next) => {
    console.log('the request is, ', generalData.userName())
    res.render('users', {
        pageTitle: 'The users',
        user: generalData.user
    })
})

module.exports = router