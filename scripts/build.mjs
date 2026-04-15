import fs from 'node:fs';

const manifestPath = 'ops/phase-0-build-manifest.json';
const manifest = {
  builtAt: new Date().toISOString(),
  phase: 'phase-0',
  step: 3,
  artifact: {
    type: 'desktop-shell-placeholder',
    files: [
      'apps/desktop/package.json',
      'apps/desktop/src-tauri/Cargo.toml',
      'apps/desktop/src-tauri/src/main.rs',
      'apps/desktop/src/main.tsx',
      'apps/desktop/index.html'
    ]
  }
};

fs.mkdirSync('ops', { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const exists = manifest.artifact.files.every((file) => fs.existsSync(file));
if (!exists) {
  console.error('BUILD_PRECONDITION_FAILED: one or more required files missing');
  process.exit(1);
}

console.log(`PASS: generated ${manifestPath}`);
