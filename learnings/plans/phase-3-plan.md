# Plan: Phase 3 - Sync and Calendar Baseline

## Goal
Turn the local-only planning shell into a sync-ready product slice with a revision-aware outbox, calendar busy-block ingestion, and a refreshable server-authority entitlement path.

## Current state at Phase 3 start
You already have:
- A runnable desktop shell in `apps/desktop/src/main.tsx`.
- Versioned persistence and migration guards in `apps/desktop/src/contracts.js` and `apps/desktop/src/storage.js`.
- Service-layer task/project orchestration in `apps/desktop/src/taskService.js`, `apps/desktop/src/projectService.js`, and `apps/desktop/src/state.js`.
- Scheduling primitives in `apps/desktop/src/scheduler.js`.
- Runtime entitlement guards in `apps/desktop/src/entitlement.js`.

The app is still intentionally local-first:
- no persisted sync outbox,
- no calendar event model,
- no remote entitlement refresh contract,
- no reconciliation shape for multi-device changes.

## Scope
Phase 3 is intentionally limited to baseline integration primitives:
- revision-aware mutation log for task changes,
- sync payload contract and local outbox model,
- calendar read ingestion model with busy-block overlays,
- server-authority entitlement refresh contract,
- explicit sync and degraded-state UX,
- deterministic tests for sync, calendar, and entitlement refresh flows.

Deferred to Phase 4:
- bi-directional live sync,
- real calendar OAuth flow,
- push or websocket updates,
- AI scheduling actions,
- team workspaces and sharing.

## Approach
I will keep this phase in narrow vertical slices:
- make local task mutations representable as sync events first,
- let scheduling see imported calendar busy time next,
- then refresh entitlement from a server-authority contract without breaking offline behavior.

Each step stays independently testable so the app remains usable while the product model grows.

## Phase 1 - Sync foundation (~55m)

15. Add a sync contract and outbox baseline.
   - Add `apps/desktop/src/syncContract.js` for sync event shape, outbox normalization, and device/session metadata.
   - Extend persisted payload handling to keep `outbox`, `lastSyncAt`, `syncCursor`, `deviceId`, and `syncStatus`.
   - Make task mutation helpers emit normalized sync events for add, update, complete, and delete actions.
   - Touch: `apps/desktop/src/syncContract.js`, `apps/desktop/src/storage.js`, `apps/desktop/src/taskService.js`, `apps/desktop/src/state.js`, `scripts/test.mjs`.

16. Wire sync queue status into runtime state and UI.
   - Update app orchestration so task actions append normalized outbox events.
   - Add a lightweight sync status panel in `main.tsx` with pending count, last sync time, and degraded/offline state.
   - Keep local-only behavior explicit when outbox work has not been synced yet.
   - Touch: `apps/desktop/src/main.tsx`, `apps/desktop/src/state.js`, `apps/desktop/src/storage.js`.

## Phase 2 - Calendar occupancy baseline (~70m)

17. Add calendar event contracts and busy-block ingestion.
   - Add `apps/desktop/src/calendarService.js` for normalized calendar event shape.
   - Add deterministic calendar fixtures and tests.
   - Persist `calendarOverlay` snapshots with source metadata, refresh time, and read-permission state.
   - Touch: `apps/desktop/src/calendarService.js`, `apps/desktop/src/contracts.js`, `apps/desktop/src/fixtures.js`, `apps/desktop/src/storage.js`, `scripts/test.mjs`.

18. Extend scheduler output with calendar overlays.
   - Update `scheduler.js` to merge task intervals with imported calendar busy blocks.
   - Add `busyBlocks`, `blockedTaskIds`, and `availableMinutes` to planning output.
   - Keep existing task overlap logic intact while layering calendar conflicts on top.
   - Touch: `apps/desktop/src/scheduler.js`, `apps/desktop/src/main.tsx`, `scripts/test.mjs`.

## Phase 3 - Authority refresh baseline (~45m)

19. Add a refreshable entitlement authority client.
   - Add `apps/desktop/src/entitlementClient.js` for authority refresh normalization and mock transport shape.
   - Update `entitlement.js` to distinguish cached, fresh, stale, offline, and revoked states.
   - Add deterministic mock responses so tests and UI can validate refresh behavior without a backend dependency.
   - Touch: `apps/desktop/src/entitlementClient.js`, `apps/desktop/src/entitlement.js`, `apps/desktop/src/main.tsx`, `scripts/test.mjs`.

## Phase 4 - Acceptance pass (~20m)

20. Run the Phase 3 verification gate.
   - Run `npm run lint`.
   - Run `npm run build`.
   - Run `npm run test`.
   - Verify sync events persist, calendar overlays affect scheduling deterministically, and entitlement refresh degrades safely when offline or revoked.

## Files

Modify:
- `apps/desktop/src/main.tsx`
- `apps/desktop/src/contracts.js`
- `apps/desktop/src/fixtures.js`
- `apps/desktop/src/scheduler.js`
- `apps/desktop/src/state.js`
- `apps/desktop/src/storage.js`
- `apps/desktop/src/taskService.js`
- `apps/desktop/src/entitlement.js`
- `scripts/test.mjs`

