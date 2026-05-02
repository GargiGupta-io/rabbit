# Repo Gap Analysis vs Motion Target

Date: 2026-04-22  
Status: high-level, based on public Motion sources plus current repo inspection

## What the current repo already has

From `apps/desktop/src`:
- `taskService.js`
- `projectService.js`
- `scheduler.js`
- `calendarService.js`
- `syncContract.js`
- `entitlement.js`
- `entitlementClient.js`
- `main.tsx`

That means the repo already covers:
- local task and project modeling
- planner window generation
- calendar busy-block overlays
- outbox/sync-event baseline
- entitlement refresh-state modeling
- a desktop-shell UI

## What Motion publicly appears to have that the repo does not

### Product shell and navigation
- full workspace-driven shell
- inbox
- docs
- dashboards
- AI Chat
- booking links
- meetings/events as first-class product surfaces

### Project and collaboration model
- workspaces with roles and permissions
- project views: list, kanban, gantt
- blockers and richer project state
- wider collaboration surfaces

### Time-management surface
- richer calendar account layering
- booking-link configuration
- public scheduling pages
- likely more advanced scheduling rules than our current planner baseline

### Behavior-level parity gaps
- exact task modal fields and layout
- exact calendar interactions
- exact keyboard shortcuts
- exact sidebar structure
- exact notification/inbox behavior
- exact remote sync and bootstrap behavior

## Architectural risk

The current repo is useful as a prototype baseline, but it was not built from Motion-first evidence. That means:
- some primitives may survive,
- many user-facing flows may need to be reshaped,
- and parts of the UI may need clean rewrites instead of patching.

## Recommended use of current repo

Keep if it does not distort parity:
- normalization helpers
- persistence helpers
- deterministic test scaffolding
- scheduler utility code where compatible

Be ready to rewrite:
- `main.tsx`
- state orchestration
- shell layout
- planner semantics
- task create/edit interactions

## Immediate next decision after app install

For each major slice, decide one of:
- keep mostly as-is
- adapt heavily
- replace completely
