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
- `learnings/phase-2-architecture-and-security-deeplearn.md` — generated a deep learning reference document for Phase 2 architecture baseline.

**In plain English**
Your app now starts from a safe, predictable data shape every time, even if old or partially broken saves exist. If stored data is missing fields, the app repairs it to the current format and records what changed. That means future features can run on a stable foundation instead of guessing what was in storage.

**Files changed**
+ created: `apps/desktop/src/contracts.js`
+ created: `learnings/phase-2-architecture-and-security-deeplearn.md`
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
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`

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
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`

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
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

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
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 25 — Phase 4 Verification and Deep Learn Closeout
*Completed: 2026-04-24*

**What was built**
- `learnings/planning.md` — marks Phase 4 complete, shifts the active roadmap focus to Phase 5, and links the shell-phase learning write-up.
- `learnings/plans/phase-4-plan.md` — records the Phase 4 closure state, acceptance gate results, and the concrete outcome of the shell parity work.
- `learnings/phase-4-shell-parity-deeplearn.md` — captures the full Phase 4 learning write-up: what shell parity meant, how the shell state and UI are structured, why the saved-view model matters, and what this phase changed in the repo.

**In plain English**
Phase 4 is properly closed now instead of just "looking done." The verification gate passed, the roadmap no longer treats shell parity as in-progress, and there is now a real learning document that explains what this phase taught us so the next phase can build on understanding instead of just momentum.

**Files changed**
~ modified: `learnings/planning.md`
~ modified: `learnings/plans/phase-4-plan.md`
+ created: `learnings/phase-4-shell-parity-deeplearn.md`
~ modified: `learnings/steps.md`

**Verification**
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 26 — Phase 5 Task Contract Expansion
*Completed: 2026-04-24*

**What was built**
- `apps/desktop/src/taskService.js` — expands task normalization to carry Motion-like task domain fields such as `statusId`, `priorityLevel`, dependency ids, schedule state, workspace ownership, and richer scheduling metadata while keeping the existing planner-friendly fields intact.
- `apps/desktop/src/contracts.js` — upgrades persisted payload normalization to schema version 4 and reuses the richer task normalization path so older saved payloads receive safe task-domain defaults instead of staying on the minimal task shape.
- `apps/desktop/src/fixtures.js` — seeds the fixture task set with deterministic Motion-like task metadata for scheduling state, dependencies, stage/task-definition ids, workspace ids, and task priority so future Phase 5 work has realistic source data.
- `scripts/test.mjs` — adds regression coverage for the richer task defaults, fixture task shape, and task-domain roundtrip persistence.

**In plain English**
The app now thinks about tasks more like Motion does instead of treating them like simple checklist rows. Each task can carry scheduling state, dependency links, priority, workspace ownership, and definition metadata, which gives later project, view, and inbox work a much stronger base to build on. Older saved data still loads safely, but it now gets upgraded into the richer task shape automatically.

**Files changed**
~ modified: `apps/desktop/src/taskService.js`
~ modified: `apps/desktop/src/contracts.js`
~ modified: `apps/desktop/src/fixtures.js`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/taskService.js`
- `node --check apps/desktop/src/contracts.js`
- `node --check apps/desktop/src/fixtures.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`

---
## ? Step 27 — Phase 5 Workspace and Project Graph Baseline
*Completed: 2026-04-24*

**What was built**
- `apps/desktop/src/projectService.js` — replaces the flat project-only helper layer with Motion-like workspace, project-definition, stage-definition, task-definition, and staged project-instance normalization.
- `apps/desktop/src/state.js` — upgrades `buildSeedData()` so seeded tasks are reconciled against the workspace and project graph instead of being normalized in isolation.
- `apps/desktop/src/fixtures.js` — seeds a tutorial-style Rabbit graph with the `Learn Rabbit` project definition, three stage definitions, staged project instances, and linked workspace data.
- `scripts/test.mjs` — adds regression coverage for the seeded workspace/tutorial graph and for task reconciliation against project/workspace metadata.

**In plain English**
The repo can now represent a real Motion-style project hierarchy instead of only a list of colored project names. It knows about workspaces, tutorial project templates, stages inside projects, and task definitions inside stages, which makes the later saved-view and inbox work much less fake. The seeded data now includes the `Learn Rabbit` tutorial structure we observed in the real app, so the clone is building on actual Motion concepts instead of guessed placeholders.

**Files changed**
~ modified: `apps/desktop/src/projectService.js`
~ modified: `apps/desktop/src/state.js`
~ modified: `apps/desktop/src/fixtures.js`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/projectService.js`
- `node --check apps/desktop/src/state.js`
- `node --check apps/desktop/src/fixtures.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`

---
## ? Step 28 — Phase 5 View Runtime Parity
*Completed: 2026-04-24*

**What was built**
- `apps/desktop/src/shellService.js` — upgrades saved views from a light shell shape into normalized view-definition objects with filters, grouping, sort rules, visible columns, and view visibility metadata inspired by Motion's observed `views-v3` model.
- `apps/desktop/src/state.js` — adds a view runtime summary helper so the UI can consume shell view state, visible records, column info, and filter summary as one runtime object.
- `apps/desktop/src/main.tsx` — switches the shell header and planner surface to read from the richer saved-view runtime instead of only route labels and simple sort/group fields.
- `scripts/test.mjs` — adds regression coverage for the richer view-definition model and for the new definition-driven task selection behavior.

**In plain English**
Saved views are no longer just named buttons in the sidebar. The app now treats each view more like Motion does: a real definition with its own filters, grouping rules, sort order, visibility, and visible columns. That means the center workspace is starting to be driven by actual view data instead of hard-coded page assumptions.