Create:
- `apps/desktop/src/syncContract.js`
- `apps/desktop/src/calendarService.js`
- `apps/desktop/src/entitlementClient.js`

## Edge cases

- Duplicate sync events after reload: normalize by event id and revision, and do not enqueue duplicates.
- Calendar events with invalid times or all-day ranges: normalize or drop them without breaking planner output.
- Entitlement refresh unavailable while offline: keep the last known safe snapshot, mark refresh stale, and do not silently grant new premium access.
- Remote revocation arrives while local outbox has pending writes: preserve local data, block premium mutations, and surface explicit read-only messaging.

## Risks

- Over-modeling sync before transport exists can slow delivery.
  - Mitigation: keep transport mocked and the contract narrow; focus on outbox/event correctness only.
- Calendar overlays can make scheduling logic noisy.
  - Mitigation: keep task overlap and calendar overlap reported separately.
- Entitlement refresh can create confusing UX if state flips abruptly.
  - Mitigation: expose freshness and reason text, and degrade safely instead of hiding status.

## Done when

- Local task mutations can be expressed as persisted sync events.
- The scheduler can account for imported busy calendar intervals.
- Entitlement state can be refreshed through a normalized authority client contract.
- Offline and revoked modes are explicit in UI instead of implicit behavior.
- `npm run lint`, `npm run build`, and `npm run test` pass with deterministic coverage for the new contract paths.

## Step-by-step execution order

1. Sync contract and persisted outbox baseline.
2. Sync queue runtime wiring and status UX.
3. Calendar event ingestion and fixture coverage.
4. Calendar-aware scheduler output.
5. Authority entitlement refresh contract.
6. Phase 3 acceptance verification.

## Phase 3 execution evidence

### Step 15 - Sync contract and outbox baseline
*Completed: 2026-04-21*

**What was built**
- Added `apps/desktop/src/syncContract.js` with normalized sync-event creation, outbox deduplication, and device/session metadata helpers.
- Updated `apps/desktop/src/taskService.js` so create/complete/delete mutations emit normalized sync events and task filters/summaries can run against a deterministic clock during tests.
- Updated `apps/desktop/src/storage.js` so persisted payloads now keep `outbox`, `lastSyncAt`, `syncCursor`, `deviceId`, and `syncStatus` while remaining backward-compatible with older storage payloads.
- Updated `apps/desktop/src/state.js` to export the new sync contract through the orchestration layer.
- Expanded `scripts/test.mjs` with sync-event emission, outbox dedupe, and persisted sync metadata coverage.

**In plain English**
The app now keeps a structured record of each task change instead of only storing the latest task list. That gives later sync work a reliable queue to send, and it means reloads can preserve not just tasks but also the pending work that still needs to leave the device. The test suite now proves those sync records are shaped consistently and stay deterministic over time.

**Verification**
- `npm.cmd run test` - passed.
- `npm.cmd run lint` - was blocked at the time by the pre-Step-20 doc-path mismatch.

### Step 16 - Sync queue wiring in UI and state
*Completed: 2026-04-21*

**What was built**
- Updated `apps/desktop/src/state.js` with `applyTaskMutation()` and `getSyncStateSummary()` so runtime code can append outbox events and derive sync health without duplicating queue logic in the UI.
- Updated `apps/desktop/src/storage.js` so `saveStoredData()` returns the normalized persisted snapshot, letting the app keep its runtime state aligned with the stored sync metadata.
- Updated `apps/desktop/src/main.tsx` to render a sync health panel with pending changes, last sync timestamp, cursor, and device metadata.
- Wired add/complete/delete flows in `main.tsx` so successful task mutations update `appData`, preserve the outbox, and persist the pending sync state immediately.
- Expanded `scripts/test.mjs` with runtime state helper coverage for pending outbox state and persisted sync status.

**In plain English**
The app now shows you when changes are still only on this device. After a task is added or changed, the local sync queue stays attached to the running app state, gets saved immediately, and shows a clear status panel instead of hiding that information in storage. That makes the app honest about what is local-only and what still needs a future sync path.

**Verification**
- `npm.cmd run test` - passed.
- `npm.cmd run typecheck` - passed.
- `npm.cmd run lint` - was blocked at the time by the pre-Step-20 doc-path mismatch.

### Step 17 - Calendar event contracts and busy-block ingestion
*Completed: 2026-04-21*

**What was built**
- Added `apps/desktop/src/calendarService.js` with normalized calendar event parsing, overlay snapshot normalization, permission-state handling, and busy-block extraction helpers.
- Updated `apps/desktop/src/contracts.js` so persisted payloads now include a normalized `calendarOverlay` snapshot and inject a safe empty overlay when older payloads do not have one.
- Updated `apps/desktop/src/fixtures.js` with deterministic calendar events and a fixture overlay snapshot that includes provider, account, calendar ids, refresh time, and permission metadata.
- Expanded `scripts/test.mjs` with coverage for all-day event normalization, invalid calendar row dropping, and calendar overlay persistence through the existing storage path.
- The existing storage normalization flow in `apps/desktop/src/storage.js` picked up `calendarOverlay` automatically once the contract layer started producing it, so no extra storage branching was required in this step.

