# Phase 7 API, Sync, and Cache Parity Deep Learn

> This phase made the app behave more like a real Motion desktop client behind the scenes, which matters because a close clone is not only about what the UI looks like, but also about how it names requests, stores cached state, and reconciles local changes with server truth.

---

## In Plain English

Before Phase 7, the app already looked much closer to Motion. It had a Motion-like shell, richer task and project data, a better calendar model, a visible inbox, and a more realistic task form. But its client-side behavior was still too custom. It still felt like a local app that had some sync ideas attached, rather than a true desktop client shaped by the same kinds of API, cache, and reconciliation rules Motion appears to use.

Phase 7 fixed that by reshaping the app's hidden plumbing. The repo now has typed client wrappers for the major Motion surfaces, a more realistic sync-event model, a persisted query cache that remembers user settings and saved views by named keys, and a PowerSync-style upload path that can understand partial failure and remap temporary ids after the server accepts a create. In practical terms, the app is no longer just saving "what the current state is." It is also saving how that state was fetched, how local mutations should be uploaded, and how local data should be corrected once the server responds.

The main lesson from this phase is that Motion is not just a prettier planner. It is a structured client. Its behavior depends on named query results, stable request shapes, and explicit local-first reconciliation. If those layers are invented casually, the clone may look close while still behaving unlike the real app in ways that compound over time. Phase 7 closed much of that gap.

## What Phase 7 Was Solving

By the end of Phase 6, the product model was much stronger:
- shell parity was in place
- task, project, view, and inbox entities were richer
- calendar entities and scheduler semantics were more believable
- the task composer looked and behaved more like Motion

But there were still four major transport mismatches:

1. API requests were still mostly implied by local code instead of expressed as explicit client contracts.
2. Sync events existed, but they were still too local-first and not close enough to the extracted Motion sync-event direction.
3. Local cache state existed implicitly in saved payloads, but not as a structured query cache with recognizable keys.
4. Reconciliation logic could acknowledge events, but it could not yet model a PowerSync-style CRUD upload flow with temp-id remapping and partial operation failure.

Those gaps matter because they shape how trustworthy the app feels over time. A desktop client can look identical on day one and still drift from the source product badly if:
- it fetches the wrong data with the wrong request vocabulary
- it stores cache state as anonymous blobs
- it cannot reconcile offline-created items after upload
- it cannot distinguish a partially successful sync from a fully successful one

So Phase 7 was really about moving the app from "feature parity on screen" into "client parity in behavior."

## The Big Shift

The biggest architectural change in Phase 7 was moving from loose local state to explicit client contracts.

Before Phase 7:
- request shapes were thinner and less formal
- sync focused on local event queuing
- cache state was mostly just saved domain data
- upload acknowledgement was simple success or failure

After Phase 7:
- major product surfaces have explicit client wrappers
- sync events carry both local and extracted-style metadata
- cache state is persisted as named query entries with Motion-like keys
- upload flow can express CRUD operations and reconcile temp ids

In plain English, the app is now acting less like "a planner that stores data" and more like "a real client that knows where its data came from, how it should be refreshed, and how local changes should be merged back into server state."

## What We Built

### Step 36: API Client Wrapper Baseline

This step introduced a real client-definition layer for the highest-value Motion surfaces.

The main files were:
- `apps/desktop/src/apiClient.js`
- `apps/desktop/src/tasksClient.js`
- `apps/desktop/src/viewsClient.js`
- `apps/desktop/src/calendarClient.js`
- `apps/desktop/src/inboxClient.js`
- `apps/desktop/src/bootstrapClient.js`

In plain English, this gave the repo named request templates for the things Motion actually does: load tasks, load views, load calendar state, load inbox items, and load user/bootstrap state. Instead of the rest of the app guessing how a request should be shaped, those shapes now live in one place.

This mattered because the extracted Motion code assets are full of typed method definitions. If the clone wants to stay close to Motion over time, it needs a contract layer that mirrors that pattern rather than scattering request assumptions across UI code.

### Step 37: Sync DTO Alignment

This step reshaped local sync events so they are no longer only local mutation markers.

The key files were:
- `apps/desktop/src/syncContract.js`
- `apps/desktop/src/syncClient.js`
- `apps/desktop/src/state.js`

