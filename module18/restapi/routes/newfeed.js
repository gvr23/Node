const express = require('express')
const router = express.Router()

const feedController = require('../controllers/newsfeed')


router.get('/posts', feedController.getPosts)

router.post('/post', feedController.addPosts)

module.exports = router