# Phase 9 - Packaging, Native Build Lane, and Release Setup

> This phase turned the repo from "source code that looks like a desktop app" into "a codebase with a real path toward a packageable desktop artifact," while staying honest about what still requires Rust tooling and a Mac release host.

---

## In Plain English

Before Phase 9, the project had a lot of real app behavior, but the last mile was still fake. The desktop app could be reasoned about and tested, but there was not yet a trustworthy path from source files to something you could seriously describe as a release candidate. The repo still had placeholder build behavior, no real desktop bundle output, and no clear contract for what "packaging verified" even meant.

Phase 9 fixed that gap. It gave the repo a real frontend build output, a native packaging entrypoint, a preflight command that tells the truth about missing native prerequisites, a Mac CI verification lane, and one shared smoke-check contract that explains what the project can honestly claim today.

The important nuance is this: Phase 9 did not magically produce a signed Mac app. That would have been dishonest on this machine. What it did produce is the infrastructure that separates "we have a believable release path" from "we already ship a final notarized artifact." That distinction matters because release engineering is where teams often start lying to themselves without realizing it.

---

## What This Phase Solved

At the start of the phase, the repo still had four practical packaging problems:

1. The desktop build script was placeholder-only.
2. The Tauri config still needed a real production bundle target.
3. There was no guided native packaging entrypoint or tooling preflight.
4. The repo had no shared definition of what a packaging proof pass must verify.

By the end of the phase:

1. `apps/desktop/dist/` became a real generated bundle path.
2. Tauri production config pointed at built artifacts instead of raw source.
3. Native preflight and dry-run packaging commands existed and were wired into package scripts.
4. The Mac CI lane shape was explicit.
5. The packaging smoke-check contract was documented in both machine-readable and human-readable form.

That means the repo can now answer three important release questions clearly:

- "Can the desktop frontend bundle be generated?" Yes.
- "Can the repo describe and verify the native packaging path?" Yes.
- "Can this machine produce a final signed and notarized Mac artifact?" No, and the docs now say that clearly.

---

## Why This Matters

Packaging work often looks boring compared to product work, but it changes what kind of project you actually have.

Without packaging infrastructure, the repo is mostly a development artifact. It can be impressive, but it is still mostly for engineers.

With packaging infrastructure, the repo starts becoming an operational artifact. It gains:

- a repeatable path from source to output,
- explicit build assumptions,
- documented platform limits,
- and CI lanes that can later evolve into real release automation.

That shift matters because a reverse-engineered clone is only useful if it can eventually be distributed, tested on target platforms, and evaluated like a real product instead of only a code exercise.

---

## What We Built

### 1. A real desktop frontend build

The first packaging improvement was replacing the fake desktop build with a real one.

Key files:

- `apps/desktop/scripts/build.mjs`
- `apps/desktop/tsconfig.build.json`
- `apps/desktop/src-tauri/tauri.conf.json`

Plain English:
This is the part that takes the app's source files and turns them into a concrete folder of built files that a desktop shell can actually point at.

What it now does:

- compiles the desktop source tree into `apps/desktop/dist`,
- rewrites the HTML entry so it points at the built script instead of the source entry,
- writes `apps/desktop/dist/desktop-build-manifest.json`,
- and gives Tauri a stable production bundle location.

That matters because Tauri cannot package "intent." It needs real files.

### 2. Native packaging entrypoints and preflight

The second improvement was giving native packaging a real operational entrypoint.

Key files:

