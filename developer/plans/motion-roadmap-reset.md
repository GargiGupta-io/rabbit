PLAN: Motion Roadmap Reset

Goal: Recreate the project roadmap around the reverse-engineering evidence so every future build step follows Motion's real shell, data, and transport behavior instead of the repo's original custom planner assumptions.

Current state: The repo has a solid engineering baseline from Phases 0 to 3, but the current product shape still diverges from Motion. The repo-local `developer/` folder now contains authenticated findings, a final reverse-engineering report, engineering learnings, and a large extracted code-asset set covering shell logic, sync engine, API definitions, UI logic, and UI skin.

Approach: Keep the completed baseline phases as history, then reset Phase 4 onward around the reverse-engineered truth. Use `plan` to define each active phase and `steps` to execute one numbered step at a time. Prioritize shell parity first, then domain parity, then calendar/form parity, then API/sync/cache parity, then native/macOS and hardening.

PHASES

Phase 1: Shell Parity
  1. Add shell state model for tabs, views, agenda, sidebar, and theme.
  2. Replace the current planner-first layout with a Motion-like shell.
  3. Verify the shell and update logs/docs.

Phase 2: Domain Parity
  4. Expand tasks toward Motion's observed schema.
  5. Add workspace, project, stage, and task-definition structures.
  6. Make saved views and inbox real surfaces.

Phase 3: Calendar and Form Parity
  7. Align calendar and event entities.
  8. Replace the tiny add-task row with a Motion-like task form baseline.
  9. Tighten scheduling, dependency, and recurrence behavior.

Phase 4: API and Sync Parity
  10. Add typed client wrappers for key Motion surfaces.
  11. Align sync events and PowerSync-style transport direction.
  12. Add explicit query/cache/bootstrap behavior.

Phase 5: Native and Mac Parity
  13. Abstract desktop shell IPC and native shell actions.
  14. Apply macOS shell polish and release hardening.
  15. Verify build, tests, and release assumptions.

FILES

  Modify: `learnings/planning.md`, `learnings/steps.md`, `learnings/plans/phase-4-plan.md`
  Create: `learnings/plans/phase-5-plan.md`, `learnings/plans/phase-6-plan.md`, `learnings/plans/phase-7-plan.md`, `learnings/plans/phase-8-plan.md`

EDGE CASES

  - Old plans conflict with the new roadmap: keep them as historical record, but make the new roadmap explicit and current.
  - Existing code is still useful in places: preserve only the pieces that support Motion parity, not the old product shape.
  - The extracted code assets are too large to copy blindly: use them as reference modules and contracts, not as uncontrolled dump-in code.

RISKS

  - Re-planning without follow-through could stall progress. Mitigation: make the next executable step explicit in `steps.md`.
  - Keeping both old and new directions implicit would create confusion. Mitigation: mark the roadmap reset clearly in `planning.md` and the phase docs.

DONE WHEN

  - The repo roadmap from Phase 4 onward is rebuilt around the reverse-engineered evidence.
  - The current phase and next step are unambiguous.
  - Future implementation work can proceed using `plan` plus `steps` without re-litigating direction.