**Files changed**
~ modified: `apps/desktop/src/shellService.js`
~ modified: `apps/desktop/src/state.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/shellService.js`
- `node --check apps/desktop/src/state.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 29 — Phase 5 Inbox Surface Baseline
*Completed: 2026-04-24*

**What was built**
- `apps/desktop/src/state.js` — adds a lightweight inbox domain summary that normalizes personal inbox items, unread counts, target labels, and safe empty-state behavior using observed Motion notification item types.
- `apps/desktop/src/fixtures.js` — seeds deterministic inbox data with structured personal inbox items such as task assignments, mentions, project stage updates, meeting insights, and post-onboarding guidance.
- `apps/desktop/src/main.tsx` — renders a real inbox panel in the desktop shell rail with unread counts, source counts, and a structured item list instead of leaving inbox as an implied future area.
- `scripts/test.mjs` — adds coverage for fixture inbox seeding, inbox unread summaries, target resolution, and safe empty-state fallback.

**In plain English**
The app now has a real inbox surface instead of just evidence that inbox will exist later. It can show structured notifications, unread counts, and the main target each item points to, which brings the shell closer to how Motion exposes assignments, mentions, and updates. Even if there are no items yet, the inbox now degrades into a clean empty state instead of being missing entirely.

**Files changed**
~ modified: `apps/desktop/src/state.js`
~ modified: `apps/desktop/src/fixtures.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/state.js`
- `node --check apps/desktop/src/fixtures.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 30 — Phase 5 Verification and Deep Learn Closeout
*Completed: 2026-04-24*

**What was built**
- `learnings/planning.md` — marks Phase 5 complete, makes Phase 6 the current detailed phase, and adds the new Phase 5 deep-learn reference to the roadmap.
- `learnings/plans/phase-5-plan.md` — records the Phase 5 closure state and acceptance-gate outcome.
- `learnings/phase-5-domain-parity-deeplearn.md` — captures the Phase 5 learning write-up covering task, project, view, and inbox domain parity and how those layers now connect.
- `learnings/steps.md` — logs Step 30 and points the handoff to Step 31.

**In plain English**
Phase 5 is properly closed now instead of just feeling complete. The acceptance gate passed, the roadmap now treats domain parity as finished work, and the repo has a dedicated learning note explaining what changed and why it matters before Phase 6 starts. That means the next phase begins from a stable handoff instead of tribal memory.

**Files changed**
~ modified: `learnings/planning.md`
~ modified: `learnings/plans/phase-5-plan.md`
+ created: `learnings/phase-5-domain-parity-deeplearn.md`
~ modified: `learnings/steps.md`

**Verification**
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 31 — Phase 6 Calendar Entity Alignment
*Completed: 2026-04-25*

**What was built**
- `apps/desktop/src/calendarService.js` — expands calendar normalization to carry Motion-like calendar entities, provider metadata, access roles, event visibility, organizers, attendees, conference details, recurrence fields, and provider-aware source metadata while keeping planner-friendly busy-block fields intact.
- `apps/desktop/src/contracts.js` — bumps the persisted schema to `v5`, applies a calendar-entity migration step for older payloads, and validates that stored overlays now include a calendar collection as well as imported events.
- `apps/desktop/src/fixtures.js` — seeds richer Google calendar fixtures with real calendar definitions, account metadata, and event objects shaped closer to Motion's extracted calendar and calendar-event models.
- `scripts/test.mjs` — adds regression coverage for richer calendar overlay normalization, Motion-like event metadata, and persisted storage roundtrips with the expanded calendar shape.

**In plain English**
The app no longer treats the calendar as just a loose list of busy blocks. It now remembers which calendars those events came from, which account they belong to, whether a calendar is primary or shared, and richer details on each event such as attendees, meeting links, visibility, and recurrence-related fields. That makes the saved data much closer to the real Motion app without breaking the existing planner behavior.

**Files changed**
~ modified: `apps/desktop/src/calendarService.js`
~ modified: `apps/desktop/src/contracts.js`
~ modified: `apps/desktop/src/fixtures.js`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/calendarService.js`
- `node --check apps/desktop/src/contracts.js`
- `node --check apps/desktop/src/fixtures.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 32 — Phase 6 Scheduling Semantics Alignment
*Completed: 2026-04-25*

**What was built**
- `apps/desktop/src/taskService.js` — adds Motion-like schedule-summary helpers so tasks can be described as on track, pending reschedule, stale, or unable to fit instead of only exposing raw stored status fields.
- `apps/desktop/src/scheduler.js` — splits planner semantics into dependency-blocked tasks, calendar conflicts, task conflicts, pending reschedules, and unschedulable tasks while keeping the existing horizon and busy-block calculations.
- `apps/desktop/src/main.tsx` — updates the shell metrics and task cards to show separate schedule chips and warnings for blocked, conflicted, pending, and cannot-fit states.
- `scripts/test.mjs` — adds deterministic coverage for schedule-summary labels and for the new planner semantic buckets so the behavior does not drift.

**In plain English**
The planner no longer treats every scheduling problem as the same kind of warning. It now distinguishes between tasks that are blocked by dependencies, tasks that collide with other work or calendar time, tasks that still need to be rescheduled, and tasks that simply cannot fit. That makes the planner output much closer to how Motion talks about scheduling problems instead of flattening everything into one generic conflict message.

