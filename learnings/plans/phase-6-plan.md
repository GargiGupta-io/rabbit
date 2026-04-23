# Plan: Phase 6 - Calendar, Scheduling, and Form Parity

## Goal
Align calendar entities, task forms, scheduling rules, and dependency behavior with Motion's observed calendar, task-form, and scheduling logic.

## Current state at Phase 6 start
By this phase, the shell and domain surface should be closer to Motion, but the calendar and scheduling layers will still be simplified compared with the real app.

Research now available:
- `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/calendars/`
- `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/calendar-events/`
- `developer/motion-research/CODE_ASSETS/UI_LOGIC/pm/task/form/`
- `developer/motion-research/CODE_ASSETS/SHARED_LOGIC/flows/`

## Execution mode

Use `/steps` for one numbered step at a time.

## Approach
Do not treat calendar, form, and scheduling as separate cosmetic features.

In Motion they are tightly coupled, so this phase should align:
- task form defaults,
- calendar entities,
- scheduled status,
- dependency-aware scheduling behavior.

## Phase 1 - Calendar Entity Alignment (~55m)

31. Expand calendar and calendar-event normalization.
   - Move closer to the extracted calendar and calendar-event method/model direction.
   - Touch: `apps/desktop/src/calendarService.js`, `apps/desktop/src/contracts.js`, `apps/desktop/src/fixtures.js`, `scripts/test.mjs`.

32. Improve planner semantics around scheduled status and dependencies.
   - Extend scheduling outputs so blocked, unschedulable, and conflict states better match Motion semantics.
   - Touch: `apps/desktop/src/scheduler.js`, `apps/desktop/src/taskService.js`, `apps/desktop/src/main.tsx`, `scripts/test.mjs`.

## Phase 2 - Task Form Parity (~70m)

33. Build a Motion-like task form baseline.
   - Add task-form state and defaults shaped by the extracted task form logic instead of the current tiny add-task row.
   - Touch: `apps/desktop/src/main.tsx`, `apps/desktop/src/state.js`, `apps/desktop/src/taskService.js`, `scripts/test.mjs`.

34. Add recurrence, scheduling, and project/stage defaults to the form layer.
   - Bring form defaults closer to the extracted task-form behavior and project-context logic.
   - Touch: `apps/desktop/src/main.tsx`, `apps/desktop/src/projectService.js`, `apps/desktop/src/taskService.js`, `scripts/test.mjs`.

## Phase 3 - Verification (~25m)

35. Run the Phase 6 verification gate.
   - Run `npm run test`.
   - Run `npm run typecheck`.
   - Run `npm run build`.
   - Verify the app no longer depends on the old inline add-task row as the primary task-edit surface.

## Files

Modify:
- `apps/desktop/src/calendarService.js`
- `apps/desktop/src/contracts.js`
- `apps/desktop/src/fixtures.js`
- `apps/desktop/src/scheduler.js`
- `apps/desktop/src/taskService.js`
- `apps/desktop/src/projectService.js`
- `apps/desktop/src/state.js`
- `apps/desktop/src/main.tsx`
- `scripts/test.mjs`

## Edge cases

- Calendar payloads contain partial or provider-specific fields:
  normalize and retain only stable fields needed for parity.

- Task-form defaults conflict with current data:
  prefer project/workspace-aware defaults over raw field fallbacks.

- Recurrence and scheduled status interact poorly:
  keep deterministic test cases for recurring tasks and scheduled windows.

## Risks

- Task form parity can balloon in scope.
  Mitigation: focus on the observed baseline fields and flows first.

- Scheduler parity can become untestable if rules are added informally.
  Mitigation: add deterministic fixtures for every new semantic state.

## Done when

- Calendar/event normalization is closer to Motion's extracted structure.
- The app has a Motion-like task-edit surface instead of the old quick form row.
- Scheduling, dependency, and recurrence behavior are materially closer to Motion.
- `npm run test`, `npm run typecheck`, and `npm run build` pass.

## Closure status (2026-04-25)

- Completed through Steps 31 to 35.
- Delivered:
  - Motion-like calendar entity and event normalization,
  - richer scheduler semantics for blocked, conflict, pending, and unfit states,
  - a full task form that replaced the old inline add-task row,
  - project-aware stage defaults and recurrence interval handling,
  - verification gate with `test`, `typecheck`, and `build` passing.
- Verified in `apps/desktop/src/main.tsx` that the shell now renders the full `task-form-panel` composer instead of relying on the old inline add-task row.
- Deep-learn write-up: `learnings/phase-6-calendar-scheduling-form-deeplearn.md`.
