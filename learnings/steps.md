# Steps Log — Motion

---

## ? Step 1 — Phase 0 Foundation Scaffold
*Completed: 2026-04-15*

**What was built**
- `.gitignore` — ignores build artifacts and local-only folders
- `package.json` — defines a minimal base project with placeholder scripts
- `tsconfig.json` — establishes TypeScript compiler baseline
- `README.md` — documents the start flow for Windows-first development
- `ops/commands.md` — stores bootstrap/checklist command notes
- `.github/workflows/ci.yml` — adds a CI pipeline placeholder
- directories: `.git`, `.github`, `apps`, `docs`, `ops` — create the expected app structure

**In plain English**
You now have a real project folder you can actually work in. It has a standard app layout, a placeholder command setup, and a CI file, so the next features can be added incrementally without deciding project structure again. From now on, when you run setup steps, you will have a known starting point instead of notes-only files.

**Files changed**
+ created: `.gitignore`
+ created: `package.json`
+ created: `tsconfig.json`
+ created: `README.md`
+ created: `ops/commands.md`
+ created: `.github/workflows/ci.yml`
+ created: `.github/`
+ created: `apps/`
+ created: `docs/`
+ created: `ops/`

## ? Step 2 — Platform and Security Contracts
*Completed: 2026-04-15*

**What was built**
- docs/contracts/platform-segmentation.md — defines what work is done on Windows vs macOS-only tasks.
- docs/contracts/release-security-contract.md — sets the v1 hardening baseline for signed releases, signed updates, server entitlements, and revocation.
- docs/release-checklist.md — adds a release gate checklist with explicit pass/fail checks.

**In plain English**
You now have a rulebook for your project. It clearly says where to do each kind of work so you are not depending on daily Mac access, and it locks your first security model so nobody can make guesses about how releases, updates, and license checks should work. Before you code feature after feature, you now have a shared standard that protects you from accidental mistakes later.

**Files changed**
+ created: docs/contracts/platform-segmentation.md
+ created: docs/contracts/release-security-contract.md
+ created: docs/release-checklist.md

---


## ? Step 3 — Executable Shell Placeholder
*Completed: 2026-04-15*

**What was built**
- Added desktop scaffold layout under `apps/desktop` with: `src/main.tsx`, `index.html`, and `src-tauri` Rust placeholder files (`Cargo.toml`, `tauri.conf.json`, `src/main.rs`).
- Added root validation scripts in `scripts/lint.mjs` and `scripts/build.mjs` to make `npm run lint` and `npm run build` perform real checks.
- Added per-app scripts in `apps/desktop/scripts` so desktop shell checks are runnable from repo root.
- Replaced CI placeholder with a real verify pipeline that runs `npm run lint` and `npm run build`.
- Updated `.gitignore` for build artifacts used by the desktop path.

**In plain English**
You now have a runnable baseline. The repo no longer has fake one-line commands. It can actually verify that the app shell shape exists, and your CI will run those checks automatically. This is the first step from planning docs into executable project state.
## ? Step 4 — Scope Freeze Sync
*Completed: 2026-04-15*

**What was built**
- `planning.md` now has explicit Phase 0 locks and a P0/P1 boundary.
- Step 2 and Step 3 completion state is now reflected in the phase-0 references.
- Confirmed no undocumented feature drift was introduced during scaffold work.

**In plain English**
You now have a clear go/no-go boundary for Phase 0. We won’t start core product features until this foundation is stable, so the project stays controlled and reviewable.
## ? Step 5 — Phase 0 Acceptance Gate
*Completed: 2026-04-15*

**What was built**
- Verified baseline presence of key planning/docs/code artifacts.
- Ran `npm run lint` and `npm run build` successfully.
- Confirmed git working tree is clean after build.
- Confirmed no undocumented files were introduced outside the planned scaffold.

**In plain English**
Your Phase 0 is now officially done. The repo is in a known-good state with a clear scope boundary and a runnable baseline. You can start Feature Phase 1 next without changing the foundation rules.
## ? Step 6 — Phase 1 Product Kernel
*Completed: 2026-04-15*