**Files changed**
~ modified: `apps/desktop/src/taskService.js`
~ modified: `apps/desktop/src/scheduler.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/taskService.js`
- `node --check apps/desktop/src/scheduler.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 33 — Phase 6 Task Form Baseline
*Completed: 2026-04-25*

**What was built**
- `apps/desktop/src/state.js` — adds shared task-form state and option helpers so project defaults, assignee choices, schedule modes, and form normalization all come from one place instead of being hard-coded in the page.
- `apps/desktop/src/taskService.js` — adds form-to-draft conversion and fixed-time scheduling support so the richer form can still create normalized tasks cleanly.
- `apps/desktop/src/main.tsx` — replaces the tiny quick-add row with a real Motion-style task form surface that supports title, description, project, assignee, priority, status, schedule mode, schedule, due/start times, duration, deadline type, and recurrence.
- `scripts/test.mjs` — adds regression coverage for form defaults, option sets, and fixed-time draft generation.

**In plain English**
The app no longer creates tasks through a tiny one-line capture row. It now has a real task form with the kind of defaults Motion uses: project-aware workspace selection, richer scheduling modes, assignee and priority controls, and a fuller set of task details before creation. That makes the creation flow feel much closer to the actual app and gives Step 34 a real form layer to build on.

**Files changed**
~ modified: `apps/desktop/src/state.js`
~ modified: `apps/desktop/src/taskService.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/state.js`
- `node --check apps/desktop/src/taskService.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 34 — Phase 6 Project-Aware Task Form Defaults
*Completed: 2026-04-25*

**What was built**
- `apps/desktop/src/projectService.js` — adds project-stage option helpers and stage-aware task-form defaults so tutorial-style projects can drive stage selection and default start/due windows.
- `apps/desktop/src/taskService.js` — extends task-form draft building so stage ids, project-definition ids, start windows, and recurrence intervals survive form submission in normalized task drafts.
- `apps/desktop/src/main.tsx` — upgrades the Motion-style task form with stage selection, recurrence interval control, project-aware default dates, and per-project reset behavior without falling back to the old inline task row.
- `scripts/test.mjs` — adds deterministic coverage for tutorial-project stage defaults and for stage-aware recurring task draft generation.

**In plain English**
The task form now reacts to project context instead of treating every project the same. If you create work inside the tutorial-style Motion project, the form can pick the active stage, suggest start and due dates based on that stage, and carry recurrence interval data into the saved task draft. That moves the form much closer to the project-aware behavior we saw in the real Motion app.

**Files changed**
~ modified: `apps/desktop/src/projectService.js`
~ modified: `apps/desktop/src/taskService.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/projectService.js`
- `node --check apps/desktop/src/taskService.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 35 — Phase 6 Verification and Deep Learn Closeout
*Completed: 2026-04-25*

**What was built**
- `learnings/planning.md` — marks Phase 6 complete, makes Phase 7 the active detailed phase, and adds the new Phase 6 learning reference.
- `learnings/plans/phase-6-plan.md` — records the Phase 6 closure state and acceptance-gate outcome.
- `learnings/phase-6-calendar-scheduling-form-deeplearn.md` — captures the Phase 6 learning write-up covering calendar entities, scheduling semantics, task-form structure, and project-aware defaults.
- `learnings/steps.md` — logs Step 35 and points the handoff to Step 36.

**In plain English**
Phase 6 is closed properly now instead of just being “the last thing we worked on.” The gate was rerun, the roadmap now treats calendar, scheduling, and form parity as finished work, and the repo has a dedicated learning note explaining what changed and why it matters before the API and sync phase starts.

**Files changed**
~ modified: `learnings/planning.md`
~ modified: `learnings/plans/phase-6-plan.md`
+ created: `learnings/phase-6-calendar-scheduling-form-deeplearn.md`
~ modified: `learnings/steps.md`

**Verification**
- `rg -n "quick-add|Task form|composer-panel|task-edit surface|inline add-task" apps/desktop/src/main.tsx`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 36 — Phase 7 API Client Wrapper Baseline
*Completed: 2026-04-25*

**What was built**
- `apps/desktop/src/apiClient.js` — adds a small local contract layer for query and mutation wrappers so request shape, query keys, and response transforms can be expressed consistently.
- `apps/desktop/src/tasksClient.js` — adds Motion-shaped task query and mutation wrappers for `v2/tasks` queries, task-by-id lookups, and task mutations.
- `apps/desktop/src/viewsClient.js` — adds `v3/views` wrappers and the view-response normalization hook that applies Motion-style visible-column and completed-filter defaults.
- `apps/desktop/src/calendarClient.js` — adds wrapper definitions for calendars, uncached calendar list fetches, calendar-event queries, and scheduling-assistant requests.
- `apps/desktop/src/inboxClient.js` — adds inbox item, unread-count, and mark-as-read wrappers aligned with Motion's notification endpoints and keys.
- `apps/desktop/src/bootstrapClient.js` — adds bootstrap, user, settings, feature-permission, and task-default wrappers for the bootstrap-like state Motion caches locally.
- `scripts/test.mjs` — adds deterministic tests for client request shapes, query keys, invalidation targets, and response transforms.

**In plain English**
The repo now has a real API-client baseline instead of only app-state and sync code. We can describe how Motion-shaped requests should look for tasks, views, calendars, inbox, and user/bootstrap state without wiring the full transport stack yet. That gives the next sync and cache steps something concrete to build on instead of inventing request shapes ad hoc.

**Files changed**
+ created: `apps/desktop/src/apiClient.js`
+ created: `apps/desktop/src/tasksClient.js`
+ created: `apps/desktop/src/viewsClient.js`
+ created: `apps/desktop/src/calendarClient.js`
+ created: `apps/desktop/src/inboxClient.js`
+ created: `apps/desktop/src/bootstrapClient.js`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/apiClient.js`
- `node --check apps/desktop/src/tasksClient.js`
- `node --check apps/desktop/src/viewsClient.js`
- `node --check apps/desktop/src/calendarClient.js`
- `node --check apps/desktop/src/inboxClient.js`
- `node --check apps/desktop/src/bootstrapClient.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 37 — Phase 7 Sync DTO Alignment
*Completed: 2026-04-25*

**What was built**
- `apps/desktop/src/syncContract.js` — reshapes local task mutation events so they keep the app-friendly action fields while also carrying extracted-style sync metadata such as `type`, `pushType`, `$version`, `data`, and `metadata`.
- `apps/desktop/src/syncClient.js` — adds batch-request and batch-response helpers for `push.task.*` events so the outbox can be prepared and acknowledged in a Motion-like sync-engine shape.
- `apps/desktop/src/state.js` — adds sync batch summary and acknowledgement handling so successful push responses clear the outbox while failures stay queued.
- `scripts/test.mjs` — adds deterministic coverage for extracted-style sync event shapes, push batch requests, and acknowledgement behavior.

**In plain English**
The outbox is no longer just a queue of custom local events. It now carries the same kind of event naming split Motion uses: a synced event type like `task.created` and a push event type like `push.task.create`, along with structured event data and metadata. That means the next transport step can work from a much more realistic sync shape instead of translating from a thin ad hoc event format.

**Files changed**
~ modified: `apps/desktop/src/syncContract.js`
+ created: `apps/desktop/src/syncClient.js`
~ modified: `apps/desktop/src/state.js`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/syncContract.js`
- `node --check apps/desktop/src/syncClient.js`
- `node --check apps/desktop/src/state.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 38 — Phase 7 Cache State Alignment
*Completed: 2026-04-26*

**What was built**
- `apps/desktop/src/storage.js` — derives and persists an IndexedDB-style query cache snapshot for bootstrap, current-user, settings, page-view settings, feature permissions, views, calendar-list state, and workspace queries.
- `apps/desktop/src/state.js` — adds a cache summary helper so runtime code can read query counts, active workspace/view, cached settings groups, and extracted key labels from one place.
- `apps/desktop/src/main.tsx` — extends the right-rail sync panel so it also surfaces cached-query counts, cached views/settings/calendar state, and the key Motion-like query families being persisted locally.
- `scripts/test.mjs` — adds deterministic coverage for extracted cache-key evidence and verifies that the saved payload keeps query-cache state across save and reload.

**In plain English**
The app now behaves more like Motion’s local client cache instead of only saving raw tasks and shell state. It keeps a named query cache for things like user settings, saved views, calendar-list state, and workspace data, and it shows that cache in the UI so the desktop shell is honest about what local state has already been hydrated. That makes the next reconciliation step build on a much more realistic client-state model.

**Files changed**
~ modified: `apps/desktop/src/storage.js`
~ modified: `apps/desktop/src/state.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/storage.js`
- `node --check apps/desktop/src/state.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 39 — Phase 7 PowerSync Reconciliation Baseline
*Completed: 2026-04-26*

