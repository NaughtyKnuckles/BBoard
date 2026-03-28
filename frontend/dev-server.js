import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = normalize(join(__filename, '..', '..', 'frontend'));
const port = Number(process.env.PORT || 3001);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function resolveFilePath(requestPath) {
  const safePath = normalize(decodeURIComponent(requestPath)).replace(/^([.][.][/\\])+/, '');
  let resolved = join(rootDir, safePath === '/' ? 'index.html' : safePath);

  if (existsSync(resolved) && statSync(resolved).isDirectory()) {
    resolved = join(resolved, 'index.html');
  }

  if (!existsSync(resolved)) {
    return null;
  }

  return resolved;
}

createServer((req, res) => {
  const filePath = resolveFilePath(req.url || '/');

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
}).listen(port, () => {
  console.log(`NovaBoard frontend running at http://localhost:${port}`);
});
