const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`Request from: ${req.socket.remoteAddress} to ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <h1>Gym Bros Test Server</h1>
    <p>If you can see this, port forwarding is working!</p>
    <p>Time: ${new Date().toISOString()}</p>
    <p>Request from: ${req.socket.remoteAddress}</p>
    <p><a href="/">Click here to go to the actual app</a></p>
  `);
});

server.listen(8879, '0.0.0.0', () => {
  console.log('Test server running on http://0.0.0.0:8879');
});