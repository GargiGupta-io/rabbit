# Motion Clone App

This repo is the planning-and-build workspace for a macOS-first productivity app.

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
- Platform strategy:
  - Primary development on Windows
  - macOS signing/notarization handled in CI or remote Mac sessions

## Packaging status

- The desktop frontend now emits a real bundle at `apps/desktop/dist/`.
- Tauri production config targets that built bundle instead of the raw source tree.
- The Mac CI lane scaffold now lives at `.github/workflows/mac-packaging-lane.yml`.
- Final native `.app` / `.dmg` packaging still requires:
  - Rust toolchain (`rustc`, `cargo`, and `cargo tauri`)
  - a macOS machine or CI runner for the real Mac artifact
  - real Apple signing/notarization credentials and workflow steps
