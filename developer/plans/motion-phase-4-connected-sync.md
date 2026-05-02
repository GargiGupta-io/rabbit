PLAN: Motion Phase 4 Connected Sync

Goal: Add a manually connected sync and refresh baseline on top of the Phase 3 outbox, calendar overlay, and entitlement foundations.

Current state: The repo has a persisted outbox, calendar busy-block planner support, refreshable entitlement authority state, and a green Phase 3 acceptance gate.

Approach: Define a mock remote sync contract first, teach state how to acknowledge and merge remote results second, then expose manual sync and calendar refresh controls in the desktop shell.

PHASES

Phase 1: Remote Sync Contract
  21. Add `syncClient.js` for push, pull, and acknowledgement normalization.
  22. Add remote merge helpers and safe outbox acknowledgement handling.

Phase 2: Connected UI
  23. Add manual sync controls and sync history to `main.tsx`.
  24. Add `calendarClient.js` and connected calendar refresh state.

Phase 3: Acceptance
  25. Run `npm run lint`, `npm run build`, and `npm run test`.

FILES

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

DONE WHEN

- Manual sync request and response shapes are normalized.
- Remote acknowledgements and pulls merge safely with local state.
- Calendar refresh becomes a connected-client flow instead of only static fixtures.
- UI exposes manual sync and refresh status clearly.
- Lint, build, and test all pass.
