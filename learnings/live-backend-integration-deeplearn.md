# Rabbit Live Backend Integration

> Rabbit can now point at a real backend, pull live product data into the desktop shell, push the local outbox through the PowerSync-style upload lane, and refresh entitlements from live backend data instead of only from mock authority responses.

---

## In Plain English

Before this work, Rabbit looked like a connected app from the outside, but it was still acting like a very polished offline demo. The project already knew how a backend request should be described, how local task edits should become sync events, and how a server response should be normalized when it came back. What it did not have was the actual bridge between those pieces and a real network target.

This phase built that missing bridge. Rabbit can now save a backend URL and token, test the connection through the existing bootstrap contract, refresh remote tasks/views/inbox/calendar data into the local shell, push pending local changes to `/powersync/upload`, and use live backend permission data to drive entitlement refresh. Just as important, it still keeps the local-first behavior intact when the backend is missing, partially broken, or returns incomplete data.

---

## What Problem This Solved

The repo had already finished the request-contract and sync-contract phases, but there was still a gap between "we can describe the right requests" and "the running app can actually talk to a backend." That gap mattered because the UI was still honest about not being connected:

- the sync panel still said the app was "waiting for the future remote sync path"
- entitlement refresh only exercised deterministic mock scenarios
- remote query wrappers existed only as definitions, not runtime behavior
- pushing the outbox required synthetic response objects instead of an actual HTTP call

That meant there was no true way to answer the question "what happens when Rabbit talks to a real server?" This phase created that answer without throwing away the local architecture that was already working.

---

## What Was Built

### 1. A persisted backend runtime snapshot

Rabbit now stores backend configuration and connection status in the same local app snapshot as the rest of the desktop shell.

Key ideas:
- save a normalized backend URL and optional bearer token
- remember connection state like `idle`, `online`, `connecting`, and `error`
- retain the last request, last bootstrap, last push, and last entitlement refresh timestamps
- keep the state compatible with older payloads by migrating legacy snapshots into the new schema

Main files:
- `apps/desktop/src/contracts.js`
- `apps/desktop/src/storage.js`

### 2. A generic live transport executor

The new backend client does not invent a second request model. It executes the request definitions that already existed in the repo.

That means the same query or mutation descriptor can now be:
- described in a client wrapper like `getCurrentUser` or `queryTasks`
- resolved into a concrete request object
- executed against a configured backend URL
- transformed through the same response transform path used by the existing client definitions

Main file:
- `apps/desktop/src/backendClient.js`

### 3. Live remote refresh for core desktop slices

Rabbit can now refresh the important desktop data surfaces through the live backend path:

- bootstrap state
- current user
- feature permissions
- saved views
- inbox items
- tasks
- calendars
- calendar events

The refresh logic hydrates those responses back into the local desktop shell rather than trying to turn the entire runtime into a server-owned state machine.

Main files:
- `apps/desktop/src/backendClient.js`
- `apps/desktop/src/main.tsx`

### 4. Real PowerSync-style upload from the outbox

The local outbox was already correct in structure from the earlier sync work. This phase added the live network call that posts those operations to `/powersync/upload`, then applies the existing reconciliation helpers to:

- clear acknowledged events
- keep failed events queued
- remap temp task ids to real server ids
- keep local task data consistent after id remapping

Main files:
- `apps/desktop/src/backendClient.js`
- `apps/desktop/src/main.tsx`

### 5. Live entitlement refresh without inventing a fake endpoint

There was no existing dedicated entitlement endpoint in the extracted contracts, so this phase took the stronger path: build live entitlement refresh from real backend user and feature-permission queries.

The backend entitlement transport now:
- fetches `/v2/users/me`
- fetches `/v2/users/me/feature-permissions`
- synthesizes the entitlement payload the rest of Rabbit already understands
- marks revocation if backend permissions say access is revoked

This kept the existing entitlement runtime intact while replacing the transport source when a backend is configured.

Main files:
- `apps/desktop/src/backendClient.js`
- `apps/desktop/src/main.tsx`

---

## How The Pieces Fit Together

