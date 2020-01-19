const expect = require('chai').expect
const sinon = require('sinon')
const mongoose = require('mongoose')
const User = require('../models/user')
const AuthController = require('../controllers/auth')

describe('Auth Controller', () => {
    before((done) => {
        mongoose
            .connect(
                'mongodb+srv://giovani:rootadmin1234@universalstudios-ifi16.mongodb.net/test-messages?retryWrites=true&w=majority'
            )
            .then(result => {
                const user = new User({
                    email: 'test@test.com',
                    password: 'testing1234',
                    name: 'Tester',
                    posts: [],
                    _id: '5e0ca8791a86c503b5886d4d'
                })
                return user.save()
            })
            .then(() => {
                done()
            })
    })
    it('it should throw an error with the status code 500 if accessing the database fails', (done) => {
        sinon.stub(User, 'findOne')
        User.findOne.throws()
        const req = {
            body: {
                email: 'test@test.com',
                password: 'testing1234'
            }
        }
        AuthController.login(req, {}, () => { })
            .then(result => {
                expect(result).to.be.an('error')
                expect(result).to.have.property('statusCode', 500)
                done()
            })
        User.findOne.restore()
    })
    it('get status should return a status code of 200 and the status of the user in an object', async () => {
        const req = { userId: '5e0ca8791a86c503b5886d4d' }
        const res = {
            statusCode: 500,
            userStatus: null,
            status: (code) => {
                this.statusCode = code
                return this
            },
            json: (data) => {
                this.userStatus = data.userStatus
            }
        }
        const result = await AuthController.getUserStatus(req, res, () => { })
        if (result) {
            expect(res.statusCode).to.be.equal(200)
            expect(res.userStatus).to.be.equal('I am new!')
        }
    })
    after(async () => {
        const delt = await User.deleteMany({})
        await mongoose.disconnect()
    })
})