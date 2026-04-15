import fs from 'node:fs';

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
  'apps/desktop/src/main.tsx'
];

for (const file of REQUIRED) {
  if (!fs.existsSync(file)) {
    console.error(`MISSING_REQUIRED_FILE: ${file}`);
    process.exit(1);
  }
}

console.log('PASS: baseline file checklist complete');
