# Plan: Phase 4 - Connected Sync and Refresh Baseline

## Goal
Turn the Phase 3 sync-ready shell into a manually connected client with remote sync transport, revision-safe merge behavior, and connected refresh controls for sync and calendar state.

## Current state at Phase 4 start
You already have:
- A persisted outbox and sync metadata baseline in `apps/desktop/src/syncContract.js`, `apps/desktop/src/state.js`, and `apps/desktop/src/storage.js`.
- Calendar overlay normalization and planner occupancy support in `apps/desktop/src/calendarService.js` and `apps/desktop/src/scheduler.js`.
- Refreshable entitlement authority state in `apps/desktop/src/entitlementClient.js` and `apps/desktop/src/entitlement.js`.
- A green acceptance gate for Phase 3: `npm run lint`, `npm run build`, and `npm run test`.

The app is still intentionally transport-light:
- no remote sync request/response contract,
- no outbox acknowledgement path,
- no remote pull merge behavior,
- no connected calendar refresh client,
- no manual sync controls for the user.

## Scope
Phase 4 is limited to connected-client baseline work:
- manual sync client contract with mock transport,
- remote acknowledgement and pull merge handling,
- persisted sync history and merge-safe state transitions,
- calendar refresh client and connection metadata,
- explicit UI controls for sync and refresh actions,
- deterministic tests for transport, merge, and refresh flows.

Deferred to Phase 5:
- background or live sync,
- real calendar OAuth,
- websocket or push updates,
- AI scheduling actions,
- multi-user workspaces.

## Approach
I will keep this phase narrow and testable:
- define the remote sync contract first,
- teach local state how to acknowledge and merge remote changes next,
- then expose manual sync and calendar refresh controls in the desktop shell.

That keeps transport concerns isolated and avoids mixing UI work with merge logic too early.

## Phase 1 - Remote sync contract baseline (~50m)

21. Add a sync client contract and remote result normalization.
   - Add `apps/desktop/src/syncClient.js` for push request, pull response, and acknowledgement normalization.
   - Persist `lastSyncResult`, `syncHistory`, and `remoteRevision` through the storage contract.
   - Add deterministic mock sync responses for success, partial acknowledgement, and remote divergence.
   - Touch: `apps/desktop/src/syncClient.js`, `apps/desktop/src/storage.js`, `apps/desktop/src/state.js`, `scripts/test.mjs`.

22. Add remote merge and acknowledgement application.
   - Update state orchestration so acknowledged outbox events are removed safely.
   - Add merge helpers for remote task snapshots and remote tombstones.
   - Preserve unsent local work while applying pulled remote updates.
   - Touch: `apps/desktop/src/state.js`, `apps/desktop/src/syncContract.js`, `apps/desktop/src/taskService.js`, `scripts/test.mjs`.

## Phase 2 - Connected client UI baseline (~55m)

23. Wire manual sync controls and sync history into the desktop UI.
   - Add manual sync controls in `apps/desktop/src/main.tsx`.
   - Show last sync result, acknowledged events, remote revision, and divergence warnings.
   - Keep offline and degraded states explicit instead of implicit.
   - Touch: `apps/desktop/src/main.tsx`, `apps/desktop/src/state.js`, `apps/desktop/src/storage.js`.

24. Add calendar refresh client and connection state.
   - Add `apps/desktop/src/calendarClient.js` for mock connected refresh responses and source metadata normalization.
   - Persist `calendarConnection` state with provider, permission status, last refresh result, and connection health.
   - Expose manual refresh controls and connection summary in the desktop shell.
   - Touch: `apps/desktop/src/calendarClient.js`, `apps/desktop/src/calendarService.js`, `apps/desktop/src/main.tsx`, `scripts/test.mjs`.

## Phase 3 - Phase 4 acceptance pass (~25m)

25. Run the Phase 4 verification gate.
   - Run `npm run lint`.
   - Run `npm run build`.
   - Run `npm run test`.
   - Verify outbox acknowledgements, remote merges, manual sync UI, and calendar refresh controls behave deterministically.

## Files

Modify:
- `apps/desktop/src/main.tsx`
- `apps/desktop/src/state.js`
- `apps/desktop/src/storage.js`
- `apps/desktop/src/syncContract.js`
- `apps/desktop/src/taskService.js`
- `apps/desktop/src/calendarService.js`
- `scripts/test.mjs`

Create:
- `apps/desktop/src/syncClient.js`
- `apps/desktop/src/calendarClient.js`

## Edge cases

- Remote acknowledges only part of the outbox:
  keep unacknowledged local events queued and report the partial result clearly.

- Remote deletes a task that still has local unsent edits:
  preserve the local mutation event, mark divergence, and do not silently drop the local work.

- Calendar refresh succeeds but permissions were downgraded:
  keep the previous overlay snapshot if needed, mark the connection state degraded, and surface the permission change.

- Manual sync runs while entitlement is offline or stale:
  allow safe local sync bookkeeping, but do not treat entitlement refresh state as silently healed.

## Risks

- Merge logic can become noisy if local and remote state handling are mixed.
  Mitigation: keep remote merge helpers isolated from UI handlers and test them with deterministic fixtures.

- Mock transport can become too magical and hide real transport complexity.
  Mitigation: keep request and response shapes explicit and narrow.

- Connected refresh controls can clutter the desktop shell.
  Mitigation: add focused status panels instead of scattering transport details across the app.

## Done when

- The app can normalize manual sync pushes and pulls through a client contract.
- Acknowledged outbox events are removed safely while remote updates merge deterministically.
- Calendar refresh uses a connected client contract instead of only static fixtures.
- Manual sync and refresh controls are visible in the UI with explicit degraded-state messaging.
- `npm run lint`, `npm run build`, and `npm run test` pass after the new connected-client paths land.
