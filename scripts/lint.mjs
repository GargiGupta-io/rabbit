import fs from 'node:fs';
import { execSync } from 'node:child_process';

const REQUIRED = [
  'package.json',
  'README.md',
  'planning.md',
  'plans/phase-0-plan.md',
  'docs/contracts/platform-segmentation.md',
  'docs/contracts/release-security-contract.md',
  'docs/release-checklist.md',
  '.github/workflows/ci.yml',
  'apps/desktop/package.json',
  'apps/desktop/src-tauri/Cargo.toml',
  'apps/desktop/src-tauri/tauri.conf.json',
  'apps/desktop/src-tauri/src/main.rs',
  'apps/desktop/index.html',
  'apps/desktop/src/main.tsx',
  'apps/desktop/src/state.js',
  'apps/desktop/src/storage.js',
  'apps/desktop/src/entitlement.js',
  'scripts/lint.mjs',
  'scripts/build.mjs',
  'scripts/test.mjs'
];

for (const file of REQUIRED) {
  if (!fs.existsSync(file)) {
    console.error(`MISSING_REQUIRED_FILE: ${file}`);
    process.exit(1);
  }
}

const jsFiles = [
  'apps/desktop/src/state.js',
  'apps/desktop/src/storage.js',
  'apps/desktop/src/entitlement.js',
  'scripts/test.mjs',
  'scripts/lint.mjs',
  'scripts/build.mjs',
  'apps/desktop/scripts/build.mjs',
  'apps/desktop/scripts/lint.mjs'
];

for (const file of jsFiles) {
  execSync(`node --check ${file}`, {
    stdio: 'ignore'
  });
}

execSync('npx tsc --noEmit --pretty false', {
  stdio: 'ignore'
});

console.log('PASS: baseline file checklist complete');
console.log('PASS: script syntax checks complete');
console.log('PASS: TypeScript compile checks complete');