**What was built**
- `apps/desktop/src/syncClient.js` — adds PowerSync-style CRUD upload batching, upload-response normalization, temp-id mapping support, and outbox remapping helpers while keeping the earlier push-event helpers intact.
- `apps/desktop/src/state.js` — upgrades sync summaries to include upload-operation state and teaches sync reconciliation to clear acknowledged events, keep failed ones queued, and remap task ids after server acknowledgement.
- `scripts/test.mjs` — adds deterministic coverage for PowerSync CRUD request shaping, temp-id to real-id remapping, and partial-failure reconciliation.

**In plain English**
The sync layer can now package local changes the way a PowerSync-style uploader expects: as CRUD operations instead of only event envelopes. More importantly, when the server says “this create worked, this update failed, and this temporary id is now a real id,” the app can update its local task list and queued sync work correctly instead of getting stuck on the old temporary id.

**Files changed**
~ modified: `apps/desktop/src/syncClient.js`
~ modified: `apps/desktop/src/state.js`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/syncClient.js`
- `node --check apps/desktop/src/state.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
## ? Step 40 — Phase 7 Verification and Deep Learn Closeout
*Completed: 2026-04-26*

**What was built**
- `learnings/planning.md` — marks Phase 7 complete, makes Phase 8 the current detailed phase, and adds the Phase 7 deep-learn reference to the roadmap.
- `learnings/plans/phase-7-plan.md` — records the Phase 7 closure state and acceptance-gate outcome.
- `learnings/phase-7-api-sync-cache-deeplearn.md` — captures the Phase 7 learning write-up covering client wrappers, sync-event structure, query-cache behavior, and PowerSync-style reconciliation.
- `learnings/steps.md` — logs Step 40 and points the handoff to Step 41.

**In plain English**
Phase 7 is properly closed now instead of just being the last backend-oriented work we touched. The verification gate passed again, the roadmap now treats API, sync, and cache parity as finished work, and the repo has a dedicated learning note explaining what changed and why it matters before the native desktop and macOS phase begins.

**Files changed**
~ modified: `learnings/planning.md`
~ modified: `learnings/plans/phase-7-plan.md`
+ created: `learnings/phase-7-api-sync-cache-deeplearn.md`
~ modified: `learnings/steps.md`

**Verification**
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
*Next: Step 41 starts Phase 8 by abstracting native shell IPC contracts from the extracted desktop shell logic.*

---
## Step 41 - Phase 8 Native Shell Bridge Baseline
*Completed: 2026-04-26*

**What was built**
- `apps/desktop/src/desktopShellBridge.js` - adds a local desktop shell bridge with Motion-shaped sendable and receivable channel catalogs, local `on/send/emit` behavior, and payload builders for tabs, agenda, navigation, and app-bar settings.
- `apps/desktop/src/main.tsx` - routes the current shell through the bridge, syncs tab and agenda state out to the native shell contract, and handles incoming desktop-style actions for tab selection, search focus, open-task, open-event, complete-task, and new-task flows.
- `scripts/test.mjs` - adds deterministic coverage for channel families, bridge payload shaping, and local bridge event dispatch.

