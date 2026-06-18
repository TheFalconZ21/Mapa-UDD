const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript', // Babel standalone can compile jsx if loaded as text/babel
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let decodedUrl = '';
  try {
    decodedUrl = decodeURIComponent(req.url);
  } catch (e) {
    decodedUrl = req.url;
  }
  
  // Separar los parámetros de consulta (?) de la ruta física
  const urlPath = decodedUrl.split('?')[0];
  let filePath = '.' + urlPath;
  if (filePath === './') {
    filePath = './Campus UDD.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`To view 3D active model: http://localhost:${PORT}/Campus%203D%20Active.html`);
  console.log(`To view 3D prototype: http://localhost:${PORT}/Campus%203D.html`);
  console.log(`To view 2D app: http://localhost:${PORT}/Campus%20UDD.html`);
});
