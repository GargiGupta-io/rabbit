# Rabbit

Rabbit is a desktop productivity application workspace with a Tauri-based frontend, a local backend simulator, and transport-level validation tooling for exercising real backend contracts during development.

## Status

Active development.

## Overview

Rabbit focuses on three areas:
- a desktop client shell for productivity workflows
- a local backend simulator for repeatable development
- validation tooling that exercises real backend transport paths instead of test-only mocks

## What Works Today

- Desktop frontend build pipeline through `apps/desktop`
- Local backend server for bootstrap, tasks, inbox, calendars, and sync upload flows
- Read-only backend validation against real hosts
- Optional guarded write probe for `/powersync/upload`
- Packaging preflight checks for native desktop builds

## Architecture

```text
apps/desktop  -> Tauri desktop frontend
apps/backend  -> local backend simulator
scripts/*     -> build, lint, validation, packaging helpers
ops/*         -> generated manifests and packaging smoke checks
```

## Start Here

- Install dependencies:
  - `npm install`
- Validate local setup:
  - `npm run lint`
  - `npm run build`
- Build the desktop frontend bundle:
  - `npm run desktop:build`
- Check native packaging prerequisites:
  - `npm run desktop:native:preflight`
- Run platform-profiled native build dry-run:
  - `npm run desktop:native:build:mac -- --dry-run`
  - `npm run desktop:native:build:windows -- --dry-run`
- Preview the native packaging command without running it:
  - `npm run desktop:native:build -- --dry-run`
- Validate a real backend host without touching the UI:
  - `npm run validate:backend`
- Start the local Rabbit backend:
  - `npm run backend:start`

## Platform Notes

- Primary development happens on Windows.
- macOS signing and notarization are handled in CI or remote Mac sessions.
- You can run platform-profiled debug and packaging profiles from one TS codebase:
  - mac profile: `npm run desktop:serve:mac` / `desktop:native:build:mac`
  - windows profile: `npm run desktop:serve:windows` / `desktop:native:build:windows`

## Why The Backend Validator Exists

The validator reuses Rabbit's real runtime transport layer instead of a separate test client. That keeps development closer to production behavior and makes it easier to catch auth, sync, and contract mismatches early.

## Live Backend Validation

The backend validator is read-only by default and only touches `/powersync/upload` if you explicitly opt in.

Required environment variables:
- `RABBIT_BACKEND_URL` - backend base URL such as `https://api.rabbit.example`

Optional environment variables:
- `RABBIT_BACKEND_TOKEN` or `RABBIT_BACKEND_AUTH_TOKEN` - bearer token for authenticated hosts
- `RABBIT_VALIDATE_WORKSPACE_ID` - bootstrap workspace override
- `RABBIT_VALIDATE_VIEW_ID` - bootstrap view override
- `RABBIT_VALIDATE_PROVIDER_IDS` - comma-separated calendar provider ids for the calendar events request
- `RABBIT_VALIDATE_ALLOW_UPLOAD=1` - allows a real `/powersync/upload` probe; leave unset to keep validation read-only

Example PowerShell usage:

```powershell
$env:RABBIT_BACKEND_URL = "https://api.rabbit.example"
$env:RABBIT_BACKEND_TOKEN = "replace-with-real-token"
npm.cmd run validate:backend
```

Local development backend:

```powershell
npm.cmd run backend:start
```

Then, in a second PowerShell window:

```powershell
$env:RABBIT_BACKEND_URL = "http://127.0.0.1:8787"
npm.cmd run validate:backend
```

If you want to allow a real upload probe as part of validation:

```powershell
$env:RABBIT_BACKEND_URL = "https://api.rabbit.example"
$env:RABBIT_BACKEND_TOKEN = "replace-with-real-token"
$env:RABBIT_VALIDATE_ALLOW_UPLOAD = "1"
npm.cmd run validate:backend
```

## Quality Checks

- `npm run lint`
- `npm run build`
- `npm run test`
- `npm run validate:backend`
- `npm run desktop:native:preflight`

## Packaging Status

- The desktop frontend now emits a real bundle at `apps/desktop/dist/`.
- Tauri production config targets that built bundle instead of the raw source tree.
- The Mac CI lane scaffold now lives at `.github/workflows/mac-packaging-lane.yml`.
- Packaging smoke-check proof lives in `ops/phase-9-packaging-smoke-check.json` and `ops/packaging-smoke-check.md`.

Final native `.app` and `.dmg` packaging still requires:
- Rust toolchain (`rustc`, `cargo`, and `cargo tauri`)
- a macOS machine or CI runner for the real Mac artifact
- real Apple signing and notarization credentials plus workflow steps
- Final native windows installer packaging (`.msi`/`.exe`) requires:
- Windows toolchain + signing/distribution setup for release artifacts

## Known Limitations

- Native `.app` and `.dmg` packaging still requires a macOS runner and signing credentials.
- Backend validation depends on real host contract compatibility.
- Upload validation is intentionally read-only by default.
