const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'  // Listen on all interfaces
const port = process.env.PORT || 8885

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

console.log('Starting Next.js app preparation...')
app.prepare().then(() => {
  console.log('Next.js app prepared, creating server...')
  createServer(async (req, res) => {
    try {
      console.log(`Handling request: ${req.method} ${req.url}`)
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start server:', err)
      throw err
    }
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Also accessible on http://localhost:${port}`)

    // Get network IP
    const { networkInterfaces } = require('os')
    const nets = networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`> Network: http://${net.address}:${port}`)
        }
      }
    }
  })
}).catch((err) => {
  console.error('Failed to prepare Next.js app:', err)
})