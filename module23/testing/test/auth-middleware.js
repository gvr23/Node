const expect = require('chai').expect
const sinon = require('sinon')
const authMiddleware = require('../middleware/is-auth')
const jwt = require('jsonwebtoken')

describe('Auth middleware', () => {
    it('should throw error if no auth header is present', () => {
        const req = {
            get: () => null
        }
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw('Not')
    })
    it('should throw an error if the auth header is only one string', () => {
        const req = {
            get: () => 'xyz'
        }
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw()
    })
    it('it should yield a userId after the token has been verified', () => {
        const req = {
            get: () => 'Bearer sfdghjkhgfd'
        }
        sinon.stub(jwt, 'verify')
        jwt.verify.returns({ userId: 'abc' })
        authMiddleware(req, {}, () => { })
        expect(req).to.have.property('userId')
        expect(req).to.have.property('userId', 'abc')
        jwt.verify.restore()
    })
    it('should throw error if the token can\'t be verified', () => {
        const req = {
            get: () => 'Bearer xyz'
        }
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw()
    })
})