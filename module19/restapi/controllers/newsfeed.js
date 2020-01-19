const path = require('path')
const fs = require('fs')
const { validationResult } = require('express-validator')
const Post = require('../models/post')
const User = require('../models/user')

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPage = 2
    let totalItems
    Post.find()
        .countDocuments()
        .then(count => {
            totalItems = count
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
        })
        .then(posts => {
            if (!posts) {
                const error = new Error('Posts could not be fetched')
                error.statusCode = 404
                throw error
            }
            res.status(200).json({ message: 'Fetched posts successfully', posts, totalItems })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}
exports.getPost = ((req, res, next) => {
    const { postId } = req.params
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post')
                error.statusCode = 404
                throw error
            }
            res.status(200).json({ message: 'Post fetched.', post })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
})

exports.addPosts = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect')
        error.statusCode = 422
        throw error
    }
    if (!req.file) {
        const error = new Error('No image provided')
        error.statusCode = 422
        throw error
    }
    const imageUrl = req.file.path
    const { title, content } = req.body
    let creator
    const newPost = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId
    })
    newPost.save()
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            creator = user
            user.posts.push(newPost)
            return user.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully',
                post: newPost,
                creator: { _id: creator._id, name: creator.name }
            })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}
exports.updatePost = (req, res, next) => {
    const { postId } = req.params
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect')
        error.statusCode = 422
        throw error
    }
    const { title, content } = req.body
    let imageUrl = req.body.image
    if (req.file) {
        imageUrl = req.file.path
    }
    if (!imageUrl) {
        const error = new Error('No file picked')
        error.statusCode = 422
        throw error
    }
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find the post.')
                error.statusCode = 404
                throw error
            }
            if (post.creator.toString() !== req.userId.toString()) {
                const error = new Error('Not authorized')
                error.statusCode = 403
                throw error
            }
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }
            post.title = title
            post.imageUrl = imageUrl
            post.content = content
            return post.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Post updated!', post: result })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}

exports.deletePost = (req, res, next) => {
    const { postId } = req.params
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find the post.')
                error.statusCode = 404
                throw error
            }
            if (post.creator.toString() !== req.userId.toString()) {
                const error = new Error('Not authorized')
                error.statusCode = 403
                throw error
            }
            clearImage(post.imageUrl)
            return Post.findByIdAndRemove(postId)
        })
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            user.posts.pull(postId)
            return user.save()
        })
        .then(result => {
            console.log(result)
            res.status(200).json({ message: 'Deleted post.' })
        })
        .catch(error => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => console.log(err))
}