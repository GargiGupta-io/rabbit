# Plan: Phase 2 — Architecture and Security Model

## Goal
Turn the working shell into a real product kernel with a typed data model, scheduling engine foundation, and enforceable client-server trust boundaries.

## Current state
You already have:
- A runnable desktop shell in `apps/desktop/src/main.tsx`.
- Task/project persistence and basic domain logic in `apps/desktop/src/state.js` and `apps/desktop/src/storage.js`.
- A feature gate baseline in `apps/desktop/src/entitlement.js`.
- CI/lint/build/test checks in place.

This phase keeps the product usable while making the architecture scalable for sync, AI workflows, calendar features, and anti-clone hardening.

## Approach
I will keep you moving in tiny production-sized slices:
- finish a typed, versioned domain contract first,
- refactor core kernel behavior out of UI code next,
- then add a scheduling engine slice that gives you real day planning behavior.

Each step stays independent so we can test and commit after each milestone.

## Phase 1 — Data contracts and migration baseline (~40m)

1. Add phase-2 contract checks for stored data shape and versioning.
   - Add `apps/desktop/src/contracts.js` with explicit schema objects and helper validators.
   - Add migration marker fields in the local persisted payload.
   - Update `scripts/test.mjs` to cover schema validation and version migration cases.
   - Touch: `apps/desktop/src/contracts.js`, `apps/desktop/src/storage.js`, `scripts/test.mjs`.

2. Add a deterministic seeded task fixture set for deterministic testing.
   - `apps/desktop/src/fixtures.js` with repeatable sample projects/tasks/status flows.
   - Update tests to validate summary and conflict outputs against known fixtures.
   - Touch: `apps/desktop/src/fixtures.js`, `scripts/test.mjs`.

## Phase 2 — Kernel layer split (~60m)

3. Split state operations into small command-style services:
   - `apps/desktop/src/state.js` becomes thin orchestration only.
   - Add `apps/desktop/src/taskService.js` for task CRUD + recurrence normalization.
   - Add `apps/desktop/src/projectService.js` for workspace/project defaults and ordering.
   - Touch: `apps/desktop/src/state.js`, `apps/desktop/src/taskService.js`, `apps/desktop/src/projectService.js`, `apps/desktop/src/main.tsx`.

4. Expand persistence to support revision + metadata fields:
   - add version + sync metadata fields to stored records,
   - add safe read/write with upgrade guard so old payloads are restored without losing tasks.
   - Touch: `apps/desktop/src/storage.js`.

## Phase 3 — Scheduling engine foundation (~90m)

5. Add planning grid primitives:
   - `apps/desktop/src/scheduler.js` for time-window expansion and conflict scoring.
   - Add one canonical function for upcoming/today windows and overlap ranking.
   - Touch: `apps/desktop/src/scheduler.js`, `apps/desktop/src/main.tsx`, `scripts/test.mjs`.

6. Add first production-facing UI slice:
- Day planning list uses scheduling primitives instead of direct state helpers.
- Add focused filter states for `today`, `week`, `overdue`.
- Touch: `apps/desktop/src/main.tsx`.

## Phase 4 — Security and entitlement hardening baseline (~60m)

7. Split entitlement from UI and add server-authority contract shape.
   - `apps/desktop/src/entitlement.js` updated to read and validate a signed-ish session snapshot.
   - Add `apps/desktop/src/entitlement.test` checks (inline in script test harness for now).
   - Define hard-fail behavior in UI when entitlement payload is missing/expired.
   - Touch: `apps/desktop/src/entitlement.js`, `scripts/test.mjs`, `apps/desktop/src/main.tsx`.

8. Add runtime guardrails:
   - add startup checks for required persisted schema version, entitlement freshness, and unknown task action types.
   - add safe fallback behavior with clear error messages.
   - Touch: `apps/desktop/src/main.tsx`, `apps/desktop/src/storage.js`, `apps/desktop/src/entitlement.js`.

## Files

Modify:
- `apps/desktop/src/main.tsx`
- `apps/desktop/src/state.js`
- `apps/desktop/src/storage.js`
- `apps/desktop/src/entitlement.js`
- `scripts/lint.mjs`
- `scripts/test.mjs`
- `scripts/build.mjs`

Create:
- `apps/desktop/src/contracts.js`
- `apps/desktop/src/fixtures.js`
- `apps/desktop/src/taskService.js`
- `apps/desktop/src/projectService.js`
- `apps/desktop/src/scheduler.js`

## Edge cases

- Payload from older versions contains missing fields: fill defaults and do not throw.
- Duplicate tasks with same title in same project across time zones: use canonical ISO date keys for checks.
- Recurrence edge when duration exceeds available window: block action with actionable message, do not silently drop.
- Entitlement payload tampering: revoke premium features, keep read-only local shell working.

## Risks

- Overbuilding scheduler too early can break existing working flow.
  - Mitigation: keep overlap logic additive and feature-gated.
- TS strictness errors from DOM interactions while refactoring.
  - Mitigation: keep UI types narrow and add casts only where needed.
- Incomplete entitlement logic might feel “half secure”.
  - Mitigation: keep strict client behavior now; server verification will be added in Phase 3+ stack.

## Done when

- Existing Phase 1 behavior stays intact (create/search/filter/complete/delete still works).
- Core domain logic is split into at least one dedicated service file.
- A scheduling slice exists that computes overlap-aware task windows.
- Entitlement/contract errors no longer crash startup and show clear user-facing error.
- `npm run lint`, `npm run build`, and `npm run test` still pass.

## Step-by-step execution order

1. Contract + storage migration guardrails.
2. Contract test coverage.
3. Service split: task/project service extraction.
4. State orchestration cleanup in `main.tsx` + existing shell.
5. Scheduling primitives and tests.
6. Scheduling UI wiring.
7. Entitlement hardening contract.
8. Runtime startup guards.