**In plain English**
The app now has a real desktop shell seam instead of letting `main.tsx` own every tab, agenda, and app-bar interaction directly. Tabs and agenda state can be pushed through a Motion-like bridge contract, and desktop-style shell events like "select this tab", "search", or "complete this task" now have one place to enter the app.

**Files changed**
+ created: `apps/desktop/src/desktopShellBridge.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/desktopShellBridge.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
*Next: Step 42 brings tab, app-bar, search, and quick-action behavior closer to the extracted native shell surfaces.*

---
## Step 42 - Phase 8 Desktop Action Surface Alignment
*Completed: 2026-04-26*

**What was built**
- `apps/desktop/src/shellService.js` - adds native-shell-style tab helpers for creating view tabs, moving tabs, removing closable tabs, and navigating between tabs.
- `apps/desktop/src/desktopShellBridge.js` - expands the bridge snapshot with tab-navigation hints, conference settings, and quick-meeting payload normalization so the app-bar contract looks closer to the extracted shell.
- `apps/desktop/src/main.tsx` - wires header quick actions, tab add/close behavior, keyboard shortcuts, quick-meeting creation, and more shell event handlers through the desktop bridge.
- `scripts/test.mjs` - adds deterministic coverage for new tab behaviors and the richer bridge payloads.

**In plain English**
The desktop shell now behaves more like a real app shell instead of just displaying shell-shaped panels. You can open additional view tabs, close and reorder them, trigger search and new-task actions from buttons or shortcuts, and create a quick meeting that lands in the calendar overlay through the same shell contract. That makes the app feel much closer to Motion’s desktop surfaces instead of just looking like them.

**Files changed**
~ modified: `apps/desktop/src/shellService.js`
~ modified: `apps/desktop/src/desktopShellBridge.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/desktopShellBridge.js`
- `node --check apps/desktop/src/shellService.js`
- `node --check scripts/test.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
*Next: Step 43 starts the macOS-specific shell polish pass without changing product behavior.*

---
## Step 43 - Phase 8 MacOS Shell Polish
*Completed: 2026-04-26*

**What was built**
- `apps/desktop/src/desktopPlatform.js` - adds a macOS-first platform profile for shortcut intent, menu behavior, window chrome expectations, and option-space semantics.
- `apps/desktop/src/main.tsx` - applies Mac-specific shell polish by using the platform profile for key hints, traffic-light chrome, product-level shortcuts, and option-space quick-add behavior.
- `apps/desktop/src-tauri/tauri.conf.json` - updates the native window config toward hidden-title and overlay title-bar behavior for the macOS target.
- manual macOS validation checklist merged into `learnings/phase-8-native-desktop-mac-hardening-deeplearn.md`.
- `scripts/test.mjs` - adds regression coverage for the macOS profile and shortcut matching.

**In plain English**
The app now has a real macOS personality instead of only a generic desktop shell. It shows Mac-style traffic lights, prefers Mac-native shortcut labels and intent, routes quick-add through an option-space-style flow, and records the native window assumptions that need to be verified on a real Mac session. The product behavior stays the same, but the shell now fits the actual target platform much better.

