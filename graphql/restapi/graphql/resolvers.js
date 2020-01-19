
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Post = require('../models/post')
const { clearImage } = require('../util/file')

module.exports = {
    createUser({ userInput }, req) {
        const { email, password, name } = userInput
        const errors = []
        if (!validator.isEmail(email)) {
            errors.push({ source: 'email', message: 'Email is invalid' })
        }
        if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
            errors.push({ source: 'password', message: 'Password too short' })
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input')
            error.data = errors
            error.code = 422
            throw error
        }
        return User.findOne({ email })
            .then(user => {
                if (user) {
                    const error = new Error('User already exists!')
                    throw error
                }
                return bcrypt.hash(password, 12)
            })
            .then(hashedPassword => {
                const user = new User({
                    email,
                    name,
                    password: hashedPassword
                })
                return user.save()
            })
            .then(createdUser => {
                return { ...createdUser._doc, _id: createdUser._id.toString() }
            })
            .catch(error => {
                if (!error.code) {
                    error.code = 500
                }
                throw error
            })
    },
    login({ email, password }) {
        let foundUser
        return User.findOne({ email })
            .then(user => {
                if (!user) {
                    const error = new Error('User is not found.')
                    error.code = 404
                    throw error
                }
                foundUser = user
                return bcrypt.compare(password, user.password)
            })
            .then(result => {
                if (!result) {
                    const error = new Error('Password is incorrect')
                    error.code = 401
                    throw error
                }
                const token = jwt.sign({ userId: foundUser._id.toString(), email: foundUser.email }, 'supersecretsecret', { expiresIn: '1h' })

                return { token, userId: foundUser._id.toString() }
            })
            .catch(error => {
                console.log('thios is the error, ', error)
                if (!error.code) {
                    error.code = 500
                }
                throw error
            })
    },
    createPost({ postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated')
            error.code = 401
            throw error
        }
        const { title, content, imageUrl } = postInput
        const errors = []
        if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
            errors.push({ source: 'title', message: 'Title is invalid.' })
        }
        if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
            errors.push({ source: 'title', message: 'Title is invalid.' })
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input.')
            error.data = errors
            error.code = 422
            throw error
        }
        let foundUser
        let postAdded
        return User.findById(req.userId)
            .then(user => {
                if (!user) {
                    const error = new Error('User not found!')
                    error.code = 404
                    throw error
                }
                const newPost = new Post({
                    title,
                    imageUrl,
                    content,
                    creator: user._id
                })
                foundUser = user
                return newPost.save()
            })
            .then(createdPost => {
                postAdded = createdPost
                foundUser.posts.push(createdPost)
                return foundUser.save()
            })
            .then(userEdited => {
                return {
                    ...postAdded._doc,
                    _id: postAdded._id.toString(),
                    createdAt: postAdded.createdAt.toISOString(),
                    updatedAt: postAdded.updatedAt.toISOString(),
                    creator: foundUser
                }
            })
            .catch(error => {
                if (!error.code) {
                    error.code = 500
                }
                throw error
            })
    },
    getPosts({ page = 1 }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated')
            error.code = 401
            throw error
        }
        const perPage = 2
        let totalPosts
        return Post.find()
            .countDocuments()
            .then(postsCount => {
                totalPosts = postsCount
                return Post.find()
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .populate('creator')
            })
            .then(posts => {
                return {
                    posts: posts.map(p => {
                        return { ...p._doc, _id: p._id.toString(), createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() }
                    }), totalPosts
                }
            })
            .catch(error => {
                if (!error.code) {
                    error.code = 500
                }
                throw error
            })
    },
    getPost({ postId }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated.')
            error.code = 401
            throw error
        }
        return Post.findById(postId)
            .populate('creator')
            .then(post => {
                if (!post) {
                    const error = new Error('Post not found.')
                    error.code = 404
                    throw error
                }
                return { ...post._doc, _id: post.id.toString(), createdAt: post.createdAt.toISOString() }
            })
            .catch(error => {
                if (!error.code) {
                    error.code = 500
                }
                throw error
            })
    },
    editPost({ postId, postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated')
            error.code = 401
            throw error
        }
        const { title, content, imageUrl } = postInput
        const errors = []
        if (validator.isEmpty(postId)) {
            errors.push({ source: '_id', message: 'Post id not specified.' })
        }
        if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
            errors.push({ source: 'title', message: 'Title is invalid.' })
        }
        if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
            errors.push({ source: 'title', message: 'Content is invalid.' })
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input.')
            error.data = errors
            error.code = 422
            throw error
        }
        return Post.findById(postId)
            .populate('creator')
            .then(post => {
                if (!post) {
                    const error = new Error('this post does not exist.')
                    error.code = 404
                    throw error
                }
                if (post.creator._id.toString() !== req.userId.toString()) {
                    const error = new Error('You are not the author of this pòst')
                    error.code = 403
                    throw error
                }
                post.title = title
                post.content = content
                if (imageUrl !== 'undefined') {
                    post.imageUrl = imageUrl
                }
                return post.save()
            })
            .then(editedPost => {
                return { ...editedPost._doc, _id: editedPost._id.toString(), createdAt: editedPost.createdAt.toISOString(), updatedAt: editedPost.updatedAt.toISOString() }
            })
            .catch(error => {
                if (!error.code) {
                    error.code = 500
                }
                throw error
            })
    },
    deletePost({ postId }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated')
            error.code = 401
            throw error
        }
        return Post.findById(postId)
            .then(post => {
                if (!post) {
                    const error = new Error('Post not found')
                    error.code = 404
                }
                if (post.creator.toString() !== req.userId.toString()) {
                    const error = new Error('Not authorized to delete this post')
                    error.code = 403
                }
                clearImage(post.imageUrl)
                return Post.findByIdAndRemove(postId)
            })
            .then(deletePost => {
                return User.findById(req.userId)
            })
            .then(user => {
                if (!user) {
                    const error = new Error('User not found')
                    error.code = 401
                    throw error
                }
                user.posts.pull(postId)
                return user.save()
            })
            .then(result => {
                console.log('this is deletion result, ', result)
                return true
            })
            .catch(error => {
                if (!error.code) {
                    error.code = 500
                }
                throw error
            })
    },
    getUserStatus(args, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated')
            error.code = 401
            throw error
        }
        return User.findById(req.userId)
            .then(user => {
                if (!user) {
                    const error = new Error('User not found')
                    error.code = 404
                    throw error
                }
                return { ...user._doc, _id: user.id.toString() }
            })
            .catch(error => {
                if (!error.code) {
                    error.code = 500
                }
                throw error
            })
    },
    updateUserStatus: async function ({ newStatus }, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated')
            error.code = 401
            throw error
        }
        try {
            const user = await User.findById(req.userId)
            if (!user) {
                const error = new Error('User not found')
                error.code = 404
                throw error
            }
            user.status = newStatus
            await user.save()
            return true
        } catch (error) {
            if (!error.code) {
                error.code = 500
            }
            throw error
        }
}
}