const express = require('express')
const { check, body } = require('express-validator')
const router = express.Router()

const isAuth = require('../middleware/is-auth')

const feedController = require('../controllers/newsfeed')


router.get('/posts', isAuth, feedController.getPosts)
router.get('/post/:postId', isAuth, feedController.getPost)

router.put('/post/:postId', isAuth, feedController.updatePost)

router.post('/post',
    isAuth,
    [
        body('title')
            .trim()
            .isLength({ min: 5 }),
        body('content')
            .trim()
            .isLength({ min: 5 })
    ],
    feedController.addPosts
)

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router