The sync layer now distinguishes:
- a local action such as `create` or `update`
- a sync event type such as `task.created`
- a push event type such as `push.task.create`
- a structured `data` payload
- structured `metadata`

In plain English, each local change now has a better "shipping label." The app can still reason about the change in friendly local terms, but it also carries the more formal event identity the extracted Motion sync engine suggests.

That separation matters because local UI flows and remote sync flows usually want different vocabularies. The app now keeps both instead of forcing one weak format to do everything.

### Step 38: Cache State Alignment

This step turned hidden local state into an explicit query-cache layer.

The main files were:
- `apps/desktop/src/storage.js`
- `apps/desktop/src/state.js`
- `apps/desktop/src/main.tsx`

The persisted payload now carries query entries for:
- bootstrap state
- current user
- user settings
- page-view settings
- feature permissions
- views
- uncached calendar list
- workspaces

These use Motion-like key families such as:
- `["v2", "users", "me", "settings"]`
- `["v3", "views"]`
- `["uncached_calendar_list"]`
- `["v2", "workspaces", {...}]`

In plain English, the app now remembers not only the data itself, but also what kind of query produced that data. That is much closer to how a real client cache behaves.

This matters because the recon effort showed clear evidence that Motion persists named query results and settings snapshots locally, instead of just dumping raw domain state into storage.

### Step 39: PowerSync Reconciliation Baseline

This step added a CRUD upload path and better reconciliation behavior.

The main files were:
- `apps/desktop/src/syncClient.js`
- `apps/desktop/src/state.js`

The app can now:
- convert local outbox events into PowerSync-style CRUD operations
- package them into an upload request for `/powersync/upload`
- read per-operation failures
- understand temp-id to real-id mappings
- remap local tasks and queued events after a successful create

In plain English, if the app creates a new local task with a temporary id and the server later says "this is the real id now," the app knows how to update both the task list and the remaining queued work so everything still points at the correct task.

That is one of the most important client behaviors in the whole phase because local-first systems often break in subtle ways when identifiers change after upload.

## How the Pieces Connect

Phase 7 works because each layer now feeds the next one cleanly.

```text
[UI + shell]
    |
    v
[state.js]
    |
    +--> [tasksClient.js / viewsClient.js / calendarClient.js / inboxClient.js / bootstrapClient.js]
    |         |
    |         v
    |    named request contracts and query keys
    |
    +--> [syncContract.js]
    |         |
    |         v
    |    local mutation -> sync event envelope
    |
    +--> [syncClient.js]
    |         |
    |         +--> push-event batch
    |         +--> PowerSync CRUD upload batch
    |         +--> response normalization
    |         +--> temp-id and outbox remapping
    |
    v
[storage.js]
    |
    v
persisted query cache + domain state + sync state
```

In plain English, the flow now reads like a real client lifecycle:
1. the app knows how to describe requests,
2. it knows how to cache the results of those requests,
3. it knows how to describe local changes,
4. and it knows how to reconcile those changes when the server answers back.

## Key Files and Why They Matter

### `apps/desktop/src/apiClient.js`

Plain English: this is the little grammar book that teaches the rest of the app how requests and mutations should be described.

Technical role:
- defines the shape of query and mutation descriptors
- builds normalized request objects
- applies response transforms
- creates stable key arrays

Why it matters:
- it keeps request shape logic out of random UI code
- the rest of the client wrappers can stay declarative

### `apps/desktop/src/tasksClient.js`

Plain English: this file defines how task-related calls should look before anything actually sends them.

Technical role:
- task query shape
- task-by-id fetch shape
- task mutation descriptors
- invalidation targets

Why it matters:
- tasks are the core product entity
- if task requests are shaped wrong, everything downstream drifts

### `apps/desktop/src/bootstrapClient.js`

Plain English: this file defines the "who am I, what settings do I have, and what feature rules apply to me?" part of the client.

Technical role:
- bootstrap query
- current-user query
- settings query
- feature-permission query
- task-defaults mutation

Why it matters:
- the recon showed that Motion stores detailed user settings and feature data locally
- this file gave those surfaces named contracts instead of implicit assumptions

### `apps/desktop/src/storage.js`

Plain English: this file now acts like the local filing system for both domain data and cached queries.

