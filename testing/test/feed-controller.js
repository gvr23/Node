const expect = require('chai').expect
const mongoose = require('mongoose')
const sinon = require('sinon')
const User = require('../models/user')
const feedController = require('../controllers/feed')

describe('Feed Controller test', () => {
    before(async () => {
        await mongoose
            .connect(
                'mongodb+srv://giovani:rootadmin1234@universalstudios-ifi16.mongodb.net/test-messages?retryWrites=true&w=majority'
            )
        const user = new User({
            email: 'test@test.com',
            password: 'testing1234',
            name: 'Tester',
            posts: [],
            _id: '5e0ca8791a86c503b5886d4d'
        })
        await user.save()
    })

    it('should add the created post to the posts of the creator', async () => {
        const req = {
            body: {
                title: 'This is the title',
                content: 'This is the content'
            },
            file: {
                path: 'path to my image'
            },
            userId: '5e0ca8791a86c503b5886d4d'
        }
        const res = {
            status: function() {
                console.log(this)
                return this
            },
            json: function() {
                return {}
            }
        }
        const savedUser = await feedController.createPost(req, res, () => { })
        expect(savedUser).to.have.property('posts')
        expect(savedUser.posts).to.have.length(1)
    })

    after(async () => {
        await User.deleteMany({})
        await mongoose.disconnect()
    })
})