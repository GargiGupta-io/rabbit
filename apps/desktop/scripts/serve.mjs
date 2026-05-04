import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const distRoot = path.join(desktopRoot, 'dist');
const host = process.env.RABBIT_DESKTOP_HOST || '127.0.0.1';
const port = Number(process.env.RABBIT_DESKTOP_PORT || 4173);

const MIME_TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
});

function fail(message) {
  console.error(message);
  process.exit(1);
}

function resolvePathname(url = '/') {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const absolutePath = path.resolve(distRoot, relativePath);

  if (!absolutePath.startsWith(distRoot)) {
    return null;
  }

  return absolutePath;
}

function write(response, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store'
  });
  response.end(body);
}

if (!fs.existsSync(distRoot)) {
  fail('DESKTOP_SERVE_PRECONDITION_FAILED: missing apps/desktop/dist. Run `npm.cmd run desktop:build` first.');
}

if (!fs.existsSync(path.join(distRoot, 'index.html'))) {
  fail('DESKTOP_SERVE_PRECONDITION_FAILED: missing apps/desktop/dist/index.html. Run `npm.cmd run desktop:build` first.');
}

const server = http.createServer((request, response) => {
  const targetPath = resolvePathname(request.url || '/');
  if (!targetPath) {
    write(response, 403, 'Forbidden');
    return;
  }

  let filePath = targetPath;
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distRoot, 'index.html');
  }

  try {
    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    const body = fs.readFileSync(filePath);
    write(response, 200, body, contentType);
  } catch (error) {
    write(response, 500, error instanceof Error ? error.message : 'Server error');
  }
});

server.listen(port, host, () => {
  console.log(`Rabbit desktop preview available at http://${host}:${port}`);
});
