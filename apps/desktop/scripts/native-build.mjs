import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const preflightScriptPath = path.join(__dirname, 'native-preflight.mjs');
const frontendBuildScriptPath = path.join(__dirname, 'build.mjs');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetValue = args.find((entry) => entry.startsWith('--target='))?.split('=')[1] || '';
const tauriArgs = ['build'];

if (targetValue) {
  tauriArgs.push('--target', targetValue);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function runNodeScript(scriptPath, scriptArgs = []) {
  return spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    cwd: desktopRoot,
    stdio: 'inherit'
  });
}

const frontendBuild = runNodeScript(frontendBuildScriptPath);
if (frontendBuild.status !== 0) {
  fail('DESKTOP_NATIVE_BUILD_FAILED: desktop frontend bundle generation failed.');
}

const preflightArgs = dryRun ? [] : ['--strict'];
if (targetValue) {
  preflightArgs.push(`--target=${targetValue}`);
}
const preflight = runNodeScript(preflightScriptPath, preflightArgs);
if (preflight.status !== 0) {
  fail('DESKTOP_NATIVE_BUILD_BLOCKED: native preflight reported missing prerequisites.');
}

if (dryRun) {
  console.log(`DRY_RUN: cargo-tauri ${tauriArgs.join(' ')}`);
  process.exit(0);
}

const nativeBuild = spawnSync('cargo-tauri', tauriArgs, {
  cwd: desktopRoot,
  stdio: 'inherit'
});

if (nativeBuild.error) {
  fail(`DESKTOP_NATIVE_BUILD_FAILED: ${nativeBuild.error.code || nativeBuild.error.message}`);
}

if (nativeBuild.status !== 0) {
  fail(`DESKTOP_NATIVE_BUILD_FAILED: cargo-tauri build exited with code ${nativeBuild.status}.`);
}

console.log('PASS: native desktop packaging completed.');