**What was built**
- Implemented MVP domain model for tasks, recurrence, summary counters, search/filter, and conflict detection in `apps/desktop/src/state.js`.
- Added local persistence contract in `apps/desktop/src/storage.js`.
- Added entitlement baseline and route/feature gates in `apps/desktop/src/entitlement.js`.
- Replaced desktop shell UI with first-use task workflows in `apps/desktop/src/main.tsx` and updated `apps/desktop/index.html`.
- Added functional lint/build/test checks for new app kernel contracts.

**In plain English**
You now have a real usable app surface: create/search/filter tasks, see today/upcoming/overdue, and mark complete/delete. Data is stored locally and feature boundaries are in place for Phase 2 hardening.



---

## ? Step 7 — Phase 2 Contract and Migration Baseline
*Completed: 2026-04-17*

**What was built**
- `apps/desktop/src/contracts.js` — added strict persisted-data schema contracts, migration detection, and normalization helpers.
- `apps/desktop/src/storage.js` — updated load/save to always pass through contract normalization and revision markers.
- `scripts/test.mjs` — added contract migration and payload validation tests for legacy/invalid persisted data.
- `phase-2.md` — generated a deep learning reference document for Phase 2 architecture baseline.

**In plain English**
Your app now starts from a safe, predictable data shape every time, even if old or partially broken saves exist. If stored data is missing fields, the app repairs it to the current format and records what changed. That means future features can run on a stable foundation instead of guessing what was in storage.

**Files changed**
+ created: `apps/desktop/src/contracts.js`
+ created: `phase-2.md`
+ modified: `apps/desktop/src/storage.js`
+ modified: `scripts/test.mjs`

## ? Step 8 — Phase 2 Seed Fixtures and Deterministic Assertions
*Completed: 2026-04-17*

**What was built**
- `apps/desktop/src/fixtures.js` — added deterministic seeded projects and tasks.
- `scripts/test.mjs` — now uses fixed fixture timelines to validate filters, summaries, and conflict detection deterministically.
- Storage contract tests were updated to run against deterministic fixture payloads.

**In plain English**
Your test suite now has fixed sample data, so results no longer depend on current time or randomly created tasks. This gives you stable pass/fail behavior for core product flows like filters, summaries, and conflict detection.

**Files changed**
+ created: `apps/desktop/src/fixtures.js`
+ modified: `scripts/test.mjs`

---
## ? Step 9 — Phase 2 Service Split
*Completed: 2026-04-17*

**What was built**
- Added `apps/desktop/src/taskService.js` and moved task-level operations (normalize/upsert/filter/summary/action/conflict) out of the monolithic state file.
- Added `apps/desktop/src/projectService.js` to own project seed normalization and project lookups.
- Slimmed `apps/desktop/src/state.js` into a thin orchestration/export layer that composes both services.
- Updated `apps/desktop/src/main.tsx` to consume project/task service helpers (`decorateTaskWithProject`, `getProjectById`) so UI behavior stays same with cleaner separation.

**In plain English**
Your domain logic moved from one big `state.js` to small, focused service modules. This keeps the app behavior intact but makes it much easier to evolve without breaking existing flows.

**Files changed**
+ created: `apps/desktop/src/taskService.js`
+ created: `apps/desktop/src/projectService.js`
+ modified: `apps/desktop/src/state.js`
+ modified: `apps/desktop/src/main.tsx`

## ? Step 10 — Phase 2 Persistence Metadata and Upgrade Guard
*Completed: 2026-04-17*

**What was built**
- Extended storage persistence to keep upgrade metadata, sync state, platform/device fingerprint, and revision stamps.
- Added compatibility handling for future-version payloads in the load path.
- Added deterministic storage tests for `saveStoredData` and `loadStoredData` with mocked localStorage and migration markers.

**In plain English**
Your app now treats saved local data like a versioned contract: when schema changes happen, the app can safely normalize old/newer shapes, track what changed, and keep reading without breaking.

---
## ? Step 11 — Phase 2 Scheduling Primitives Baseline
*Completed: 2026-04-17*

