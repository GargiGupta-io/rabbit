# Desktop Packaging Smoke Check

This document defines the minimum evidence needed before anyone says the desktop app is "packageable" or "shippable."

Related manifest:
- `ops/phase-9-packaging-smoke-check.json`

## 1. Local Windows smoke check

Run:
- `npm run desktop:build`
- `npm run desktop:native:preflight -- --target=macos`
- `npm run desktop:native:build -- --dry-run --target=macos`

This local pass must prove:
- the frontend bundle is emitted into `apps/desktop/dist/`,
- the desktop build manifest exists and points at real built files,
- preflight reports missing native prerequisites honestly,
- the native package command shape is valid for a later Mac host or CI runner.

This local pass must not claim:
- a real `.app`,
- a real `.dmg`,
- signing,
- notarization,
- a release-ready artifact.

## 2. Mac CI verification smoke check

Workflow:
- `.github/workflows/mac-packaging-lane.yml`

Verification job:
- `verify-mac-lane`

This CI pass must prove:
- a Mac runner can install the required Node, Rust, and Tauri tooling,
- the desktop bundle builds on a Mac runner,
- strict native preflight passes for the Mac target,
- the repo reaches a valid dry-run native package command on macOS.

This CI pass still does not prove:
- signed artifact output,
- notarized artifact output,
- retained release artifacts,
- final distribution readiness.

## 3. Shippable-artifact proof

Do not call the desktop app shippable until all of these are true:
- the Mac package lane performs a real bundle/sign/notarize flow instead of the placeholder failure path,
- Apple signing credentials are configured in CI,
- notarization succeeds and the final trust step is recorded,
- artifact hash and version metadata are captured for the final release output,
- release docs still describe any remaining limitations truthfully.

## 4. Evidence to attach to a release review

- `apps/desktop/dist/desktop-build-manifest.json`
- `ops/phase-9-packaging-smoke-check.json`
- successful output from the local smoke-check commands
- successful output from `verify-mac-lane`
- final signing/notarization records once the package lane becomes real
