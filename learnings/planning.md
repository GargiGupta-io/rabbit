# Rabbit - Reverse-Engineered Roadmap

## What this project is now

- This is no longer a "Motion-like app" plan.
- This is now a reverse-engineering-led Rabbit project.
- Windows Motion is the current behavior oracle.
- macOS is still the final product target.

The repo already contains useful baseline work from Phases 0 to 3, but from this point onward the roadmap is driven by observed Motion behavior, extracted code assets, authenticated local state, and typed API/sync research.

---

## Execution mode

This project now uses the `plan` and `steps` workflow on purpose.

- Use `/plan` to define or refresh the active phase before implementation changes.
- Use `/steps` to execute exactly one numbered step at a time.
- After each completed step:
  - stop,
  - summarize what changed in plain English,
  - update `learnings/steps.md`,
  - commit the step cleanly before moving on.

Execution rule:
- no batching future steps,
- no "while we are here" extra work,
- no preserving old architecture when it clearly diverges from Motion.

---

## Evidence base you have now

The roadmap below is based on real evidence, not guesses:

- installed Windows Motion desktop shell and runtime profile
- authenticated user/cache findings from local storage and IndexedDB
- `developer/motion-research/findings.md`
- `developer/motion-research/FINAL_REPORT.md`
- `developer/motion-research/ENGINEERING_LEARNINGS.md`
- extracted code assets under `developer/motion-research/CODE_ASSETS/`

High-value extracted asset groups:
- `SHELL_LOGIC` - IPC provider, channels, app-bar settings, desktop event flow
- `SYNC_ENGINE` - task schemas, event DTOs, sync/event primitives
- `API_DEFINITIONS` - typed method wrappers for tasks, calendars, views, inbox, PowerSync, and more
- `UI_LOGIC` - task form/update flows, project management logic, calendar/task utilities
- `UI_SKIN` - component map and token-level visual clues

This means the next phases should mirror Motion's actual shell, data model, views, and transport shape instead of extending the old custom planner structure.

---

## Historical phases

### Phase 0
- Completed.
- Repo scaffold, docs/contracts, CI baseline, and shell placeholder were established.

### Phase 1
- Completed.
- Local task kernel, persistence, and first usable desktop surface were built.

### Phase 2
- Completed.
- Contracts, fixtures, service split, scheduler baseline, and entitlement hardening landed.

### Phase 3
- Completed.
- Sync outbox baseline, calendar overlay support, authority entitlement refresh, and acceptance checks landed.

Important note:
- Phases 0 to 3 remain valid as baseline engineering work.
- They are no longer the source of truth for product structure.
- Motion itself is now the source of truth for product structure.

---

## Roadmap reset

The old "connected sync first" Phase 4 is retired as the primary direction.

Why:
- we now have direct evidence that Motion's shell, views, agenda, and task model are richer than the current repo shape,
- the current app still looks and behaves like a custom planner,
- further transport work would deepen the wrong product structure.

New priority order:
1. Shell parity
2. Task/project/view/inbox parity
3. Calendar/scheduler/form parity
4. API/sync/cache parity
5. Native desktop/mac parity and hardening

---

## Current roadmap by phase

### Phase 4 - Desktop Shell Parity
- Completed in the step log on 2026-04-24.
- Goal: replace the single-page planner with a Motion-like desktop shell:
  - sidebar,
  - tabs,
  - main view surface,
  - agenda/app-bar rail,
  - theme-aware Motion-like layout.
- Source references:
  - `developer/plans/motion-shell-parity-pivot.md`
  - `developer/motion-research/CODE_ASSETS/SHELL_LOGIC/`
  - `developer/motion-research/CODE_ASSETS/UI_SKIN/`
  - `developer/motion-research/findings.md`
  - `learnings/phase-4-shell-parity-deeplearn.md`

### Phase 5 - Task, Project, View, and Inbox Domain Parity
- Completed on 2026-04-24.
- Goal: align the repo's core entities with Motion's observed task schema, workspace/project/stage model, saved views, and inbox surfaces.
- Source references:
  - `developer/motion-research/CODE_ASSETS/SYNC_ENGINE/models/`
  - `developer/motion-research/CODE_ASSETS/UI_LOGIC/pm/`
  - `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/views-v3/`
  - `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/inbox/`
  - `learnings/phase-5-domain-parity-deeplearn.md`