- `apps/desktop/src-tauri/build.rs`
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/scripts/native-preflight.mjs`
- `apps/desktop/scripts/native-build.mjs`
- `apps/desktop/package.json`
- `package.json`

Plain English:
This is the part that lets the repo check whether native packaging is even possible before wasting time pretending it is.

The preflight script does not just "try and see what happens." It checks the expected files and toolchain assumptions up front:

- frontend bundle files,
- Tauri bootstrap files,
- Node runtime availability,
- `rustc`,
- `cargo`,
- `cargo-tauri`.

That is important because native packaging failures are expensive and noisy. A clear preflight turns a vague failure into a readable explanation.

The native build script then uses that information to do two different jobs:

- in normal mode, prepare for a real native build,
- in dry-run mode, prove the final native command shape without claiming the artifact exists.

That dry-run path is the honest bridge between Windows development and Mac-targeted packaging work.

### 3. A Mac CI packaging lane scaffold

The third improvement was defining how Mac-native verification should work in CI.

Key files:

- `.github/workflows/mac-packaging-lane.yml`
- `docs/mac-packaging-lane.md`

Plain English:
This is the repo's rehearsal stage for real Mac packaging.

The workflow intentionally splits into two truths:

1. `verify-mac-lane` is real verification.
2. `package-macos-placeholder` is a deliberate non-release placeholder.

That split is one of the most important design decisions in this phase.

If the workflow claimed success without real signing and notarization, the repo would be misleading.
If the workflow tried to fully package without the required secrets and Mac-specific steps, it would fail in a noisy and unhelpful way.

So the lane does exactly what the repo can currently support:

- toolchain setup,
- bundle generation,
- preflight verification,
- dry-run native package validation.

And it deliberately refuses to fake the rest.

### 4. A packaging smoke-check contract

The fourth improvement was creating one shared definition of packaging proof.

Key files:

- `ops/phase-9-packaging-smoke-check.json`
- `ops/packaging-smoke-check.md`
- `ops/commands.md`
- `docs/release-checklist.md`
- `.gitignore`

Plain English:
This is the part that answers the question, "What do we have to prove before we are allowed to say packaging is working?"

The JSON file is the machine-readable contract.
The Markdown file is the human-readable runbook.

Together they define:

- what the local Windows pass proves,
- what the Mac CI lane proves,
- what neither of those passes is allowed to claim,
- and what still has to happen before a shippable artifact is real.

This is more important than it sounds. Release work often fails because people do not distinguish between:

- "the command runs,"
- "the CI lane verifies the structure,"
- and "the final signed artifact exists."

Phase 9 now treats those as three separate states instead of one blurry idea.

---

## How the Pieces Connect

The best way to understand Phase 9 is as a chain.

```
desktop source
    |
    v
build.mjs
    |
    v
apps/desktop/dist
    |
    +--> desktop-build-manifest.json
    |
    v
tauri.conf.json -> frontendDist
    |
    v
native-preflight.mjs
    |
    +--> local truth about missing toolchains
    |
    v
native-build.mjs --dry-run
    |
    v
Mac CI verification lane
    |
    v
packaging smoke-check contract
    |
    v