**What was built**
- Added `apps/desktop/src/scheduler.js` with planning-window and conflict-overlap primitives.
- Moved plan slice/conflict generation out of `taskService.js` into `scheduler.js`.
- Rewired `state.js` exports so scheduling primitives are available via `main` orchestration layer.
- Updated `main.tsx` to consume `generatePlanSlice` from `scheduler.js`.
- Expanded `scripts/test.mjs` with deterministic window/ranking assertions using fixture data.

**In plain English**
Your scheduling behavior now has its own module instead of being buried inside task logic. The app can now answer: "what tasks should be visible in a planning window" and "which tasks conflict" in one reusable place.

**Files changed**
+ created: `apps/desktop/src/scheduler.js`
+ modified: `apps/desktop/src/taskService.js`
+ modified: `apps/desktop/src/state.js`
+ modified: `apps/desktop/src/main.tsx`
+ modified: `scripts/test.mjs`
+ modified: `steps.md`

## ? Step 12 — Phase 2 UI Plan Window Wiring
*Completed: 2026-04-17*

**What was built**
- Added plan-window controls (`All`, `Today`, `Week`) to `apps/desktop/src/main.tsx`.
- Wired plan rendering through scheduling window output from `buildPlanWindow`.
- Kept existing status/search filters and added a dedicated window slice filter state.
- Preserved current task actions, editing flow, and conflict badges.

**In plain English**
The task list now shows what should be in your planning horizon instead of only a raw status filter. This gives you a real schedule-first planning view before moving to entitlement hardening and runtime guards.

**Files changed**
+ modified: `apps/desktop/src/main.tsx`
+ modified: `steps.md`

## ? Step 13 — Phase 2 Entitlement Contract Hardening
*Completed: 2026-04-17*

**What was built**
- Updated entitlement flow in `apps/desktop/src/entitlement.js` to use a clearer validation contract with snapshot defaults, token signature checks, expiry checks, and readable reasons.
- Extended `scripts/test.mjs` with entitlement tests:
  - default/missing snapshot should remain usable as safe read-write free mode,
  - expired entitlements block mutation gates,
  - tampered token blocks premium feature gates.
- Wired `apps/desktop/src/main.tsx` imports to consume entitlement checks in one place.

**In plain English**
The app now has a hardened baseline rule: if entitlement data is bad or expired, premium mutations stop and the UI enters a clear read-only state instead of silently failing.

**Files changed**
+ modified: `apps/desktop/src/entitlement.js`
+ modified: `scripts/test.mjs`

## ? Step 14 — Phase 2 Runtime Entitlement Guards
*Completed: 2026-04-17*

**What was built**
- Added runtime entitlement state refresh in `main.tsx` before render.
- Disabled add/complete/delete actions when entitlement does not allow `tasks_manage`.
- Added read-only warning message in the editor area when mutation checks fail.
- Updated task action buttons to be disabled in read-only mode.
- Removed duplicate entitlement refresh in `run()` so state checks are clean and consistent.

**In plain English**
Startup and user actions now enforce entitlement rules in real UI behavior. If entitlement is not valid, users still can view and inspect tasks, but mutation actions are blocked with an explicit reason.

**Files changed**
+ modified: `apps/desktop/src/main.tsx`

---

## ? Step 15 — Phase 3 Sync Contract and Outbox Baseline
*Completed: 2026-04-21*

**What was built**
- `apps/desktop/src/syncContract.js` — defines normalized sync events, outbox dedupe rules, and device/session metadata helpers.
- `apps/desktop/src/taskService.js` — task create/complete/delete actions now emit sync events, and time-sensitive filters/summaries can run against a deterministic test clock.
- `apps/desktop/src/storage.js` — persisted payloads now keep `outbox`, `lastSyncAt`, `syncCursor`, `deviceId`, and `syncStatus` while preserving compatibility with older payloads.
- `apps/desktop/src/state.js` — re-exports the new sync helpers through the existing orchestration layer.
- `scripts/test.mjs` — adds Step 15 coverage for mutation-event emission, outbox deduplication, and sync metadata persistence.
- `learnings/plans/phase-3-plan.md` — rewritten into the same phase-plan style as the earlier phase docs and updated with Step 15 execution evidence.

