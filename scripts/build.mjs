import fs from 'node:fs';

const manifestPath = 'ops/phase-1-build-manifest.json';
const manifest = {
  builtAt: new Date().toISOString(),
  phase: 'phase-1',
  step: 'foundation + kernel',
  checks: {
    lint: 'node ./scripts/lint.mjs',
    test: 'node ./scripts/test.mjs'
  },
  artifact: {
    type: 'desktop-shell-phase1',
    files: [
      'apps/desktop/index.html',
      'apps/desktop/src/main.tsx',
      'apps/desktop/src/state.js',
      'apps/desktop/src/storage.js',
      'apps/desktop/src/entitlement.js'
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


