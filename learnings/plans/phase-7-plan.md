# Plan: Phase 7 - API, Sync, and Cache Parity

## Goal
Align the repo's API clients, sync event model, PowerSync-style transport, and local cache/query behavior with the extracted Motion contracts.

## Current state at Phase 7 start
The app should already look and behave much closer to Motion by this phase, but its transport and cache layers will still be custom and thinner than the extracted Motion structure.

Research now available:
- `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/`
- `developer/motion-research/CODE_ASSETS/SYNC_ENGINE/dtos/`
- `developer/motion-research/CODE_ASSETS/SYNC_ENGINE/events/`
- `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/powersync/`
- `developer/motion-research/findings.md`

## Execution mode

Use `/steps` for one numbered step at a time.

## Approach
Do not bolt new transport features onto the old Phase 3 sync model.

Instead, use the extracted contracts to reshape:
- API method wrappers,
- sync events,
- batch upload flow,
- query keys and persisted cache behavior.

## Phase 1 - API Client Alignment (~60m)

36. Add typed client wrappers for the highest-value Motion surfaces.
   - Start with tasks, views, calendars, inbox, and bootstrap-like state.
   - Touch: new client modules under `apps/desktop/src/`, `scripts/test.mjs`.

37. Replace or wrap the current custom sync client shape with extracted event DTO direction.
   - Bring local event creation and acknowledgement logic closer to the extracted sync-event model.
   - Touch: `apps/desktop/src/syncContract.js`, `apps/desktop/src/syncClient.js`, `apps/desktop/src/state.js`, `scripts/test.mjs`.

## Phase 2 - Cache and Reconciliation Alignment (~65m)

38. Add bootstrap/query/cache state shaped by the extracted query-key evidence.
   - Align local client state with persisted view, settings, and calendar query behavior.
   - Touch: `apps/desktop/src/storage.js`, `apps/desktop/src/state.js`, `apps/desktop/src/main.tsx`, `scripts/test.mjs`.

39. Add PowerSync-style batch upload and reconciliation baseline.
   - Use the extracted upload/event direction to refine remote merge and outbox handling.
   - Touch: `apps/desktop/src/syncClient.js`, `apps/desktop/src/state.js`, `scripts/test.mjs`.

## Phase 3 - Verification (~25m)

40. Run the Phase 7 verification gate.
   - Run `npm run test`.
   - Run `npm run typecheck`.
   - Run `npm run build`.
   - Verify sync and cached views/settings/calendar state now read closer to extracted Motion structures than Phase 3 contracts.

## Files

Modify:
- `apps/desktop/src/syncContract.js`
- `apps/desktop/src/syncClient.js`
- `apps/desktop/src/storage.js`
- `apps/desktop/src/state.js`
- `apps/desktop/src/main.tsx`
- `scripts/test.mjs`

Create:
- typed client modules for tasks, views, calendars, inbox, and bootstrap-aligned state

## Edge cases

- Extracted API contracts include more than the current app can support:
  implement the highest-value surface first and leave the rest explicitly deferred.

- Cache state becomes too coupled to one backend assumption:
  keep query keys and response normalization modular.

- PowerSync-style transport complicates the outbox too early:
  keep the first pass narrow and deterministic.

## Risks

- This phase can become architecture-heavy and lose product focus.
  Mitigation: only align the transport for surfaces already visible in the app.

- Event-shape migration can break existing fixtures.
  Mitigation: update fixtures and tests together and validate every migration path.

## Done when

- Key API surfaces are represented by typed client wrappers.
- Sync events and batch upload direction are closer to the extracted Motion model.
- Cache/query state is more explicit and less ad hoc.
- `npm run test`, `npm run typecheck`, and `npm run build` pass.