```text
[sync panel]
    |
    +--> backend URL + token
    |
    +--> connect / refresh / push
    |
    v
[main.tsx]
    |
    +--> executeBackendDefinition(...)
    |         |
    |         v
    |    existing request definitions
    |
    +--> executeBackendPowerSyncUpload(...)
    |         |
    |         v
    |    POST /powersync/upload
    |
    +--> createBackendEntitlementTransport(...)
    |         |
    |         v
    |    /v2/users/me + /v2/users/me/feature-permissions
    |
    v
[hydrateAppDataFromBackend(...)]
    |
    +--> merge remote tasks with pending local outbox edits
    +--> refresh saved views
    +--> refresh inbox
    +--> refresh calendar overlay
    |
    v
[saveStoredData(...)]
    |
    v
[local-first desktop shell]
```

The important design point is that Rabbit still stays local-first. The backend refresh does not become the single source of truth for every running value. Instead, the backend response is merged back into the local shell state in a way that preserves unsynced local edits.

---

## Key Decisions And Why They Matter

### Reuse the existing request contracts

The repo already had clean request definitions in:
- `bootstrapClient.js`
- `tasksClient.js`
- `viewsClient.js`
- `calendarClient.js`
- `inboxClient.js`

Writing a second set of ad hoc `fetch()` calls inside `main.tsx` would have duplicated those contracts and created drift. The backend runtime instead executes the existing definitions directly.

### Preserve pending local task edits during remote refresh

This was the most important correctness rule in the phase.

If Rabbit refreshed tasks from the backend and blindly replaced the local list, it could lose:
- local edits that were still in the outbox
- pending creates with temp ids
- pending deletes that the server had not processed yet

The hydration logic now overlays pending local task changes on top of freshly fetched remote task data so the app does not regress during the gap between edit and successful push.

### Use live permission queries for entitlement refresh

Instead of guessing a new entitlement endpoint, Rabbit now uses backend data that already exists in the extracted API surface. That keeps the transport honest and lets the entitlement runtime stay focused on normalization, freshness, and read-only fallback instead of inventing another contract layer.

### Degrade safely on partial refresh failure

Remote refresh runs through multiple backend calls. Some may succeed while others fail. The runtime now accepts partial success and keeps the last good local slices instead of treating any single failure as a full-state reset.

---

## Main Files Changed

### `apps/desktop/src/backendClient.js`

This is the new transport and hydration layer.

It provides:
- backend config normalization
- URL and header construction
- request execution for existing query/mutation definitions
- PowerSync upload execution
- live entitlement transport synthesis
- backend-to-local hydration helpers

### `apps/desktop/src/contracts.js`

This file now persists:
- `backend`
- `inbox`

It also advances the schema version so older payloads get migrated forward safely.

### `apps/desktop/src/storage.js`

This file now records backend and inbox metadata in the persisted snapshot so the shell can describe not only sync health, but also backend readiness.

### `apps/desktop/src/main.tsx`

This is where the feature becomes visible and usable.

The sync panel now supports:
- saving backend settings
- connecting to a backend
- refreshing live remote data
- pushing the outbox

The entitlement panel also switches to the live backend authority transport automatically when a backend is configured.

### `scripts/test.mjs`

The regression suite now covers:
- backend config normalization
- live request execution
- PowerSync upload execution
- live entitlement transport synthesis
- backend hydration merge behavior
- persistence of backend and inbox state

---

## What Still Is Not Done

This phase adds the runtime path, not final proof against a real production server. The important remaining work is:

1. Validate against an actual backend host and real credentials.
2. Reconcile any field-shape drift discovered in real server responses.
3. Decide whether task mutations should auto-push in the background instead of only via the manual sync-panel action.
4. Decide whether more server-owned slices should be persisted directly instead of being derived back into local shell state.
5. Tighten UI around token management if Rabbit moves beyond local developer use.

So the repo is no longer "backend not started," but it is still "backend runtime wired and ready for real-server validation."

---

## Verification

The backend phase was validated with:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run test`

The test suite now explicitly covers the new backend path in addition to the older domain, sync, shell, and entitlement behavior.

---

## Practical Outcome

Rabbit crossed the line from "offline shell with correct shapes" to "desktop shell with an actual live backend lane." That changes what can happen next:

- real server validation is now an execution task instead of a greenfield architecture task
- Mac packaging is now packaging a product that can be configured to talk to a backend
- future parity work can be tested against live data instead of only fixtures and local snapshots
