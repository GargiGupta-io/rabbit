import fs from 'node:fs';

const manifestPath = 'ops/phase-3-build-manifest.json';
const manifest = {
  builtAt: new Date().toISOString(),
  phase: 'phase-3',
  step: 'sync + calendar + entitlement baseline',
  checks: {
    lint: 'node ./scripts/lint.mjs',
    test: 'node ./scripts/test.mjs',
    build: 'node ./scripts/build.mjs'
  },
  artifact: {
    type: 'desktop-shell-phase3',
    files: [
      'apps/desktop/index.html',
      'apps/desktop/src/main.tsx',
      'apps/desktop/src/state.js',
      'apps/desktop/src/storage.js',
      'apps/desktop/src/scheduler.js',
      'apps/desktop/src/syncContract.js',
      'apps/desktop/src/calendarService.js',
      'apps/desktop/src/entitlement.js',
      'apps/desktop/src/entitlementClient.js'
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