**In plain English**
The app now knows what imported calendar data should look like before the scheduler uses it. Meetings, focus blocks, and all-day events can be normalized into one consistent shape, older saved payloads get a safe empty calendar snapshot automatically, and invalid calendar rows are dropped instead of poisoning future planning logic. That gives Step 18 a clean data contract to build on.

**Verification**
- `npm.cmd run test` - passed.
- `node --check apps/desktop/src/calendarService.js` - passed.
- `node --check apps/desktop/src/contracts.js` - passed.
- `npm.cmd run lint` - was blocked at the time by the pre-Step-20 doc-path mismatch.

### Step 18 - Calendar-aware scheduler output
*Completed: 2026-04-22*

**What was built**
- Updated `apps/desktop/src/scheduler.js` so planning windows now include imported calendar busy blocks, blocked task ids, and available minutes alongside the existing task overlap output.
- Kept task-to-task overlap logic intact while adding calendar occupancy as a separate planning layer, so the original conflict scoring still behaves the same.
- Updated `apps/desktop/src/main.tsx` to show calendar-aware planning summary cards and mark tasks that collide with imported busy blocks.
- Expanded `scripts/test.mjs` with deterministic assertions for busy block count, blocked task ids, available minutes, and calendar-aware plan slices.

**In plain English**
The planner no longer acts like the day is empty just because tasks exist locally. It now looks at imported busy calendar time, calculates how much planning time is actually left in the current horizon, and flags tasks that run into calendar occupancy while still preserving the existing task-on-task conflict behavior. That makes the planning view feel grounded in real time instead of a vacuum.

**Verification**
- `npm.cmd run test` - passed.
- `npm.cmd run typecheck` - passed.
- `node --check apps/desktop/src/scheduler.js` - passed.
- `npm.cmd run lint` - was blocked at the time by the pre-Step-20 doc-path mismatch.

### Step 19 - Authority entitlement refresh contract
*Completed: 2026-04-22*

**What was built**
- Added `apps/desktop/src/entitlementClient.js` with authority refresh normalization and deterministic mock transport scenarios for active, upgrade, revoked, and offline states.
- Updated `apps/desktop/src/entitlement.js` so stored entitlement snapshots now track authority freshness metadata and distinguish cached, fresh, stale, offline, and revoked states while preserving a safe offline fallback.
- Updated `apps/desktop/src/main.tsx` to render an entitlement authority panel with refresh state, last success and last attempt timestamps, mock refresh controls, and explicit read-only messaging when access is revoked.
- Expanded `scripts/test.mjs` with deterministic authority refresh coverage for malformed responses, stale freshness windows, upgrade refreshes, offline fallback, and revocation handling.

**In plain English**
The app no longer treats local entitlement data like the final word. It can now simulate a real authority refresh, show whether access is freshly confirmed, stale, offline, or revoked, and safely fall back to a read-only experience without losing the user's local data. That gives the product a real entitlement lifecycle instead of a one-time local snapshot.

**Verification**
- `npm.cmd run test` - passed.
- `npm.cmd run typecheck` - passed.
- `node --check apps/desktop/src/entitlementClient.js` - passed.
- `node --check apps/desktop/src/entitlement.js` - passed.
- `npm.cmd run lint` - was blocked at the time by the pre-Step-20 doc-path mismatch.

### Step 20 - Phase 3 acceptance pass
*Completed: 2026-04-22*

**What was built**
- Updated `scripts/lint.mjs` so the acceptance gate now validates the moved `learnings/` docs and the full Phase 3 desktop runtime file set.
- Updated `scripts/build.mjs` so the build manifest now records the Phase 3 artifact set instead of the old Phase 1 baseline.
- Generated `ops/phase-3-build-manifest.json` from the refreshed build script.
- Updated `scripts/test.mjs` so the suite completion line reflects the Phase 3 acceptance pass.
- Updated `learnings/planning.md` to mark Phase 3 complete and note that the acceptance gate passed.

**In plain English**
This step closes Phase 3 for real. The repo's own quality checks now match the current project layout, the build output records the actual Phase 3 artifact set, and the acceptance gate passed end to end instead of being partially blocked by outdated scripts.

**Verification**
- `npm.cmd run lint` - passed.
- `npm.cmd run build` - passed.
- `npm.cmd run test` - passed.
- Generated `ops/phase-3-build-manifest.json`.

## References
- `learnings/plans/phase-0-plan.md` - foundation, release contracts, and acceptance gate
- `learnings/plans/phase-1-plan.md` - MVP kernel and usable task shell
- `learnings/plans/phase-2-plan.md` - contracts, scheduler baseline, and runtime entitlement guards
- `learnings/steps.md` - chronological execution log across phases
- `learnings/planning.md` - overall roadmap and current phase summary
