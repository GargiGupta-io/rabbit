# Plan: Phase 1 - Product Kernel

## Goal
Build the first usable Motion-style product kernel before advanced scheduling, AI, and security hardening.

## Current state at Phase 1 start
- Phase 0 foundation, docs, CI, and desktop shell placeholder were complete.
- The repo structure, release/security contracts, and baseline lint/build checks already existed.
- The next priority was to turn the shell into a usable local task app.

## Scope
Phase 1 was intentionally limited to the MVP kernel:
- task CRUD and validation
- today/upcoming/overdue summaries
- search and status filtering
- recurrence metadata storage
- basic conflict detection
- local persistence
- entitlement baseline for future premium/calendar/AI gates

## Phase 1 implementation lock (2026-04-15)

### Feature matrix
- Task CRUD with validation (title required, duplicate prevention within project)
- Today/upcoming/overdue summary
- Search + status filters
- Recurrence metadata (`none`, `daily`, `weekly`) stored per task
- Basic conflict detection using time overlap windows
- Entitlement snapshot and feature-gate checks for AI/calendar

### Implementation completed
- Added executable task domain model in `apps/desktop/src/state.js`
- Added local persistence in `apps/desktop/src/storage.js`
- Added entitlement baseline in `apps/desktop/src/entitlement.js`
- Replaced placeholder shell with MVP task UI in `apps/desktop/src/main.tsx` and `apps/desktop/index.html`
- Added baseline checks in `scripts/lint.mjs`, `scripts/build.mjs`, and `scripts/test.mjs`
- Updated `.gitignore` for phase manifests

Decision:
Keep this shell intentionally minimal. Full service split, stronger contracts, scheduling primitives, and hardening move to Phase 2.

## Phase 1 execution evidence

### Step 6 - Phase 1 Product Kernel
*Completed: 2026-04-15*

**What was built**
- Implemented MVP domain model for tasks, recurrence, summary counters, search/filter, and conflict detection in `apps/desktop/src/state.js`.
- Added local persistence contract in `apps/desktop/src/storage.js`.
- Added entitlement baseline and route/feature gates in `apps/desktop/src/entitlement.js`.
- Replaced desktop shell UI with first-use task workflows in `apps/desktop/src/main.tsx` and updated `apps/desktop/index.html`.
- Added functional lint/build/test checks for new app kernel contracts.

**In plain English**
You now have a real usable app surface: create/search/filter tasks, see today/upcoming/overdue, and mark complete/delete. Data is stored locally and feature boundaries are in place for later hardening.

## Phase 1 completion checklist
- Task CRUD and validation baseline exists in `apps/desktop/src/state.js`.
- Search/filter/summaries are implemented and testable.
- Local persistence exists in `apps/desktop/src/storage.js`.
- Entitlement baseline exists in `apps/desktop/src/entitlement.js`.
- MVP shell exists in `apps/desktop/src/main.tsx` and `apps/desktop/index.html`.
- Baseline lint/build/test scripts exist and were part of the phase lock.

## References
- `learnings/plans/phase-0-plan.md` - Phase 0 foundation and acceptance gate
- `learnings/planning.md` - overall roadmap and phase summary
- `learnings/plans/phase-2-plan.md` - post-Phase-1 architecture, hardening, and scheduling work
- `learnings/steps.md` - chronological execution log across phases