**Files changed**
+ created: `apps/desktop/src/desktopPlatform.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `apps/desktop/src-tauri/tauri.conf.json`
+ merged into: `learnings/phase-8-native-desktop-mac-hardening-deeplearn.md`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/desktopPlatform.js`
- `Get-Content apps/desktop/src-tauri/tauri.conf.json | ConvertFrom-Json | Out-Null`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`

---
*Next: Step 44 implements the hardening pass over the desktop bridge and release assumptions.*

---
## Step 44 - Phase 8 Shell Hardening and Release Assumptions
*Completed: 2026-04-26*

**What was built**
- `apps/desktop/src/desktopShellBridge.js` - hardens the shell bridge with explicit send/receive allowlists, a reduced sync channel catalog, security-event tracking, and blocked unsupported channel usage.
- `apps/desktop/src/identityDefaults.js` - centralizes synthetic default identity values so shipped defaults no longer embed signed-in research account data.
- `apps/desktop/src/fixtures.js`, `apps/desktop/src/main.tsx`, `apps/desktop/src/projectService.js`, `apps/desktop/src/shellService.js`, `apps/desktop/src/state.js`, and `apps/desktop/src/storage.js` - replace real-user fallback values with synthetic placeholders and route shell/default identity behavior through the shared defaults.
- `apps/desktop/src-tauri/src/main.rs` - keeps the native command surface typed and minimal by validating the placeholder `ping` payload instead of accepting arbitrary strings.
- `docs/contracts/desktop-shell-hardening-contract.md`, `docs/contracts/release-security-contract.md`, and `docs/release-checklist.md` - document the shell bridge, permissions, entitlement, signing, update-chain, and release-data hygiene assumptions.
- `scripts/test.mjs` - adds regression coverage for blocked unsupported bridge channels, the reduced sync channel surface, and scrubbed fallback conference identity defaults.

**In plain English**
This step turns the desktop shell into a stricter release-shaped surface instead of a friendly dev-only bridge. Unsupported IPC-style channels are now rejected, shell snapshot sync is limited to a smaller approved set, and the repo no longer ships your real signed-in identity as default fixture data. The release docs also now say explicitly how permissions, entitlements, signing, and updates are supposed to work.

**Files changed**
+ created: `apps/desktop/src/identityDefaults.js`
+ created: `docs/contracts/desktop-shell-hardening-contract.md`
~ modified: `apps/desktop/src/desktopShellBridge.js`
~ modified: `apps/desktop/src/fixtures.js`
~ modified: `apps/desktop/src/main.tsx`
~ modified: `apps/desktop/src/projectService.js`
~ modified: `apps/desktop/src/shellService.js`
~ modified: `apps/desktop/src/state.js`
~ modified: `apps/desktop/src/storage.js`
~ modified: `apps/desktop/src-tauri/src/main.rs`
~ modified: `docs/contracts/release-security-contract.md`
~ modified: `docs/release-checklist.md`
~ modified: `scripts/test.mjs`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/src/desktopShellBridge.js`
- `node --check apps/desktop/src/identityDefaults.js`
- `node --check apps/desktop/src/fixtures.js`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`
- `cargo check` could not be run because the Rust toolchain is not installed on this machine.

---
*Next: Step 45 closes Phase 8 with the verification gate and final deep-learn write-up.*

---
## Step 45 - Phase 8 Verification and Deep Learn Closeout
*Completed: 2026-04-27*

**What was built**
- `learnings/planning.md` - marks Phase 8 complete, closes the current parity roadmap, and records that the next stage should start from a fresh plan.
- `learnings/plans/phase-8-plan.md` - records the Phase 8 closure state, verification status, and the remaining native limitation around missing Rust toolchain verification on this machine.
- `learnings/phase-8-native-desktop-mac-hardening-deeplearn.md` - captures the Phase 8 learning write-up covering the desktop shell bridge, macOS platform profile, hardening pass, and release assumptions.
- `learnings/steps.md` - logs Step 45 and closes the current phase handoff.

**In plain English**
Phase 8 is properly closed now instead of just being the last native-shell work we touched. The full verification gate passed again, the roadmap now treats native desktop, Mac fit, and hardening as completed work, and the repo has a final learning doc explaining how the desktop shell, platform behavior, and release safety pieces fit together. The only remaining gap is outside the current JavaScript lane: a real Rust-enabled native build check still needs a machine with the Rust toolchain.

**Files changed**
~ modified: `learnings/planning.md`
~ modified: `learnings/plans/phase-8-plan.md`
+ created: `learnings/phase-8-native-desktop-mac-hardening-deeplearn.md`
~ modified: `learnings/steps.md`

**Verification**
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`
- `cargo check` still could not run because the Rust toolchain is not installed on this machine.

---
*Next: the current reverse-engineered parity roadmap is complete. Start a fresh `/plan` for shipping work, backend integration, or a new recon-driven parity pass.*

---
## Step 46 - Phase 9 Real Desktop Build Baseline
*Completed: 2026-04-27*

**What was built**
- `apps/desktop/scripts/build.mjs` - replaces the placeholder desktop build with a real TypeScript emit step that writes a runnable `apps/desktop/dist/` bundle and build manifest.
- `apps/desktop/tsconfig.build.json` - adds a dedicated desktop build config so the existing source tree can emit browser-runnable files without changing the root typecheck setup.
- `apps/desktop/src-tauri/tauri.conf.json` - points Tauri production builds at `../dist` and wires `beforeBuildCommand` to the real desktop frontend build.
- `learnings/plans/phase-9-plan.md` - defines the new packaging and release phase after the parity roadmap.
- `learnings/planning.md` - marks Phase 9 as the current active shipping-oriented phase.

**In plain English**
The desktop app finally has a real frontend build output instead of a fake placeholder script. There is now an actual `apps/desktop/dist/` folder with emitted app files and a rewritten `index.html`, which means Tauri can target built frontend artifacts instead of raw source files. This does not produce the final Mac app yet, but it creates the first real step from source code toward a packageable desktop build.

**Files changed**
~ modified: `apps/desktop/scripts/build.mjs`
+ created: `apps/desktop/tsconfig.build.json`
~ modified: `apps/desktop/src-tauri/tauri.conf.json`
+ created: `learnings/plans/phase-9-plan.md`
~ modified: `learnings/planning.md`
~ modified: `learnings/steps.md`

