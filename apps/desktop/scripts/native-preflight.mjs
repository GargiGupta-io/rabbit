import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(desktopRoot, 'src');
const distRoot = path.join(desktopRoot, 'dist');
const tauriRoot = path.join(desktopRoot, 'src-tauri');

const args = process.argv.slice(2);
const strictMode = args.includes('--strict');
const jsonMode = args.includes('--json');
const targetValue = args.find((entry) => entry.startsWith('--target='))?.split('=')[1] || '';
const platformValue = args.find((entry) => entry.startsWith('--platform='))?.split('=')[1] || '';
const distributionValue = args.find((entry) => entry.startsWith('--distribution='))?.split('=')[1] || '';
const requestedPlatform = normalizePlatformValue(platformValue) || derivePlatformFromTarget(targetValue);
const requestedDistribution = resolveDistribution(requestedPlatform, distributionValue);

function normalizePlatformValue(raw = '') {
  const normalized = String(raw || '').trim().toLowerCase();
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
  return '';
}

function resolveDistribution(platform, raw = '') {
  const normalized = String(raw || '').trim().toLowerCase();
  if (normalized === 'apple' || normalized === 'microsoft' || normalized === 'github') {
    return normalized;
  }
  if (platform === 'windows') {
    return 'microsoft';
  }
  if (platform === 'macos') {
    return 'apple';
  }
  return 'github';
}

function derivePlatformFromTarget(value = '') {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('win')) {
    return 'windows';
  }
  if (normalized.includes('darwin') || normalized.includes('mac')) {
    return 'macos';
  }
  if (normalized.includes('linux')) {
    return 'linux';
  }
  return '';
}

function normalizeRelative(filePath) {
  return path.relative(desktopRoot, filePath).replaceAll('\\', '/');
}

function checkFile(filePath, label) {
  return {
    kind: 'file',
    label,
    path: normalizeRelative(filePath),
    ok: fs.existsSync(filePath)
  };
}

function checkCommand(command, commandArgs = ['--version']) {
  const pathValue = process.env.PATH || '';
  const pathEntries = pathValue.split(path.delimiter).filter(Boolean);
  const extensions = process.platform === 'win32'
    ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';').filter(Boolean)
    : [''];
  const directCandidates = process.platform === 'win32' && path.extname(command)
    ? [command]
    : extensions.map((extension) => `${command}${extension}`);

  const resolved = pathEntries.flatMap((entry) => directCandidates.map((candidate) => path.join(entry, candidate)))
    .find((candidate) => fs.existsSync(candidate));

  return {
    kind: 'command',
    label: `${command} ${commandArgs.join(' ')}`.trim(),
    ok: Boolean(resolved),
    detail: resolved ? normalizeRelative(resolved) : 'not found on PATH'
  };
}

function createMacPackagingAdvisory() {
  const expectsMacPackaging = requestedPlatform === 'macos';
  if (!expectsMacPackaging) {
    return null;
  }

  const isMacHost = process.platform === 'darwin';
  return {
    kind: 'advisory',
    label: 'mac packaging host',
    ok: isMacHost,
    detail: isMacHost
      ? 'macOS host available for native Mac packaging.'
      : 'Final .app/.dmg packaging still requires a macOS machine or CI runner.'
  };
}

const checks = [
  {
    kind: 'command',
    label: 'platform profile',
    ok: true,
    detail: `platform=${requestedPlatform || 'host'}, distribution=${requestedDistribution}`
  },
  checkFile(path.join(distRoot, 'index.html'), 'desktop dist entry html'),
  checkFile(path.join(distRoot, 'main.js'), 'desktop dist entry script'),
  checkFile(path.join(sourceRoot, 'main.tsx'), 'desktop source entry'),
  checkFile(path.join(tauriRoot, 'Cargo.toml'), 'tauri cargo manifest'),
  checkFile(path.join(tauriRoot, 'build.rs'), 'tauri build bootstrap'),
  checkFile(path.join(tauriRoot, 'tauri.conf.json'), 'tauri config'),
  {
    kind: 'command',
    label: 'node runtime',
    ok: true,
    detail: process.version
  },
  checkCommand('rustc', ['--version']),
  checkCommand('cargo', ['--version']),
  checkCommand('cargo-tauri', ['--version'])
];

const macAdvisory = createMacPackagingAdvisory();
if (macAdvisory) {
  checks.push(macAdvisory);
}

const failedChecks = checks.filter((entry) => !entry.ok && entry.kind !== 'advisory');
const readyForNativeBuild = failedChecks.length === 0;

if (jsonMode) {
  process.stdout.write(JSON.stringify({
    strictMode,
    target: targetValue || process.platform,
    platform: requestedPlatform || process.platform,
    distribution: requestedDistribution,
    readyForNativeBuild,
    checks
  }, null, 2) + '\n');
} else {
  console.log('Desktop Native Preflight');
  console.log('========================');
  checks.forEach((entry) => {
    const icon = entry.ok ? 'PASS' : (entry.kind === 'advisory' ? 'NOTE' : 'FAIL');
    const location = entry.path ? ` [${entry.path}]` : '';
    const detail = entry.detail ? ` - ${entry.detail}` : '';
    console.log(`${icon}: ${entry.label}${location}${detail}`);
  });
  console.log('');
  console.log(`readyForNativeBuild: ${readyForNativeBuild ? 'yes' : 'no'}`);
}

if (strictMode && !readyForNativeBuild) {
  process.exit(1);
}
