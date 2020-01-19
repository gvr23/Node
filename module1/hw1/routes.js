const requestHandler = (req, res) => {
    const url = req.url
    const method = req.method
    res.setHeader('Content-Type', 'text/html')

    if (url === '/') {
        res.write('<html>')
        res.write('<head><title>Greeting</title></head>')
        res.write('<body>')
        res.write('<h1>Add a username</h1> <br>')
        res.write('<form action="/create-user" method="POST"><input name="username" type="text" /><button type="submit">Add</button></form>')
        res.write('</body>')
        res.write('</html>')
        res.end()
    }

    if (url === '/users') {
        res.write('<html>')
        res.write('<head><title>User List</title></head>')
        res.write('<body>')
        res.write('<ul><li>Mike</li><li>Max</li><li>Giovani</li><li>Gustavo</li></ul>')
        res.write('</body>')
        res.write('</html>')
        res.end()
    }

    if (url === '/create-user' && method === 'POST') {
        const body = []
        req.on('data', chunk => body.push(chunk))

        req.on('end', () => {
            const parserBody = Buffer.concat(body).toString()
            const usr = parserBody.split('=')[1]
            res.write('<html>')
            res.write('<head><title>User Name</title></head>')
            res.write('<body>')
            res.write(`<h3>${usr}</h3> <br />`)
            res.write('<form action="/none" method="POST"><button type="submit">Back</button></form>')
            res.write('</body>')
            res.write('</html>')
            res.end()
        })
    }

    if (url === '/none' && method === 'POST') {
        res.statusCode = 302
        res.setHeader('Location', '/')
        res.end()
    }
}

module.exports = requestHandler