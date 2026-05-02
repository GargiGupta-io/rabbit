# Mac Packaging Lane

## Purpose

This document defines the Mac CI lane that will eventually produce signed and notarized Motion clone desktop artifacts.

Current workflow file:
- `.github/workflows/mac-packaging-lane.yml`

Current status:
- the lane is scaffolded,
- the verification side is real,
- the final signing/notarization side is still placeholder-only.

That is intentional. This repo can now prove the build path is wired, but it does not yet pretend that release signing is fully configured.

## What the workflow does today

### verify-mac-lane

Runs on `macos-latest` and does the following:
- checks out the repo
- sets up Node
- sets up Rust
- installs repo dependencies with `npm ci`
- installs `cargo-tauri`
- builds the desktop frontend bundle with `npm run desktop:build`
- runs native preflight with `npm run desktop:native:preflight -- --strict --target=macos`
- runs a dry-run native package command with `npm run desktop:native:build -- --dry-run --target=macos`

Plain English:
This job proves the Mac runner is able to set up the toolchain, generate the frontend bundle, and reach the point where the real native package command is correctly formed.

### package-macos-placeholder

This job runs only from `workflow_dispatch` when `package_mode=package`.

Current behavior:
- it explains that the packaging lane is still placeholder-only
- it lists the secret names that will be needed later
- it fails intentionally instead of pretending a signed package was produced

Plain English:
This job is a guardrail. It stops anyone from assuming Mac release packaging already exists when the repo has only been scaffolded up to the dry-run stage.

## Why the lane is split this way

There are two different truths we need to preserve:

1. The build path is now real enough to validate in CI.
2. The final signed/notarized Mac package is still not configured in this repo.

If those two truths are mixed together, the workflow becomes misleading. Either it fails all the time for reasons that are not useful, or it appears to succeed without proving a real release artifact exists.

So the lane is split into:
- a real verification lane,
- a placeholder packaging lane.

## Required secret placeholders for real signing

These are the placeholder names the workflow expects to be wired later:
- `APPLE_SIGNING_CERT_BASE64`
- `APPLE_SIGNING_CERT_PASSWORD`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

These are not enough by themselves to finish release packaging. They are only the minimum identity and signing placeholders needed to scaffold the lane.

## What still has to be added later

Before this workflow can claim real Mac release packaging, it still needs:
- signing certificate import into a temporary keychain
- Tauri bundle/sign command for macOS artifacts
- notarization upload and wait flow
- stapling or equivalent final artifact trust step
- artifact upload so CI keeps the built package
- release-manifest integration with hashes and version metadata

## Relationship to the repo release rules

This lane exists to satisfy the repo's existing release rules, not replace them.

Related docs:
- `docs/release-checklist.md`
- `docs/contracts/release-security-contract.md`
- `docs/contracts/platform-segmentation.md`

## When to use which command

### Local Windows machine

Use:
- `npm run desktop:build`
- `npm run desktop:native:preflight`
- `npm run desktop:native:build -- --dry-run`

Do not expect:
- `.app`
- `.dmg`
- signing
- notarization

### Mac CI lane

Use:
- `verify-mac-lane` for every relevant packaging-path change
- `package-macos-placeholder` only when testing the future packaging lane shape

## Success criteria for this stage

This stage is considered successful when:
- the Mac runner can execute the verification lane,
- the workflow shape for packaging is explicit,
- no one can mistake placeholder packaging for a real signed release.