### Phase 6 - Calendar, Scheduling, and Form Parity
- Completed on 2026-04-25.
- Goal: align calendar entities, task forms, scheduling semantics, dependencies, and reschedule behavior with Motion's observed contracts.
- Source references:
  - `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/calendars/`
  - `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/calendar-events/`
  - `developer/motion-research/CODE_ASSETS/UI_LOGIC/pm/task/form/`
  - `developer/motion-research/CODE_ASSETS/SHARED_LOGIC/flows/`
  - `learnings/phase-6-calendar-scheduling-form-deeplearn.md`

### Phase 7 - API, Sync, and Cache Parity
- Completed on 2026-04-26.
- Goal: align API clients, sync event shape, PowerSync-style transport, bootstrap/cache/query behavior, and local-first reconciliation with extracted Motion contracts.
- Source references:
  - `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/`
  - `developer/motion-research/CODE_ASSETS/SYNC_ENGINE/events/`
  - `developer/motion-research/CODE_ASSETS/SYNC_ENGINE/dtos/`
  - `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/powersync/`
  - `learnings/phase-7-api-sync-cache-deeplearn.md`

### Phase 8 - Native Desktop, Mac Parity, and Hardening
- Completed on 2026-04-27.
- Goal: move from product-behavior parity to real desktop fidelity:
  - native shell contracts,
  - macOS shortcut/window/menu fit,
  - hardening of the desktop bridge,
  - release-path security improvements over the original Motion shell.
- Source references:
  - `developer/motion-research/FINAL_REPORT.md`
  - `developer/motion-research/ENGINEERING_LEARNINGS.md`
  - `developer/motion-research/CODE_ASSETS/SHELL_LOGIC/`

### Phase 9 - Packaging, Native Build Lane, and Release Setup
- Completed on 2026-04-28.
- Goal: turn the completed clone codebase into a real packageable desktop artifact path:
  - real frontend `dist/` output,
  - Tauri-aligned build entrypoints,
  - Mac packaging/signing lane scaffolding,
  - truthful packaging verification.
- Source references:
  - `apps/desktop/scripts/build.mjs`
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `apps/desktop/src-tauri/Cargo.toml`
  - `learnings/plans/phase-9-plan.md`

---

## Document map

- `learnings/plans/phase-0-plan.md` - historical Phase 0 foundation plan
- `learnings/plans/phase-1-plan.md` - historical Phase 1 MVP kernel plan
- `learnings/plans/phase-2-plan.md` - historical Phase 2 architecture and hardening plan
- `learnings/plans/phase-3-plan.md` - historical Phase 3 sync/calendar/entitlement plan
- `learnings/plans/phase-4-plan.md` - completed Phase 4 shell parity plan
- `learnings/phase-4-shell-parity-deeplearn.md` - Phase 4 shell parity learning write-up
- `learnings/plans/phase-5-plan.md` - completed Phase 5 task/project/view/inbox parity plan
- `learnings/phase-5-domain-parity-deeplearn.md` - Phase 5 domain parity learning write-up
- `learnings/plans/phase-6-plan.md` - completed Phase 6 calendar/scheduler/form parity plan
- `learnings/phase-6-calendar-scheduling-form-deeplearn.md` - Phase 6 calendar, scheduling, and form parity learning write-up
- `learnings/plans/phase-7-plan.md` - completed Phase 7 API/sync/cache parity plan
- `learnings/phase-7-api-sync-cache-deeplearn.md` - Phase 7 API, sync, and cache parity learning write-up
- `learnings/plans/phase-8-plan.md` - completed Phase 8 native/mac parity and hardening plan
- `learnings/phase-8-native-desktop-mac-hardening-deeplearn.md` - Phase 8 native shell, macOS, and hardening learning write-up
- `learnings/plans/phase-9-plan.md` - completed Phase 9 packaging and release-setup plan
- `learnings/phase-9-packaging-native-build-release-deeplearn.md` - Phase 9 packaging, native build lane, and release-setup learning write-up
- `learnings/live-backend-integration-deeplearn.md` - live backend runtime notes covering transport execution, remote hydration, PowerSync upload wiring, and backend-driven entitlement refresh
- `learnings/rabbit-rebrand-deeplearn.md` - Rabbit product-identity rebrand notes covering metadata, persistence compatibility, seeded content, and documentation scope
- `learnings/rabbit-windows-polish-finish-line.md` - explicit boundary for what counts as done in the Windows polish pass and what is intentionally deferred
- `learnings/phase-10-windows-product-polish-deeplearn.md` - Windows product-polish learning write-up covering shell subtraction, density work, live QA, and phase closeout
- `learnings/how-i-built-rabbit.md` - single narrative doc for explaining the full build process, reverse-engineering pivot, architecture, and release state
- `learnings/steps.md` - chronological execution log and next-step handoff