Technical role:
- normalizes saved payloads
- derives and persists query-cache entries
- keeps sync metadata
- keeps shell metadata
- upgrades older payloads safely

Why it matters:
- the client cache only becomes believable if it survives reloads
- the repo now stores query families that look much closer to the extracted Motion evidence

### `apps/desktop/src/syncContract.js`

Plain English: this file is where local task mutations are converted into structured sync events.

Technical role:
- action normalization
- sync-type and push-type mapping
- event payload construction
- event metadata construction
- outbox normalization

Why it matters:
- it separates local-friendly mutation language from upload-friendly event language
- that separation made Step 39 possible

### `apps/desktop/src/syncClient.js`

Plain English: this file is now the transporter. It knows how to take local queued work and shape it for remote upload, then interpret the response.

Technical role:
- push-event batch creation
- PowerSync CRUD upload creation
- push response normalization
- PowerSync upload response normalization
- temp-id mapping application
- outbox remapping

Why it matters:
- this file is where local-first behavior becomes server-aware behavior
- it is the bridge between "queued local changes" and "server-acknowledged state"

### `apps/desktop/src/state.js`

Plain English: this file ties everything together into runtime behavior the shell can read.

Technical role:
- exposes sync summaries
- exposes cache summaries
- applies task mutations
- applies sync reconciliation results
- re-exports the domain and client layers

Why it matters:
- it keeps runtime orchestration in one place
- the UI can ask for high-level summaries instead of reconstructing transport logic itself

## The Two Important Reconciliation Stories

### Story 1: Named Query Cache

In plain English, the app now stores "what query this data belongs to" rather than just storing the data.

That means:
- settings are not just saved settings
- they are the saved result of the settings query
- views are not just saved views
- they are the saved result of the views query

This is closer to how a mature client behaves because it makes later refresh and invalidation logic much more understandable.

### Story 2: Temp-ID Remapping

In plain English, a local-first app often creates things before the server gives them an official id. That is convenient for the user, but risky for the client. If the server later replaces `temp_task_3` with `task_real_3`, the app must update:
- the local task itself
- any queued follow-up mutations
- any event payload that still points at the old id

Phase 7 now handles that mapping path, which is a major trust improvement.

## Patterns That Emerged

### Pattern 1: Contracts Before Transport

What it is for: make sure the app knows what a request should look like before worrying about sending it.

Phase 7 kept doing this:
- define request shapes
- define keys
- define response transforms
- only then deepen reconciliation

That kept the transport work from turning into guesswork.

### Pattern 2: Keep Local Language and Remote Language Separate

What it is for: let the UI speak in friendly domain terms while the transport layer speaks in stricter sync terms.

Examples:
- `action = create`
- `type = task.created`
- `pushType = push.task.create`
- PowerSync upload operation `op = PUT`

Those are related, but they are not the same thing. Modeling them separately made the sync layer clearer and more extensible.

### Pattern 3: Persist the Cache as Data, Not as Side Effects

What it is for: make cache state observable and testable.

Instead of saying "the client probably has some cache somewhere," the repo now persists query-cache entries directly. That means:
- tests can inspect them
- migrations can preserve them
- the UI can summarize them

This is a much stronger pattern than hoping hidden state survives by accident.

### Pattern 4: Reconcile Narrowly and Deterministically

What it is for: keep sync logic from becoming magical.

The PowerSync path handles:
- acknowledged operations
- failed operations
- temp-id mappings

It does not try to solve every future server-sync scenario yet. That restraint matters because sync systems become fragile when they grow faster than their tests.

## Edge Cases and Gotchas

1. **Normalized responses versus raw responses**
   In plain English: some helpers in the app already work with cleaned-up response objects, while others still accept raw server-shaped payloads.
   Technical cause: the repo evolved from local-first helpers into more explicit client contracts over several phases.
   How to avoid: let reconciliation helpers accept both normalized and raw paths intentionally, or normalize once at the boundary and stay strict everywhere else.

2. **Temp-id mappings must update queued follow-up mutations too**
   In plain English: changing the id on the task list is not enough if queued updates still point at the old id.
   Technical cause: a create can be acknowledged while a later update remains queued.
   How to avoid: remap both domain tasks and outbox payloads together, not just one of them.

