PLAN: Motion Shell Parity Pivot

Goal: Rebuild the current repo around the reverse-engineered Motion desktop shell so the app stops feeling like a custom planner and starts behaving like a real Motion clone.

Current state: `apps/desktop/src/main.tsx` is still a single-page planner UI with inline CSS and direct task controls. The repo already has useful data primitives for tasks, scheduler output, calendar overlays, sync metadata, and entitlement state, but it does not yet reflect Motion's real shell structure: tabs, app bar, saved views, agenda snapshot, richer settings, and hybrid desktop navigation.

Approach: Use `ENGINEERING_LEARNINGS.md` plus the authenticated findings as the source of truth for the next build wave. Instead of adding more transport features first, pivot to shell fidelity first. Keep the existing data logic where it is useful, but wrap it in a Motion-like desktop shell with data-driven views, agenda state, tabs, and a higher-fidelity layout. Native Tauri work stays later; first we need the right product structure inside the current app.

PHASES

Phase 1: Shell Data Model (~45m)
  1. Add Motion-shell state helpers for tabs, saved views, agenda snapshot, sidebar sections, and theme mode in `apps/desktop/src/shellService.js`.
  2. Extend fixture and persistence contracts so shell state is seeded and stored alongside tasks/projects in `apps/desktop/src/fixtures.js`, `apps/desktop/src/contracts.js`, and `apps/desktop/src/storage.js`.
  3. Export shell selectors and state glue from `apps/desktop/src/state.js` so the UI can render Motion-like navigation from structured state instead of hard-coded filter buttons.

Phase 2: Desktop Shell UI (~60m)
  4. Replace the current single-column planner layout in `apps/desktop/src/main.tsx` with a Motion-style shell: sidebar, top tab strip, main content area, and right-side agenda/app-bar rail.
  5. Move styling away from the current plain inline look into a Motion-inspired token set with dark/light theme support in `apps/desktop/src/main.tsx` and new shell helpers.
  6. Render saved views, workspace sections, and tab state from the shell model instead of from ad hoc filter controls.

Phase 3: Agenda and View Fidelity (~55m)
  7. Show a real agenda snapshot rail using the existing task/calendar data, mapped into ongoing, upcoming, and timeless groupings in `apps/desktop/src/main.tsx` and `apps/desktop/src/shellService.js`.
  8. Add richer task presentation using observed Motion semantics such as stage/project context, blocked status, scheduled windows, and calendar conflicts in `apps/desktop/src/main.tsx`.
  9. Preserve the current planner/task mutation behavior underneath, but expose it through the shell's active view instead of the current raw task list.

Phase 4: Verification and Plan Pivot Cleanup (~30m)
  10. Add deterministic tests for shell-state normalization and saved-view rendering assumptions in `scripts/test.mjs`.
  11. Run `npm run test`, `npm run typecheck`, and `npm run build`.
  12. Update repo planning docs to reflect that shell parity now takes priority over the old connected-sync-first Phase 4 path.

FILES

  Modify: `apps/desktop/src/main.tsx`, `apps/desktop/src/state.js`, `apps/desktop/src/fixtures.js`, `apps/desktop/src/contracts.js`, `apps/desktop/src/storage.js`, `scripts/test.mjs`, `learnings/plans/phase-4-plan.md`, `learnings/planning.md`
  Create: `apps/desktop/src/shellService.js`

EDGE CASES

  - Saved view data missing or partially seeded: fall back to a safe default Motion-like view set instead of crashing the shell.
  - No agenda items available: keep the right rail visible with empty-state copy instead of collapsing the shell layout.
  - Old payloads without shell state: inject default tabs, theme, and saved views during normalization.
  - Existing planner filters no longer visible: preserve the underlying filtering behavior through active-view selection so functionality does not regress while the shell changes.

RISKS

  - The current repo may tempt us to preserve too much of the old UI shape. Mitigation: treat the current layout as disposable and keep only the useful data logic.
  - A shell-only rebuild can become cosmetic if it ignores observed product structures. Mitigation: drive navigation, views, and agenda from the reverse-engineered data model, not static mock labels.
  - Tauri/native work could distract from immediate fidelity. Mitigation: defer native-shell replatforming until this React shell behaves like Motion.

DONE WHEN

  - The desktop app no longer renders as a basic planner form and task list.
  - The UI has Motion-like shell structure: sidebar, tabs, main content, and agenda rail.
  - Saved views, agenda snapshot, and theme state are driven by structured shell state.
  - Existing task/calendar logic still works under the new shell.
  - Tests and build checks pass after the shell pivot lands.
