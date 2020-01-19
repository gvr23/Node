const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const CartItem = sequelize.define(
    'cartItem',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true},
        qty: {type: Sequelize.INTEGER}
    }
)

module.exports = CartItem