3. **Cache derivation can accidentally drift from runtime state**
   In plain English: if the saved query cache is generated from stale assumptions, it may stop matching the shell the user is actually seeing.
   Technical cause: derived cache entries depend on active workspace, active view, and calendar state.
   How to avoid: derive cache from the same runtime facts the shell uses and keep regression tests around the key labels and derived values.

4. **CRUD uploads and event uploads solve different problems**
   In plain English: a push-event batch and a PowerSync CRUD batch are not redundant even if they describe the same change.
   Technical cause: one is event-oriented, the other is record-operation-oriented.
   How to avoid: keep both paths explicit and do not blur them into one ambiguous upload format.

## Why This Phase Matters Before Phase 8

Phase 8 is about:
- native shell contracts
- macOS-specific polish
- bridge hardening
- desktop release integrity

That phase would be weaker if the product client underneath it were still too custom. A polished desktop shell does not help much if the data-fetch, sync, and reconciliation model is still unlike the source product.

Phase 7 reduces that risk because:
- API surfaces now have explicit contracts
- sync events have better extracted parity
- cache state is observable and persisted
- upload reconciliation is more realistic

In plain English, Phase 7 gave the desktop shell a more believable brain. Phase 8 can now focus more on platform fidelity and hardening rather than still patching product-client basics.

## Quick Reference

### What Phase 7 added

| Area | New capability | Why it matters |
|------|----------------|----------------|
| API clients | Typed request wrappers for major surfaces | Keeps transport vocabulary close to Motion |
| Sync events | Structured sync and push event types | Separates local mutation language from upload language |
| Cache | Persisted named query entries | Makes local client state look more like Motion's cache |
| Reconciliation | PowerSync CRUD upload + temp-id remap | Lets the client recover cleanly after server acknowledgement |

### Main query families now represented

| Query key family | Meaning |
|------------------|---------|
| `["v2","users","me","settings"]` | User settings snapshot |
| `["v3","views"]` | Saved view definitions |
| `["uncached_calendar_list"]` | Calendar-list cache result |
| `["v2","workspaces", {...}]` | Workspace-focused state |
| `["bootstrap", {...}]` | Initial shell/bootstrap state |

### Main files

| File | Role |
|------|------|
| `apps/desktop/src/apiClient.js` | Shared client-definition helpers |
| `apps/desktop/src/tasksClient.js` | Task request contracts |
| `apps/desktop/src/bootstrapClient.js` | User/bootstrap/settings contracts |
| `apps/desktop/src/storage.js` | Persisted query-cache state |
| `apps/desktop/src/syncContract.js` | Structured sync event creation |
| `apps/desktop/src/syncClient.js` | Upload batching and reconciliation |
| `apps/desktop/src/state.js` | Runtime orchestration and summaries |

## Going Deeper

### 1. Query invalidation strategy

The repo now has explicit query keys, but it still has room to go deeper on when and how different query families should be invalidated after remote mutation success.

### 2. Multi-entity PowerSync reconciliation

The current reconciliation path is task-centered. A future deep dive could extend the same principles to views, inbox items, project records, or calendar-related mutations if the clone grows in that direction.

### 3. Persistent bootstrap hydration strategy

The cache layer now persists bootstrap-style state, but a future deep dive could explain how startup should hydrate from local cache first and then refresh selectively once the real transport is attached.

## What to Remember

- A close Motion clone needs client-behavior parity, not just UI parity.
- Named query-cache entries matter because Motion clearly persists query-style results locally.
- Sync events, push events, and CRUD upload operations are related but not interchangeable.
- Temp-id remapping is one of the most important trust paths in any local-first sync system.
- Phase 7 made the repo much more believable as a real desktop client, not just as a styled planner with sync ideas.

## Suggested Quiz Questions

1. Why does a Motion-like clone need named query-cache entries instead of only saved domain state?
2. What is the practical difference between a local task action like `create`, a sync event like `task.created`, and a PowerSync operation like `PUT`?
3. Why is temp-id remapping not finished until the outbox is updated as well as the local task list?

---

*Generated: 2026-04-26 | Project: motion | Phase: 7 | Key files: apps/desktop/src/apiClient.js, apps/desktop/src/tasksClient.js, apps/desktop/src/bootstrapClient.js, apps/desktop/src/storage.js, apps/desktop/src/syncContract.js, apps/desktop/src/syncClient.js, apps/desktop/src/state.js*
