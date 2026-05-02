import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(desktopRoot, '../..');
const distDir = path.join(desktopRoot, 'dist');
const entryHtmlPath = path.join(desktopRoot, 'index.html');
const entryScriptPath = path.join(distDir, 'main.js');
const tsconfigPath = path.join(desktopRoot, 'tsconfig.build.json');
const tscCliPath = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const manifestPath = path.join(distDir, 'desktop-build-manifest.json');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function listDistFiles(rootDir) {
  return fs.readdirSync(rootDir, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      return listDistFiles(absolutePath);
    }

    return [
      path.relative(distDir, absolutePath).replaceAll('\\', '/')
    ];
  });
}

if (!fs.existsSync(tscCliPath)) {
  fail('DESKTOP_BUILD_PRECONDITION_FAILED: local TypeScript compiler not found in node_modules.');
}

if (!fs.existsSync(tsconfigPath)) {
  fail('DESKTOP_BUILD_PRECONDITION_FAILED: missing apps/desktop/tsconfig.build.json');
}

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

const compile = spawnSync(
  process.execPath,
  [tscCliPath, '--project', tsconfigPath],
  {
    cwd: desktopRoot,
    stdio: 'inherit'
  }
);

if (compile.status !== 0) {
  fail('DESKTOP_BUILD_FAILED: TypeScript emit did not complete successfully.');
}

const rewrittenHtml = fs
  .readFileSync(entryHtmlPath, 'utf8')
  .replace('./src/main.tsx', './main.js');

fs.writeFileSync(path.join(distDir, 'index.html'), rewrittenHtml);

if (!fs.existsSync(entryScriptPath)) {
  fail('DESKTOP_BUILD_FAILED: expected dist/main.js was not emitted.');
}

const manifest = {
  builtAt: new Date().toISOString(),
  artifact: {
    type: 'desktop-frontend-dist',
    root: 'apps/desktop/dist',
    entryHtml: 'apps/desktop/dist/index.html',
    entryScript: 'apps/desktop/dist/main.js',
    files: listDistFiles(distDir)
  },
  checks: {
    compile: 'node ../../node_modules/typescript/bin/tsc --project apps/desktop/tsconfig.build.json',
    htmlRewrite: 'index.html script entry rewritten from ./src/main.tsx to ./main.js'
  }
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`PASS: generated ${path.relative(repoRoot, manifestPath).replaceAll('\\', '/')} and desktop dist bundle`);
