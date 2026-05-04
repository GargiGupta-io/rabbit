# Rabbit

This repo is the planning-and-build workspace for Rabbit, a macOS-first productivity app rebuilt from reverse-engineered Motion behavior.

## Start here

- Install dependencies:
  - `npm install`
- Validate local setup:
  - `npm run lint`
  - `npm run build`
- Build the desktop frontend bundle:
  - `npm run desktop:build`
- Check native packaging prerequisites:
  - `npm run desktop:native:preflight`
- Preview the native packaging command without running it:
  - `npm run desktop:native:build -- --dry-run`
- Validate a real backend host without touching the UI:
  - `npm run validate:backend`
- Start the local Rabbit backend:
  - `npm run backend:start`
- Platform strategy:
  - Primary development on Windows
  - macOS signing/notarization handled in CI or remote Mac sessions

## Live backend validation

The backend validator reuses Rabbit's real desktop runtime transport layer instead of a separate test-only client. It is read-only by default and only touches `/powersync/upload` if you explicitly opt in.

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

## Packaging status

- The desktop frontend now emits a real bundle at `apps/desktop/dist/`.
- Tauri production config targets that built bundle instead of the raw source tree.
- The Mac CI lane scaffold now lives at `.github/workflows/mac-packaging-lane.yml`.
- Packaging smoke-check proof lives in `ops/phase-9-packaging-smoke-check.json` and `ops/packaging-smoke-check.md`.
- Final native `.app` / `.dmg` packaging still requires:
  - Rust toolchain (`rustc`, `cargo`, and `cargo tauri`)
  - a macOS machine or CI runner for the real Mac artifact
  - real Apple signing/notarization credentials and workflow steps
