# Plan: Phase 5 - Task, Project, View, and Inbox Domain Parity

## Goal
Align the repo's core entities and product surfaces with Motion's observed task schema, workspace/project/stage model, saved views, and inbox structure.

## Current state at Phase 5 start
After Phase 4, the app shell should look substantially closer to Motion.

The next mismatch will be structural:
- the current task model is still too small,
- project/workspace/stage/task-definition data is still simplified,
- saved views are not first-class enough,
- inbox is not represented as a real domain surface.

Research now available:
- `developer/motion-research/findings.md`
- `developer/motion-research/CODE_ASSETS/SYNC_ENGINE/models/task.ts`
- `developer/motion-research/CODE_ASSETS/UI_LOGIC/pm/`
- `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/views-v3/`
- `developer/motion-research/CODE_ASSETS/API_DEFINITIONS/methods/inbox/`

## Execution mode

Use `/steps` to execute one numbered step at a time and stop after every completion block.

## Approach
Expand the entity model before adding more transport or automation logic.

This phase should make the repo think in Motion's domains:
- task,
- workspace,
- project,
- stage,
- task definition,
- saved view,
- inbox item.

## Phase 1 - Task Model Expansion (~60m)

26. Expand the task contract toward Motion's observed schema.
   - Add fields such as:
     - `statusId`,
     - `priorityLevel`,
     - `blockingTaskIds`,
     - `blockedByTaskIds`,
     - `scheduledStatus`,
     - `stageDefinitionId`,
     - `taskDefinitionId`,
     - richer schedule fields.
   - Touch: `apps/desktop/src/taskService.js`, `apps/desktop/src/contracts.js`, `apps/desktop/src/fixtures.js`, `scripts/test.mjs`.

27. Add project/workspace/stage/task-definition baseline structures.
   - Extend project and state helpers to support workspace and staged project structure instead of only flat projects.
   - Seed the tutorial-style project graph already seen in Motion.
   - Touch: `apps/desktop/src/projectService.js`, `apps/desktop/src/state.js`, `apps/desktop/src/fixtures.js`, `scripts/test.mjs`.

## Phase 2 - Views and Inbox Surfaces (~65m)

28. Make saved views first-class in the runtime.
   - Add view helpers that match the observed `views-v3` direction instead of treating filters as raw UI buttons.
   - Touch: `apps/desktop/src/state.js`, `apps/desktop/src/shellService.js`, `apps/desktop/src/main.tsx`, `scripts/test.mjs`.

29. Add inbox domain and shell surface baseline.
   - Introduce a light inbox service and render an inbox surface from structured data instead of leaving inbox as a future placeholder.
   - Touch: `apps/desktop/src/main.tsx`, `apps/desktop/src/state.js`, `apps/desktop/src/fixtures.js`, `scripts/test.mjs`.

## Phase 3 - Verification (~25m)

30. Run the Phase 5 verification gate.
   - Run `npm run test`.
   - Run `npm run typecheck`.
   - Run `npm run build`.
   - Verify task cards, views, projects, and inbox all read from richer domain state instead of Phase 3 simplifications.

## Files

Modify:
- `apps/desktop/src/taskService.js`
- `apps/desktop/src/projectService.js`
- `apps/desktop/src/state.js`
- `apps/desktop/src/shellService.js`
- `apps/desktop/src/fixtures.js`
- `apps/desktop/src/contracts.js`
- `apps/desktop/src/main.tsx`
- `scripts/test.mjs`

## Edge cases

- Older tasks missing richer scheduling fields:
  inject defaults rather than rejecting the payload.

- Saved views reference unavailable fields:
  degrade to a safe fallback view instead of breaking navigation.

- Inbox data remains sparse:
  render realistic empty states and unread-count behavior without inventing the full backend yet.

## Risks

- Expanding entities too quickly can create migration noise.
  Mitigation: keep changes incremental and test normalization hard.

- Views could become tightly coupled to one UI screen.
  Mitigation: keep them as domain definitions consumed by the shell.

## Done when

- The task model meaningfully resembles Motion's observed task shape.
- Projects and workspaces can represent staged/tutorial-like structures.
- Saved views drive the shell more directly.
- Inbox exists as a real surface in the app.
- `npm run test`, `npm run typecheck`, and `npm run build` pass.

## Closure status (2026-04-24)

- Completed through Steps 26 to 30.
- Delivered:
  - richer Motion-like task contracts,
  - workspace, project definition, stage, and task-definition seed structures,
  - saved views modeled as runtime definitions,
  - personal inbox baseline rendered in the shell,
  - verification gate with `test`, `typecheck`, and `build` passing.
- Deep-learn write-up: `learnings/phase-5-domain-parity-deeplearn.md`.