**Verification**
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run desktop:build`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `Get-Content C:\Users\Pumba\Documents\codex\rabbit\apps\desktop\src-tauri\tauri.conf.json | ConvertFrom-Json | Out-Null`
- Verified `apps/desktop/dist/index.html`, `apps/desktop/dist/main.js`, and `apps/desktop/dist/desktop-build-manifest.json` were emitted.

---
*Next: Step 47 adds the native build entrypoints and preflight checks so this frontend bundle can plug into a real Tauri packaging flow.*

---
## Step 47 - Phase 9 Native Build Entry Points and Preflight Checks
*Completed: 2026-04-27*

**What was built**
- `apps/desktop/src-tauri/build.rs` and `apps/desktop/src-tauri/Cargo.toml` - add the missing Tauri Rust build bootstrap so the native desktop package has a real build entrypoint instead of only a config file.
- `apps/desktop/scripts/native-preflight.mjs` - adds a readable preflight command that checks desktop bundle files, Tauri bootstrap files, and native tool availability before packaging.
- `apps/desktop/scripts/native-build.mjs` - adds the native packaging entrypoint that rebuilds the frontend bundle, runs preflight, and then calls `cargo-tauri build`, with a `--dry-run` path for planning and CI wiring.
- `apps/desktop/package.json` and root `package.json` - expose native preflight and native build commands from both the desktop package and the repo root.
- `README.md` - documents the new build, preflight, and dry-run commands and explains that real Mac packaging still needs Rust and a macOS machine or CI lane.

**In plain English**
The repo now has a real native packaging path instead of only a frontend bundle and a Tauri folder sitting beside it. You can ask the project what is missing before packaging, and it will tell you clearly that Rust and Tauri tooling are not installed yet. You can also run a dry-run native build command that proves the packaging flow is wired correctly without pretending this Windows machine can already produce the final Mac app.

**Files changed**
+ created: `apps/desktop/src-tauri/build.rs`
~ modified: `apps/desktop/src-tauri/Cargo.toml`
+ created: `apps/desktop/scripts/native-preflight.mjs`
+ created: `apps/desktop/scripts/native-build.mjs`
~ modified: `apps/desktop/package.json`
~ modified: `package.json`
~ modified: `README.md`
~ modified: `learnings/steps.md`

**Verification**
- `node --check apps/desktop/scripts/native-preflight.mjs`
- `node --check apps/desktop/scripts/native-build.mjs`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run desktop:native:preflight`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run desktop:native:build -- --dry-run`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- Verified the preflight now reports:
  - desktop bundle files are present,
  - Tauri bootstrap files are present,
  - `rustc`, `cargo`, and `cargo-tauri` are not yet installed on this machine,
  - final `.app` / `.dmg` packaging still requires a macOS host or CI runner.

---
*Next: Step 48 adds the Mac packaging lane scaffolding in CI and release docs.*

---
## Step 48 - Phase 9 Mac Packaging Lane Scaffolding
*Completed: 2026-04-27*

**What was built**
- `.github/workflows/mac-packaging-lane.yml` - adds a dedicated Mac CI lane with a real verification job and a placeholder packaging job that fails intentionally instead of pretending signing is finished.
- `docs/mac-packaging-lane.md` - documents what the Mac lane does today, what it still does not do, and which signing/notarization secrets and steps are still placeholders.
- `docs/release-checklist.md` - adds explicit checklist items for the Mac lane workflow and placeholder signing credentials.
- `docs/contracts/platform-segmentation.md` - records the new Mac workflow as part of the Mac-only build lane and makes placeholder package failures an explicit rule instead of an accident.
- `README.md` - points the packaging status section at the new Mac lane scaffold.

**In plain English**
The repo now has a real Mac CI lane shape, even though it still does not produce the final signed Mac app yet. There is a workflow that shows how a Mac runner should verify the packaging path, and there is a separate placeholder package job that fails on purpose so nobody mistakes scaffolding for a finished release process. The docs now all say the same thing about what the Mac lane does and what still needs to be wired later.

**Files changed**
+ created: `.github/workflows/mac-packaging-lane.yml`
+ created: `docs/mac-packaging-lane.md`
~ modified: `docs/release-checklist.md`
~ modified: `docs/contracts/platform-segmentation.md`
~ modified: `README.md`
~ modified: `learnings/steps.md`

**Verification**
- `Select-String` confirmed the workflow contains:
  - `verify-mac-lane`
  - `package-macos-placeholder`
  - `cargo install tauri-cli --locked`
  - `npm run desktop:native:preflight -- --strict --target=macos`
  - `npm run desktop:native:build -- --dry-run --target=macos`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run desktop:native:preflight -- --target=macos`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run desktop:native:build -- --dry-run --target=macos`
- Verified the docs now state clearly that:
  - Mac verification is real,
  - final signing/notarization is still placeholder-only,
  - `.app` / `.dmg` packaging still needs a Mac host or CI runner plus real Apple credentials.

---
*Next: Step 49 adds the packaging smoke-check docs and manifests so local and CI verification use the same release gate.*

---
## Step 49 - Phase 9 Packaging Smoke-Check Docs and Manifests
*Completed: 2026-04-27*

**What was built**
- `ops/phase-9-packaging-smoke-check.json` - records the actual local Windows smoke check, the Mac CI verification lane, the shippable-artifact proof requirements, and the known current limitations.
- `ops/packaging-smoke-check.md` - turns the packaging proof into a readable runbook so local and CI verification talk about the same evidence.
- `ops/commands.md` - now points directly at the packaging smoke-check commands and proof files.
- `docs/release-checklist.md` - adds explicit release-gate checks that the packaging smoke-check manifest and runbook still match reality.
- `README.md` - points the packaging status section at the new smoke-check contract files.

**In plain English**
The repo now has one clear answer to "what do we have to prove before calling this desktop artifact believable?" The answer is no longer spread across the README, workflow file, and release checklist. There is now a packaging smoke-check manifest plus a readable runbook that say exactly what the local Windows dry-run proves, what the Mac CI lane proves, and what still must not be claimed until real signing and notarization exist.

**Files changed**
+ modified: `.gitignore`
+ created: `ops/phase-9-packaging-smoke-check.json`
+ created: `ops/packaging-smoke-check.md`
~ modified: `ops/commands.md`
~ modified: `docs/release-checklist.md`
~ modified: `README.md`
~ modified: `learnings/steps.md`

**Verification**
- `Get-Content ops/phase-9-packaging-smoke-check.json | ConvertFrom-Json | Out-Null`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run desktop:native:preflight -- --target=macos`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run desktop:native:build -- --dry-run --target=macos`
- Verified the smoke-check files and release checklist now agree that:
  - local Windows only proves bundle + dry-run path correctness,
  - Mac CI proves toolchain + verification-lane readiness,
  - shippable `.app` / `.dmg` output still depends on real signing and notarization wiring.

---
*Next: Step 50 runs the Phase 9 verification gate and closes the packaging-and-release phase.*

---
## Step 50 - Phase 9 Verification and Deep Learn Closeout
*Completed: 2026-04-28*

**What was built**
- `learnings/planning.md` - marks Phase 9 complete, adds the new Phase 9 learning reference, and closes the current packaging-oriented roadmap pass.
- `learnings/plans/phase-9-plan.md` - records the Phase 9 closure state, verification outcome, and the remaining native packaging limitation.
- `learnings/phase-9-packaging-native-build-release-deeplearn.md` - captures the Phase 9 learning write-up covering the desktop bundle path, native preflight, Mac CI lane, smoke-check contract, and release-boundary truthfulness.
- `learnings/steps.md` - logs Step 50 and closes the Phase 9 handoff.

**In plain English**
Phase 9 is closed properly now instead of just ending with a few build scripts and release notes. The repo has a verified packaging path, a clear explanation of what that path proves, and a learning document that explains the difference between "the package lane is real" and "the final Mac app is already shipping." Just as important, the docs now say clearly that final native packaging still needs Rust tooling and a real Mac release environment.

**Files changed**
~ modified: `learnings/planning.md`
~ modified: `learnings/plans/phase-9-plan.md`
+ created: `learnings/phase-9-packaging-native-build-release-deeplearn.md`
~ modified: `learnings/steps.md`

**Verification**
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run desktop:build`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run typecheck`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run desktop:native:preflight -- --target=macos`
- Verified the remaining limitation is still documented truthfully:
  - `rustc`, `cargo`, and `cargo-tauri` are not installed on this machine,
  - final signed and notarized `.app` / `.dmg` output still requires a Rust-enabled Mac host or CI runner plus real Apple credentials.