**In plain English**
The app now keeps a proper change queue instead of only remembering the latest task list. Every create, complete, or delete action can now be represented as a sync event, and that queue survives save and reload so later sync work has a real foundation instead of guesses. The tests also stopped depending on the real date for overdue and summary checks, so the Step 15 baseline stays stable over time.

**Files changed**
+ created: `apps/desktop/src/syncContract.js`
~ modified: `apps/desktop/src/taskService.js`
~ modified: `apps/desktop/src/storage.js`
~ modified: `apps/desktop/src/state.js`
~ modified: `scripts/test.mjs`
~ modified: `learnings/plans/phase-3-plan.md`
~ modified: `learnings/steps.md`

---

## ? Step 16 — Phase 3 Sync Queue Wiring and Status UX
*Completed: 2026-04-21*

**What was built**
- `apps/desktop/src/state.js` — added helpers to apply task mutations to app state and derive pending sync health from the outbox.
- `apps/desktop/src/storage.js` — `saveStoredData()` now returns the normalized saved snapshot so runtime state stays aligned with persisted sync metadata.
- `apps/desktop/src/main.tsx` — added a sync health panel showing pending change count, last sync time, cursor, device id, and local-only or degraded status messaging.
- `scripts/test.mjs` — added coverage for runtime outbox wiring and sync summary derivation.
- `learnings/plans/phase-3-plan.md` — updated with Step 16 execution evidence and verification notes.

**In plain English**
The app no longer hides sync state in the background. When you create, complete, or delete a task, the app now keeps that pending sync work attached to the running session and shows a clear status panel explaining whether the change is only local, pending, or degraded. That makes the product safer to trust because it no longer pretends local changes are already synced.

**Files changed**
~ modified: `apps/desktop/src/state.js`
~ modified: `apps/desktop/src/storage.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/plans/phase-3-plan.md`
~ modified: `learnings/steps.md`

---

## ? Step 17 — Phase 3 Calendar Event Contracts and Busy-Block Ingestion
*Completed: 2026-04-21*

**What was built**
- `apps/desktop/src/calendarService.js` — added normalized calendar event parsing, overlay snapshot handling, permission-state normalization, and busy-block extraction helpers.
- `apps/desktop/src/contracts.js` — persisted payloads now include a normalized `calendarOverlay` snapshot and inject a safe empty overlay for older payloads.
- `apps/desktop/src/fixtures.js` — added deterministic calendar events and a fixture overlay snapshot with provider, account, calendar ids, refresh timestamp, and permission metadata.
- `scripts/test.mjs` — added coverage for all-day calendar normalization, invalid event dropping, and overlay persistence through the storage contract.
- `learnings/plans/phase-3-plan.md` — updated with Step 17 execution evidence and verification notes.

**In plain English**
The app now has a clean shape for imported calendar data before scheduling starts using it. Meetings and all-day events can be normalized into one predictable format, old saved payloads automatically get an empty calendar snapshot if they do not have one yet, and broken calendar rows are quietly dropped instead of creating future planner bugs.

**Files changed**
+ created: `apps/desktop/src/calendarService.js`
~ modified: `apps/desktop/src/contracts.js`
~ modified: `apps/desktop/src/fixtures.js`
~ modified: `scripts/test.mjs`
~ modified: `learnings/plans/phase-3-plan.md`
~ modified: `learnings/steps.md`

---

## ? Step 18 — Phase 3 Calendar-Aware Scheduler Output
*Completed: 2026-04-22*

**What was built**
- `apps/desktop/src/scheduler.js` — planning windows now include `busyBlocks`, `blockedTaskIds`, and `availableMinutes` while preserving the existing task overlap output.
- `apps/desktop/src/main.tsx` — the planning summary now shows busy block count, blocked task count, and available minutes, and tasks that collide with imported calendar occupancy are marked in the list.
- `scripts/test.mjs` — added deterministic assertions for calendar-aware planning windows and plan slices.
- `learnings/plans/phase-3-plan.md` — updated with Step 18 execution evidence and verification notes.

