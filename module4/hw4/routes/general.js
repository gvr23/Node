const express = require('express')
const router = express.Router()

const user = []
var usrNamr = ''

router.get('/', (req, res, next) => {
    res.render('general', {
        pageTitle: 'General'
    })
})

router.post('/', (req, res, next) => {
    const { name } = req.body;
    user.push({name})
    usrNamr = name
    res.redirect('/users')
})

exports.router = router
exports.user = user
exports.userName = () => usrNamr