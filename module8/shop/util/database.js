// const mysql = require('mysql2')

// const pool = mysql.createPool({
//     // server ip address
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'root1234'
// })

// module.exports = pool.promise()
const Sequelize = require('sequelize').Sequelize
const sequelize = new Sequelize('node-complete', 'root', 'root1234', {dialect: 'mysql', host: 'localhost'})

module.exports = sequelize