future signed and notarized release lane
```

This matters because the release path is now layered.

- The frontend build proves the app can become files.
- Tauri wiring proves those files have a native shell path.
- Preflight proves the machine and file assumptions are readable.
- Dry-run proves the package command is shaped correctly.
- Mac CI proves the target platform lane exists.
- The smoke-check contract defines the boundary between "verified path" and "real release."

---

## Code Walkthrough

### `apps/desktop/scripts/build.mjs`

Plain English:
This script is the factory that produces the desktop app bundle.

Important responsibilities:

- remove stale output,
- compile the desktop source tree with the build-focused TypeScript config,
- rewrite `index.html` to point at the built script,
- write a build manifest describing the output.

Why it is written this way:

- the desktop app needs a stable production entry,
- Tauri packaging wants built files, not source imports,
- and the manifest makes it easier to verify what got emitted.

### `apps/desktop/scripts/native-preflight.mjs`

Plain English:
This script is the doorman. It checks whether native packaging should even be attempted.

Important responsibilities:

- verify the expected dist files exist,
- verify Tauri bootstrap files exist,
- inspect the runtime environment,
- report missing Rust/Tauri tooling,
- surface the Mac-host requirement clearly.

Why it is written this way:

- packaging failures are much easier to debug when they are front-loaded,
- and a release path is only credible if it tells the truth about what is missing.

### `apps/desktop/scripts/native-build.mjs`

Plain English:
This script is the packaging dispatcher. It decides whether to run the real native path or just prove the command is assembled correctly.

Important responsibilities:

- force a fresh frontend bundle,
- call preflight,
- support `--dry-run`,
- shape the `cargo-tauri build` command for later real use.

Why it is written this way:

- dry-run is the safest bridge between repo wiring and real native packaging,
- and it lets CI verify command shape before secrets and signing steps exist.

### `.github/workflows/mac-packaging-lane.yml`

Plain English:
This workflow is the repo's first serious Mac packaging rehearsal.

Important responsibilities:

- run on a Mac runner,
- install Node and Rust tooling,
- build the desktop bundle,
- run strict native preflight,
- validate the native dry-run path,
- keep final packaging clearly placeholder-only.

Why it is written this way:

- the repo must distinguish platform verification from release completion,
- and the workflow should teach future maintainers what still needs to be added rather than hiding it.

### `ops/phase-9-packaging-smoke-check.json`

Plain English:
This file is the contract that prevents the release story from drifting.

Important responsibilities:

- list the required local and CI commands,
- declare what each pass must prove,
- declare what each pass must not claim,
- record current known limitations.

Why it is written this way:

- humans forget release assumptions,
- repos evolve,
- and a machine-readable contract makes it easier to keep docs, scripts, and workflows aligned.

---

## What the Verification Gate Proved

For Step 50, these commands passed:

- `npm run desktop:build`
- `npm run test`
- `npm run typecheck`
- `npm run build`

And this command confirmed the remaining native limitation explicitly:

- `npm run desktop:native:preflight -- --target=macos`

What that means in practice:

- the desktop bundle path is real,
- the repo-level build and test gates are green,
- the package lane documentation is honest,
- but local native packaging is still blocked by missing Rust and Tauri tooling on this machine.

That is a good result, not a bad one.

Why?

Because release engineering is not about pretending the gap is gone. It is about making the gap visible, bounded, and actionable.

---

## What the Repo Can Honestly Claim Now

After Phase 9, the repo can honestly claim all of the following:

- it has a real desktop frontend build output,
- it has a real Tauri-facing production bundle path,
- it has native packaging entrypoints,
- it has native preflight checks,
- it has a Mac CI verification lane shape,
- it has a packaging smoke-check contract,
- and it documents remaining platform blockers truthfully.

The repo still cannot honestly claim:

- a signed Mac `.app`,
- a notarized `.dmg`,
- a completed Apple-signing setup,
- a retained release artifact from CI,
- or a fully exercised Rust-native package build on this Windows machine.

That honesty is part of the engineering quality, not a weakness.

---

## Edge Cases and Gotchas

### 1. A green dry-run is not a real package

In plain English:
The command can be shaped correctly without producing a distributable app.

Why it happens:

- dry-run validates structure,
- but it does not prove Rust tooling, signing, notarization, or final artifact output.

How to avoid confusion:

- keep dry-run language separate from release language,
- and keep the smoke-check contract updated.

### 2. Windows can validate the path without owning the final artifact

In plain English:
This machine can verify preparation, but not final Mac distribution.

Why it happens:

- the target platform is macOS,
- and final Mac packaging still depends on platform-specific tooling and release credentials.

How to avoid confusion:

- use Windows for source-to-lane verification,
- use Mac CI or a real Mac host for final artifact work.

### 3. Ignored ops manifests can accidentally hide release proof

In plain English:
If the repo ignores all ops JSON files, an important packaging proof file can disappear from version control.

Why it happened here:

- `.gitignore` already ignored `ops/*.json`,
- but Phase 9 needed one specific tracked manifest.

How it was handled:

- a narrow exception was added only for `ops/phase-9-packaging-smoke-check.json`.

### 4. Workflow scaffolding can become misleading if placeholder jobs look too real

In plain English:
A CI workflow can accidentally make people think shipping is done when only the rehearsal is done.

Why it matters:

- release workflows carry authority,
- and people trust green CI more than they trust prose docs.

How to avoid it:

- keep the placeholder package job explicit,
- fail clearly when real signing is not configured,
- and document the gap in multiple places.

---

## Patterns That Emerged

### Pattern 1: Truthful preflight before expensive work

What it is for:
Use a lightweight gate to explain what is missing before a heavy build even starts.

Why it matters here:

- native builds are slower,
- failures are noisier,
- and many packaging issues are environmental rather than code-level.

### Pattern 2: Dry-run as a release-structure validator

What it is for:
Validate the shape of a future release command without pretending the release exists.

Why it matters here:

- it lets the repo mature incrementally,
- and it avoids coupling everyday development to unavailable release secrets.

### Pattern 3: Machine-readable plus human-readable release proof

What it is for:
Keep one structured contract for tooling and one readable runbook for humans.

Why it matters here:

- scripts drift,
- docs drift,
- and release work becomes fragile when only one of those is maintained.

---

## How This Connects to the Bigger Roadmap

Phase 9 is the bridge between clone parity and shipping reality.

Phases 4 to 8 focused on making the app behave like Motion.
Phase 9 focused on making the repo behave more like a real product team repo.

That means the project now has two kinds of maturity:

1. product maturity:
   - shell parity,
   - domain parity,
   - scheduling parity,
   - sync/cache parity,
   - native shell parity.

2. release maturity:
   - real bundle output,
   - native build entrypoints,
   - CI verification lane,
   - release proof contract.

The next stage can now go in several directions without losing that base:

- live backend integration,
- real Mac packaging execution,
- Apple signing and notarization wiring,
- or new parity work if Motion changes.

---

## Remaining Work After Phase 9

The most obvious remaining work is operational, not product-facing.

To move from "packageable path" to "real release artifact," the repo still needs:

- a machine or CI runner with Rust and Tauri tooling actually installed,
- real Apple signing credentials,
- certificate import logic,
- notarization submission and wait logic,
- final trust/stapling flow,
- artifact retention and release-hash capture.

That means Phase 9 should be seen as release-lane preparation, not final release completion.

---

## Quick Reference

### Commands

- `npm run desktop:build`
  - Generates the desktop frontend bundle.

- `npm run desktop:native:preflight`
  - Checks whether native packaging prerequisites are present.

- `npm run desktop:native:build -- --dry-run`
  - Proves the native packaging command shape without claiming an artifact exists.

- `npm run test`
  - Runs the repo regression suite.

- `npm run typecheck`
  - Verifies TypeScript correctness.

- `npm run build`
  - Runs the repo-level build script.

### Key files

- `apps/desktop/scripts/build.mjs`
- `apps/desktop/tsconfig.build.json`
- `apps/desktop/scripts/native-preflight.mjs`
- `apps/desktop/scripts/native-build.mjs`
- `apps/desktop/src-tauri/build.rs`
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/tauri.conf.json`
- `.github/workflows/mac-packaging-lane.yml`
- `docs/mac-packaging-lane.md`
- `ops/phase-9-packaging-smoke-check.json`
- `ops/packaging-smoke-check.md`

### One-sentence summary

Phase 9 did not produce the final Mac app, but it did produce the first honest, structured, and repeatable path toward one.

---

*Generated: 2026-04-28 | Project: Motion | Phase: 9 | Key files: apps/desktop/scripts/build.mjs, apps/desktop/scripts/native-preflight.mjs, apps/desktop/scripts/native-build.mjs, apps/desktop/src-tauri/tauri.conf.json, .github/workflows/mac-packaging-lane.yml, ops/phase-9-packaging-smoke-check.json*
