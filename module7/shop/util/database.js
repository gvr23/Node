const mysql = require('mysql2')

const pool = mysql.createPool({
    // server ip address
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: 'root1234'
})

module.exports = pool.promise()