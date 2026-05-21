import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const distRoot = path.join(desktopRoot, 'dist');
const cliArgs = process.argv.slice(2);

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

function getArgValue(name, fallback = '') {
  const prefixed = `--${name}=`;
  const withPrefix = cliArgs.find((arg) => arg.startsWith(prefixed));
  if (withPrefix) {
    return withPrefix.slice(prefixed.length);
  }
  const index = cliArgs.findIndex((arg) => arg === `--${name}`);
  if (index >= 0 && cliArgs[index + 1]) {
    return cliArgs[index + 1];
  }
  return fallback;
}

function sanitizeValue(rawValue = '') {
  return String(rawValue || '').trim().toLowerCase();
}

function normalizeDesktopPlatform(value = '') {
  const normalized = sanitizeValue(value);
  if (!normalized) {
    return '';
  }

  if (normalized.includes('win')) {
    return 'windows';
  }

  if (normalized.includes('mac') || normalized === 'apple' || normalized === 'darwin') {
    return 'macos';
  }

  if (normalized.includes('linux')) {
    return 'linux';
  }

  return normalized;
}

function normalizeDistribution(value = '') {
  const normalized = sanitizeValue(value);
  if (normalized === 'apple' || normalized === 'microsoft' || normalized === 'github') {
    return normalized;
  }

  if (normalizeDesktopPlatform(normalized) === 'windows') {
    return 'microsoft';
  }

  if (normalizeDesktopPlatform(normalized) === 'macos') {
    return 'apple';
  }

  return '';
}

function createBootstrapMarkup(platform = '', distribution = '') {
  const normalizedPlatform = normalizeDesktopPlatform(platform);
  const normalizedDistribution = normalizeDistribution(distribution) || (normalizedPlatform === 'windows' ? 'microsoft' : 'apple');

  if (!normalizedPlatform) {
    return '';
  }

  const safePlatform = normalizedPlatform.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const safeDistribution = normalizedDistribution.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `<script>window.__RABBIT_DESKTOP_PLATFORM='${safePlatform}';window.__RABBIT_DESKTOP_DISTRIBUTION='${safeDistribution}';</script>`;
}

const requestedPlatform = normalizeDesktopPlatform(
  sanitizeValue(process.env.RABBIT_DESKTOP_PLATFORM) ||
  sanitizeValue(cliArgs.find((arg) => arg.startsWith('--platform='))?.split('=')[1]) ||
  ''
);
const requestedDistribution = normalizeDistribution(
  sanitizeValue(process.env.RABBIT_DESKTOP_DISTRIBUTION) ||
  sanitizeValue(cliArgs.find((arg) => arg.startsWith('--distribution='))?.split('=')[1]) ||
  ''
);
const host = sanitizeValue(process.env.RABBIT_DESKTOP_HOST) || sanitizeValue(getArgValue('host', '127.0.0.1')) || '127.0.0.1';
const port = Number.parseInt(sanitizeValue(process.env.RABBIT_DESKTOP_PORT) || getArgValue('port', '4173'), 10) || 4173;
const bootstrappingScript = createBootstrapMarkup(requestedPlatform, requestedDistribution);
const shouldInjectBootstrap = Boolean(bootstrappingScript);

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
  const isIndexHtml = path.basename(filePath) === 'index.html';

  try {
    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    let body = fs.readFileSync(filePath);
    if (isIndexHtml && shouldInjectBootstrap && contentType.includes('text/html')) {
      body = body
        .toString()
        .replace('</head>', `${bootstrappingScript}</head>`);
    }
    write(response, 200, body, contentType);
  } catch (error) {
    write(response, 500, error instanceof Error ? error.message : 'Server error');
  }
});

server.listen(port, host, () => {
  console.log(`Rabbit desktop preview available at http://${host}:${port}`);
});
