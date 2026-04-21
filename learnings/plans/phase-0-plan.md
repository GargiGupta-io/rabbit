# Phase 0 - Detailed Execution Plan

## What Step mode means in this project

Step mode keeps the build disciplined.
- We do one explicit step at a time.
- After each step we confirm results in plain language.
- You can say `next` only when you want to continue.

This avoids random jumps and prevents losing progress.

---

## Step 0 (Preparation): Scope lock before coding

- Confirm this is the target: production-quality Motion-style macOS desktop app.
- Confirm stack: **Tauri + React/TypeScript + Rust**.
- Confirm Phase 0 boundary:
  - repo setup,
  - platform/security contracts,
  - scaffold shell,
  - Phase 0 validation.
- Defer all features until Phase 1.

Output:
- A stable, shared definition in `planning.md`.

---

## Step 1: Foundation scaffold (DONE)

### What is done
- Initialized git repository.
- Created folders: `.github/workflows`, `apps`, `docs/contracts`, `ops`.
- Added:
  - `.gitignore`
  - `package.json`
  - `tsconfig.json`
  - `README.md`
  - `ops/commands.md`
  - `.github/workflows/ci.yml`

### Why this exists
You now have a real project shape. A future feature file goes into a known folder without re-deciding structure.

### Success check
- Repo can be cloned and bootstrapped without guessing.
- Placeholder scripts are available and not failing because of missing files.

---

## Step 2: Platform and security contracts

### 2.1 `docs/contracts/platform-segmentation.md`
- Write a clear split of work:
  - Windows-first work: product logic, data model, UI, API logic.
  - macOS-only work: signing/notarization, permissions, final packaging checks.
- Include a short “who runs what where” matrix.

### 2.2 `docs/contracts/release-security-contract.md`
- Write practical anti-clone policy:
  - signed release builds,
  - signed update/hash verification,
  - server-authoritative licensing,
  - no hardcoded API secrets,
  - revocation and abuse response.

### 2.3 `docs/release-checklist.md`
- Create launch gate checklist with explicit pass/fail items.
- Include mac artifact integrity checks.

### Why this exists
These contracts stop security and release decisions from becoming ad-hoc later.

### Success check
- Any engineer can know in one file where to work and what can be changed locally.

---

## Step 3: Executable shell placeholder

### What to build
- Minimal `apps/desktop` entrypoint.
- Minimal Rust bridge file that exposes one safe test command.
- Upgrade CI from placeholder to run real lint/build checks for scaffold files.

### Why this exists
You prove the app can run as an app before adding big features.

### Success check
- You can run scaffold script and get a predictable baseline result.

---

## Step 4: Scope freeze sync

- Update `planning.md` with final Phase 0 decisions and lock P0/P1 boundaries.
- Confirm no undocumented feature drift.
- Update `steps.md` with completed Step 3.

### Why this exists
Keeps you from accidentally building Phase 1 features during Phase 0.

### Success check
- One source of truth exists for team decisions and phase goals.

---

## Step 5: Phase 0 acceptance gate

- Run bootstrap:
  - `npm run lint`
  - `npm run build`
- Verify structure + docs exist.
- Verify clean git status.

### Why this exists
This is your final “start coding” checkpoint.

### Success check
- No unexpected blockers in baseline structure.
- You can begin Phase 1 without architectural ambiguity.

---

## What “contracts” mean in plain words

A contract is a written rulebook for your team and timeline:
- what happens on Windows,
- what happens on Mac,
- what cannot be done without backend involvement,
- how updates and licenses are protected.

It reduces expensive rework once the app grows.

---

## Step execution policy from here

- One step at a time.
- Step summary appended to `steps.md`.
- `next` to continue.