**In plain English**
The planner now sees calendar occupancy instead of pretending your day is empty. It can tell you how much time is actually available in the planning horizon, which tasks run into imported busy blocks, and it still keeps the old task-to-task conflict logic working the way it already did.

**Files changed**
~ modified: `apps/desktop/src/scheduler.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/plans/phase-3-plan.md`
~ modified: `learnings/steps.md`

---

## ? Step 19 — Phase 3 Authority Entitlement Refresh
*Completed: 2026-04-22*

**What was built**
- `apps/desktop/src/entitlementClient.js` — added authority refresh normalization and deterministic mock transport scenarios for active, upgrade, revoked, and offline responses.
- `apps/desktop/src/entitlement.js` — entitlement snapshots now track refresh freshness metadata and expose cached, fresh, stale, offline, and revoked states with safe offline fallback behavior.
- `apps/desktop/src/main.tsx` — added an entitlement authority panel with refresh state, last refresh timestamps, mock authority controls, and clearer read-only messaging when access is revoked.
- `scripts/test.mjs` — added deterministic coverage for malformed authority responses, stale refresh windows, upgrade refreshes, offline fallback, and revoked access handling.
- `learnings/plans/phase-3-plan.md` — updated with Step 19 execution evidence and verification notes.

**In plain English**
The app can now act like entitlement access comes from a real authority instead of only whatever was sitting in local storage. It shows whether access is freshly confirmed, cached, stale, offline, or revoked, and it can fall back safely when refresh fails without losing the user’s local work. That makes the read-only path explicit and gives the project a real entitlement lifecycle to build on.

**Files changed**
+ created: `apps/desktop/src/entitlementClient.js`
~ modified: `apps/desktop/src/entitlement.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/plans/phase-3-plan.md`
~ modified: `learnings/steps.md`

---

## ? Step 20 — Phase 3 Acceptance Pass
*Completed: 2026-04-22*

**What was built**
- `scripts/lint.mjs` — updated the acceptance gate to validate the moved `learnings/` docs and the full Phase 3 desktop runtime file set.
- `scripts/build.mjs` — updated the build manifest generation from the old Phase 1 baseline to the current Phase 3 artifact set.
- `ops/phase-3-build-manifest.json` — generated the Phase 3 build manifest from the refreshed build script.
- `scripts/test.mjs` — updated the suite completion line so the test output reflects the full Phase 3 acceptance pass.
- `learnings/planning.md` and `learnings/plans/phase-3-plan.md` — marked Phase 3 complete and recorded the acceptance gate results.

**In plain English**
Phase 3 is now closed out instead of half-finished. The repo's own checks finally match where the docs and runtime files actually live, the build manifest describes the current product slice, and the full validation pass succeeded from start to finish.

**Files changed**
~ modified: `scripts/lint.mjs`
~ modified: `scripts/build.mjs`
+ created: `ops/phase-3-build-manifest.json`
~ modified: `scripts/test.mjs`
~ modified: `learnings/planning.md`
~ modified: `learnings/plans/phase-3-plan.md`
~ modified: `learnings/steps.md`

---
**Roadmap reset: 2026-04-23**
- Phase 4 onward now follows the reverse-engineering-first roadmap in `learnings/planning.md`.
- The older connected-sync-first Phase 4 plan has been replaced by the shell-parity-first Phase 4 plan.
- Execute future work with `/plan` and `/steps`: one numbered step at a time, stop after each completion block, then continue with `next`.

---
## ? Step 21 — Phase 4 Shell State Model Baseline
*Completed: 2026-04-23*

**What was built**
- `apps/desktop/src/shellService.js` — adds the first Motion-shaped shell state layer with default tabs, saved views, sidebar sections, theme normalization, and agenda grouping selectors.
- `apps/desktop/src/state.js` — exports the shell helpers through the existing orchestration layer so the UI can consume shell state without importing a separate module directly.