Supporting research inside the repo:
- `developer/motion-research/findings.md`
- `developer/motion-research/FINAL_REPORT.md`
- `developer/motion-research/ENGINEERING_LEARNINGS.md`
- `developer/motion-research/clone-spec.md`
- `developer/motion-research/repo-gap-analysis.md`
- `developer/plans/motion-reverse-engineering-clone.md`
- `developer/plans/motion-shell-parity-pivot.md`

---

## Current phase summary

### Phase 4
- Completed.
- Steps 21 to 25 delivered the persisted shell state, desktop shell layout, Motion-like dark skin, view-driven navigation, and the Phase 4 verification gate.
- Deep-learn write-up: `learnings/phase-4-shell-parity-deeplearn.md`.

### Phase 5
- Completed.
- Steps 26 to 30 delivered Motion-like task domain expansion, workspace/project graph seeding, saved-view runtime definitions, the inbox shell surface, and the Phase 5 verification gate.
- Deep-learn write-up: `learnings/phase-5-domain-parity-deeplearn.md`.

### Phase 6
- Completed.
- Steps 31 to 35 delivered Motion-like calendar entities, scheduler semantics, the full task composer, project-aware task-form defaults, and the Phase 6 verification gate.
- Deep-learn write-up: `learnings/phase-6-calendar-scheduling-form-deeplearn.md`.

### Phase 7
- Completed.
- Steps 36 to 40 delivered Motion-like API client wrappers, extracted-style sync events, persisted query-cache state, PowerSync-style upload reconciliation, and the Phase 7 verification gate.
- Deep-learn write-up: `learnings/phase-7-api-sync-cache-deeplearn.md`.

### Phase 8
- Completed.
- Steps 41 to 45 delivered the desktop shell bridge, desktop action routing, macOS shell fit, release hardening, and the Phase 8 verification gate.
- Deep-learn write-up: `learnings/phase-8-native-desktop-mac-hardening-deeplearn.md`.

### Phase 9
- Completed.
- Steps 46 to 50 delivered a real desktop `dist/` build, Tauri-native entrypoints and preflight checks, a Mac CI packaging lane scaffold, a shared packaging smoke-check contract, and the Phase 9 verification gate.
- Deep-learn write-up: `learnings/phase-9-packaging-native-build-release-deeplearn.md`.

### Current roadmap state
- Phases 4 to 9 are complete.
- The Windows product-polish and completion pass is also complete.
- Rabbit's customer-facing Windows preview now has:
  - reduced shell/debug clutter,
  - calmer sync and status copy,
  - tighter task, agenda, inbox, and composer surfaces,
  - and a verified live local task loop against the local backend.
- Rabbit now also has a live backend runtime path for:
  - backend configuration persistence,
  - live bootstrap and remote data refresh,
  - PowerSync-style outbox push,
  - and backend-driven entitlement refresh.
- The next stage should be either:
  - real Mac/Tauri desktop validation and release-path execution,
  - production backend hardening and hosted auth/persistence work,
  - deeper product-surface expansion such as account/workspace, event-authoring, utility, or collaboration flows,
  - or a new recon-driven parity pass if Motion behavior changes.
