# Live Backend Host Validation Deep Learn

Rabbit's backend transport was ready before a real backend existed, which is why the earlier validation attempt stalled on a missing URL instead of surfacing a code bug. The repo had a strong client-side contract layer and a validator, but there was nothing concrete for that validator to call.

## What changed

- A local backend server now exists at `apps/backend/server.mjs`.
- The backend is development-only and in-memory.
- It is seeded from Rabbit's existing fixture state, so the data shape matches the desktop shell closely enough to exercise the real client paths.
- The root repo now exposes `npm.cmd run backend:start`.
- The validator can now be pointed at `http://127.0.0.1:8787` and complete a full read-path and upload-path validation run.

## Why this was the right move

There were only two realistic ways forward after confirming that no separate backend repo or deployed URL existed:

1. Stop and wait for a future backend project.
2. Build a local backend inside this repo so Rabbit can finally validate its transport layer against a real API.

The second path was stronger because it converts "backend-ready in theory" into "backend-validated in practice" without blocking on external infrastructure.

## Endpoint surface implemented

The local backend now serves the core routes Rabbit already calls:

- `POST /v2/ui/bootstrap`
- `GET /v2/users/me`
- `GET /v2/users/me/feature-permissions`
- `GET /v3/views`
- `GET /v2/notifications/items`
- `GET /v2/notifications/unread-count`
- `PATCH /v2/notifications/mark-status`
- `POST /v2/tasks/query`
- `GET /v2/tasks/past_due`
- `GET /v2/tasks/:id`
- `GET /v2/calendars`
- `POST /calendar_list`
- `GET /v2/calendar_events/gantt`
- `POST /powersync/upload`
- `GET /health`

The most important design choice is that these routes are not generic stubs. They are aligned to the shapes Rabbit's own backend runtime already knows how to normalize.

## Upload-path behavior

The `/powersync/upload` handler is intentionally small but real:

- it accepts the same `PUT`, `PATCH`, and `DELETE` task operations the client emits
- it mutates in-memory task state
- it returns `idMappings` when create operations use temporary validator-style ids
- it returns structured `errors` in the same shape the client already normalizes

That was enough to validate the real reconciliation path instead of only proving that a request could be sent.

## Validation outcome

Validated successfully against the local backend URL:

- `http://127.0.0.1:8787`

The backend validator passed:

- bootstrap
- current user
- feature permissions
- views
- inbox items
- tasks query
- calendars
- calendar events
- backend entitlement transport
- PowerSync upload

## Important limitation

This is not a production backend. It is:

- local-only
- in-memory
- fixture-seeded
- development-focused

Restarting the process resets the data. That is acceptable for the current goal, which was to give Rabbit a real backend URL and a real API surface for transport validation.

## What this unlocks next

- Rabbit can now be configured against a known-good localhost backend.
- The desktop shell can be exercised with real connect, refresh, entitlement, and upload actions.
- Future backend work can evolve from an actual server entrypoint instead of starting from zero.
