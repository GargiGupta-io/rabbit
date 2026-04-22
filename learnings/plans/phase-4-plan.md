# Plan: Phase 4 - Desktop Shell Parity Reset

## Goal
Turn the current single-page planner into a Motion-shaped desktop shell using the reverse-engineered shell, view, agenda, and theme evidence now available in the repo.

## Why this phase changed
The older Phase 4 prioritized connected sync transport first.

That plan is now superseded because:
- the current app still looks and behaves like a custom planner,
- Motion's actual shell structure is now known,
- further transport work would deepen the wrong product shape.

The correct next move is shell parity first.

## Current state at Phase 4 start
You already have:
- persisted task, calendar overlay, sync, and entitlement baseline logic in `apps/desktop/src/`
- acceptance checks that pass for the current planner baseline
- reverse-engineered Motion findings and extracted code assets inside `developer/motion-research/`

You do not yet have:
- a Motion-like sidebar or tabs shell
- an agenda/app-bar rail
- saved-view-driven navigation
- Motion-like shell theme structure
- shell state persisted as part of app data

## Execution mode

Use the `plan` and `steps` workflow for this phase:
- `/plan` to review or adjust the phase
- `/steps` to execute one numbered step only
- stop after each step, update `learnings/steps.md`, and commit before continuing

## Scope
Phase 4 is limited to shell fidelity:
- tabs
- sidebar sections
- saved-view shell state
- agenda snapshot rail
- Motion-like visual shell tokens
- structured theme state

Deferred to later phases:
- task schema expansion
- project/stage/task-definition parity
- full calendar entity parity
- API/sync transport alignment
- native/macOS shell pass

## Approach
Keep the existing data layer where it is still useful, but stop preserving the old UI shape.

Build a shell model first, seed and persist it, then replace the current UI with a Motion-like layout that reads from structured tabs, views, and agenda state.

## Phase 1 - Shell State Model (~50m)

21. Add shell state helpers and selectors.
   - Create `apps/desktop/src/shellService.js` for:
     - tabs,
     - sidebar sections,
     - saved views,
     - agenda groups,
     - shell theme state.
   - Touch: `apps/desktop/src/shellService.js`, `apps/desktop/src/state.js`.

22. Seed and persist shell state.
   - Extend fixtures and payload normalization so shell state is stored alongside tasks/projects.
   - Add default tabs, views, and agenda seed data that reflect the current Motion evidence.
   - Touch: `apps/desktop/src/fixtures.js`, `apps/desktop/src/contracts.js`, `apps/desktop/src/storage.js`, `scripts/test.mjs`.

## Phase 2 - Motion-Like Shell UI (~65m)

23. Replace the current planner layout with a shell layout.
   - Rebuild `apps/desktop/src/main.tsx` around:
     - left sidebar,
     - top tab strip,
     - central content area,
     - right agenda/app-bar rail.
   - Remove the current form-first layout as the top-level structure.
   - Touch: `apps/desktop/src/main.tsx`.

24. Apply Motion-like shell skin and view-driven navigation.
   - Use extracted UI token guidance to move away from the current generic white-card layout.
   - Render active views and tabs from shell state instead of from ad hoc filter groups.
   - Touch: `apps/desktop/src/main.tsx`, `apps/desktop/src/shellService.js`, `scripts/test.mjs`.

## Phase 3 - Verification and Handoff (~25m)

25. Run the Phase 4 shell verification gate.
   - Run `npm run test`.
   - Run `npm run typecheck`.
   - Run `npm run build`.
   - Confirm the app shell now reflects Motion-like structure and the old planner layout is no longer the top-level experience.

## Files

Modify:
- `apps/desktop/src/main.tsx`
- `apps/desktop/src/state.js`
- `apps/desktop/src/fixtures.js`
- `apps/desktop/src/contracts.js`
- `apps/desktop/src/storage.js`
- `scripts/test.mjs`

Create:
- `apps/desktop/src/shellService.js`

## Edge cases

- Shell state missing from older payloads:
  inject default tabs, views, agenda groups, and theme safely during normalization.

- No agenda items available:
  keep the right rail visible with an empty state instead of collapsing the shell.

- Saved views are incomplete:
  fall back to a safe default Motion-like set rather than crashing navigation.

- Existing filter behavior gets hidden by the new shell:
  preserve the underlying filter logic through active-view selection so functionality does not regress while the shell changes.

## Risks

- Preserving too much of the old UI will keep the app feeling custom.
  Mitigation: treat the current layout as disposable and keep only the useful data logic.

- A shell-only rewrite could become cosmetic.
  Mitigation: drive tabs, views, and agenda from structured shell state and real Motion references.

- Theme work could drift into redesign.
  Mitigation: stay close to the extracted shell/component/token evidence.

## Done when

- The app no longer renders as a basic planner form and task list.
- The shell has Motion-like structure: sidebar, tabs, content surface, and agenda rail.
- Tabs, views, agenda, and theme are driven by structured shell state.
- Existing task/calendar logic still works underneath the new shell.
- `npm run test`, `npm run typecheck`, and `npm run build` pass.