---
*Next: No active implementation step. Start a new `/plan` for live backend integration, real Mac packaging/signing execution, or a new parity/recon pass.*

---
## Maintenance - Rabbit Rebrand
*Completed: 2026-04-30*

**What was built**
- product/package metadata now identifies the app as Rabbit across the root package, desktop package, Tauri config, Cargo package, and desktop HTML title
- local persistence now writes Rabbit storage keys while still reading the legacy Motion-clone keys for app data, device ids, and entitlement snapshots
- the seeded tutorial/workspace/inbox copy now presents Rabbit-branded demo content instead of Motion-branded placeholders
- repo-facing docs now describe the product as Rabbit while still preserving Motion references where they document the reverse-engineering target
- `learnings/rabbit-rebrand-deeplearn.md` records the reasoning behind the rebrand and the persistence-compatibility approach

**In plain English**
This was a real rebrand, not just a folder rename. The app now builds, stores data, and presents itself as Rabbit, and it does that without abandoning existing local data that may still live under the earlier Motion-clone storage keys. The docs also stop pretending the product name is still Motion Clone while keeping the research record honest about Motion being the product that Rabbit was derived from.

**Verification**
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run lint`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`

---
## Maintenance - Live Backend Runtime
*Completed: 2026-05-03*

**What was built**
- `apps/desktop/src/backendClient.js` - adds the live backend runtime for request execution, remote-state hydration, PowerSync upload, and synthesized backend entitlement refresh
- `apps/desktop/src/contracts.js` - persists backend and inbox state in the desktop snapshot and advances the schema to carry that new runtime data safely
- `apps/desktop/src/storage.js` - records backend and inbox metadata alongside the persisted app state
- `apps/desktop/src/main.tsx` - adds backend URL/token controls, connect/refresh/push actions, and live backend authority refresh routing in the desktop shell
- `scripts/test.mjs` - adds backend transport, upload, hydration, and persistence regression coverage
- `learnings/live-backend-integration-deeplearn.md` - documents the architecture, merge rules, and remaining real-server validation work

**In plain English**
Rabbit is no longer only a local desktop shell with backend-shaped code lying underneath it. The app can now be pointed at a real backend, use the existing request contracts to fetch live data into the shell, push queued local task changes through the PowerSync-style upload lane, and refresh entitlements from live permission data instead of only mock scenarios. It still stays local-first, which means partial backend failures do not wipe the user's local work or pending outbox changes.

**Verification**
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run lint`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run build`
- `npm.cmd --prefix C:\Users\Pumba\Documents\codex\rabbit run test`

---
## Maintenance - Windows Product Polish and Completion
*Completed: 2026-05-05*

**What was built**
- `apps/desktop/src/main.tsx` - removes prototype-facing shell copy, hides diagnostics from the customer surface by default, simplifies the sync/status experience, tightens the shell hierarchy, and reduces clutter across the task, agenda, inbox, and composer surfaces.
- `apps/desktop/src/state.js` and `apps/desktop/src/shellService.js` - shorten inbox and saved-view empty states so the app sounds calmer when there is nothing to show.
- `learnings/rabbit-windows-polish-finish-line.md` - defines what counts as done for this Windows polish pass and explicitly defers the Mac/release/backend-expansion work that should not keep the phase open.
- `learnings/phase-10-windows-product-polish-deeplearn.md` - captures the deeper reasoning behind the polish pass, the Motion-facing subtraction decisions, the live QA loop, and the phase boundary.

**In plain English**
Rabbit already worked before this pass, but it still looked and talked too much like an internal build. This phase made the product calmer: less scaffolding language, less diagnostic noise, denser content surfaces, and better empty/loading/error states. Just as important, it did not stop at visual cleanup. The app was run through a live create, push, refresh, complete, and delete flow against the local backend so the product finish would be backed by a real task loop and not only by CSS-level confidence.

**Verification**
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run test`
- `npm.cmd run desktop:build`
- live Windows preview served at `http://127.0.0.1:4173`
- live local backend served at `http://127.0.0.1:8787`
- verified:
  - task create
  - outbox push
  - remote refresh
  - task complete
  - task delete
  - inbox and agenda summaries after those actions

---
*Next: Start a new `/plan` for Mac/Tauri desktop validation, production backend hardening, or deeper product-surface expansion. The Windows polish pass is now closed.*
