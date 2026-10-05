const http = require('http');

const ID = process.env.BACKEND_ID || 'A';
const PORT = parseInt(process.env.PORT || '3001', 10);
const ETAG = '"cn-v1"';

function send(res, status, body, extra = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'X-Backend': ID,
    ...extra,
  });
  res.end(JSON.stringify(body));
}

http.createServer((req, res) => {
  const path = req.url.split('?')[0];

  if (path === '/') {
    return send(res, 200, { message: `Backend ${ID} is running` });
  }

  if (path === '/api/status') {
    return send(res, 200, { backend: ID, status: 'ok' });
  }

  if (path === '/api/cached') {
    const cacheHeaders = { 'Cache-Control': 'max-age=60', 'ETag': ETAG };
    if (req.headers['if-none-match'] === ETAG) {
      res.writeHead(304, { 'X-Backend': ID, ...cacheHeaders });
      return res.end();
    }
    return send(res, 200, { backend: ID, data: 'cacheable content' }, cacheHeaders);
  }

  send(res, 404, { error: 'not found' });
}).listen(PORT, '0.0.0.0', () => console.log(`Backend ${ID} listening on 0.0.0.0:${PORT}`));