**In plain English**
The app now has a brain for the shell before the shell itself gets redrawn. Instead of the future sidebar, tabs, and agenda rail being hard-coded directly into the page, there is now one place that decides what tabs exist, what views exist, how the left navigation should be grouped, what theme the shell should use, and how tasks and calendar items should be grouped into "now", "next", and "timeless" buckets. That means the next UI step can build the Motion-style shell on top of structured state instead of inventing layout behavior inline.

**Files changed**
+ created: `apps/desktop/src/shellService.js`
~ modified: `apps/desktop/src/state.js`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/shellService.js`
- `node --check apps/desktop/src/state.js`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\motion run test`

---
## ? Step 22 — Phase 4 Seeded Shell Persistence
*Completed: 2026-04-23*

**What was built**
- `apps/desktop/src/fixtures.js` — seeds Motion-like shell fixture data with dark theme defaults, saved views, tab state, sidebar sections, and an agenda snapshot tied to the deterministic task and calendar fixtures.
- `apps/desktop/src/contracts.js` — promotes shell state into the persisted schema so older payloads automatically gain normalized shell tabs, views, theme, sidebar, and agenda data during migration.
- `apps/desktop/src/storage.js` — persists the normalized shell block alongside the existing task, calendar, and sync state and marks shell presence in storage metadata.
- `scripts/test.mjs` — adds coverage for seeded shell fixtures, shell-state migration from legacy payloads, and storage roundtrips that preserve shell data.

**In plain English**
The app now saves the shell the same way it saves tasks. That means the Motion-like tab setup, saved views, sidebar structure, theme mode, and agenda rail data are no longer just ideas in memory; they are seeded into the app's default state, automatically added to older saved payloads, and kept when the app saves and reloads. This gives the next UI step a real persisted shell to render instead of forcing it to invent layout state on the fly.

**Files changed**
~ modified: `apps/desktop/src/fixtures.js`
~ modified: `apps/desktop/src/contracts.js`
~ modified: `apps/desktop/src/storage.js`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/fixtures.js`
- `node --check apps/desktop/src/contracts.js`
- `node --check apps/desktop/src/storage.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\motion run test`

---
## ? Step 23 — Phase 4 Motion-Like Shell Layout
*Completed: 2026-04-23*

**What was built**
- `apps/desktop/src/main.tsx` — replaces the old stacked planner page with a real shell layout: left sidebar, top tab strip, central content surface, and right agenda rail, while keeping task mutations, sync status, entitlement refresh, and planner logic connected underneath.

**In plain English**
The app no longer opens like a plain form and task list page. It now behaves like a desktop shell, with navigation on the left, tabs across the top, the working surface in the middle, and the agenda plus system panels on the right. The existing planner logic is still there, but it is now sitting inside a Motion-like frame instead of being the whole app experience by itself.

**Files changed**
~ modified: `apps/desktop/src/main.tsx`
~ modified: `learnings/steps.md`

**Verification**
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\motion run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\motion run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\motion run build`

---
## ? Step 24 — Phase 4 Motion-Like Skin and View Navigation
*Completed: 2026-04-24*

**What was built**
- `apps/desktop/src/shellService.js` — upgraded shell state so saved views are grouped into Motion-like sidebar sections, non-tab views still resolve as real active views, and each active view now defines the task collection and descriptive metadata for the workspace.
- `apps/desktop/src/main.tsx` — tightened the shell styling around dark Motion-like tokens and switched the central surface to read its title, chips, empty state, and task collection from the active shell view instead of a generic planner page.
- `scripts/test.mjs` — added coverage for grouped sidebar sections, view-to-tab activation behavior, and view-driven task selection so the shell logic is pinned by tests instead of only by visuals.

**In plain English**
The shell now looks less like a dressed-up custom planner and more like a real Motion-style desktop app. The dark skin is much closer to the app we studied, and the center surface now changes based on which saved view is active instead of always showing the same generic task list with a different label on top. That means the shell is starting to behave like a real navigation system, not just a prettier frame.

**Files changed**
~ modified: `apps/desktop/src/shellService.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/shellService.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\motion run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\motion run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\motion run build`

---
*Next: Step 25 closes Phase 4 with the shell verification gate and then the required deeplearn phase write-up.*
