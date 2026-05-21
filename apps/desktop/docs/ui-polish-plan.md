 # Rabbit Desktop UI Polish Plan

Date: 2026-05-18

## Goal

Create a deeper visual pass on the desktop app that feels distinct while staying grounded in your current workflow.  
Focus areas:

- More immediate visual hierarchy
- Better task surface readability
- Cleaner route-specific identity
- Stronger branding via rabbit silhouette without making the app look like a clone
- No behavior regressions in task/editor/calendar flows

## Current Baseline (today)

- Main UI is implemented in a single file: `apps/desktop/src/main.tsx`
- Styles are inline CSS inside that file
- Shell uses:
  - `desktop-shell`
  - surface title/caption/count at `.surface-*`
  - task rows via `.task-item`
  - dedicated route surfaces (calendar, agenda, deadlines, etc.)
- Native packaging/icon pipeline is already wired, and runtime is available once rebuilt from repo root.

## Guiding Design Direction

Keep Motion-like confidence and rhythm, but make Rabbit distinct:

1. Make motion feel like an “operations cockpit”:
   - cleaner panels
   - stronger data-first hierarchy
   - route-aware accents
2. Reduce generic glass/pill feel where it reads as style-only.
3. Add “work signal” visuals (urgency, done state, routing context) tied to real data.
4. Keep transitions subtle and fast (no flashy loops).

## Proposed visual system updates

### 1) Shell shell + shell chrome
- Keep dark foundation but define explicit semantic variables:
  - background levels
  - text hierarchy
  - ring/outline color
- Keep sidebar/workspace split, but introduce route tint tokens:
  - calendar, deadlines, queue, inbox, project, team

### 2) Surface header + KPI block
- Replace plain count text with compact status badge using:
  - total count
  - completion ratio
  - compact progress segment bar
- Keep this consistent across all route surfaces.
- Add route-tint accent on KPI background for route recognition.

### 3) Task card evolution
- Add meaningful state classes from metadata:
  - done
  - overdue
  - urgent
- Visual cues should reflect behavior:
  - left rail, subtle border shifts, emphasis only when state is meaningful
  - keep action buttons and layout stable for usability

### 4) Inputs, filters, tab actions
- Improve button press and focus states consistently
- Keep control spacing responsive
- Keep search/filter behavior unchanged while improving visual rhythm

### 5) Route surfaces and rail
- Add low-risk visual consistency between task surfaces and route-specific surfaces:
  - no functional change
  - route headers and spacing updates only
- Add optional micro-identity cards for unique surfaces (e.g., agenda/week/queue context chips)

### 6) Brand identity / iconography
- Use provided screenshot as rabbit silhouette source:
  - convert and normalize to:
    - `apps/desktop/src-tauri/icons/rabbit-silhouette.svg`
    - generated platform icon set via existing `cargo-tauri icon` flow
- Keep launcher text/title in app shell unchanged unless user asks for rename.

## Implementation plan (phased)

### Phase 0 — Freeze + align (low risk, immediate)
1. Finalize scope and terminology.
2. Confirm whether “workflow cockpit” or “minimal dashboard” direction is preferred.
3. Confirm if route-specific accents should be:
   - color-only
   - icon-only
   - color + icon

### Phase 1 — Data-tied surface polish (safe)
1. Normalize surface counts into reusable metric component (already in progress).
2. Apply to remaining route contexts so counts are visually consistent.
3. Add route-aware `.desktop-shell[data-route-mode]` surface accents.
4. Validate no behavioral logic changes.

### Phase 2 — Task row semantics pass (medium)
1. Add overdue/high-priority indicators at row level.
2. Add micro-state styling for done/overdue/urgent rows.
3. Keep existing actions and keyboard behavior untouched.
4. Run manual UI smoke check in:
   - default route
   - calendar route
   - inbox route
   - deadlines route

### Phase 3 — Distinctness layer (optional)
1. Add unique route hero cues:
   - subtle route context badges
   - micro-animations on metric progress indicator
2. Add visual motif to side rail and composer for stronger brand feel.
3. Optionally add quick “focus mode” density toggle (compact vs standard rows).

### Phase 4 — Final polish + docs
1. Final visual tuning pass.
2. Add short QA checklist and known issues.
3. Finalize icon regeneration notes and run final rebuild.

## Route-wise planned UI differences

### Calendar
- KPI: event count + completion/coverage signal
- Accent: cool blue strip
- Keep calendar grid untouched; only frame and header treatment

### Deadlines
- KPI: task ratio + overdue emphasis in muted warning tone
- Accent: warm/rust to urgent orange-red usage

### Task queue
- KPI: task total + done ratio
- Accent: compact control styling

### Inbox
- KPI: unread vs total signal (or readable completion ratio)
- Accent: neutral blue with soft alert support

### Project timelines / Team schedule / Workspace
- KPI: project/assignee/status summary
- Accent: muted neutral gradient, no heavy noise

## Acceptance criteria

- No change in task mutation, filtering, navigation, or shell commands.
- KPI block renders in all route headers with no blank/NaN cases.
- Task rows show at least three stable semantics:
  - done
  - overdue
  - high-priority
- Build succeeds with the new icon pipeline.
- App remains readable at 125% DPI and 90%/110% zoom in Windows native window.

## Testing checklist (manual, lightweight)

1. Rebuild from repo root and launch latest binary.
2. Navigate all primary routes in a single session.
3. Verify:
   - surface header metrics remain updated
   - task row states appear as expected
   - filters and quick actions still work
4. Check no console errors when switching themes/platform profile.

## Rollback plan

- UI edits are isolated to `apps/desktop/src/main.tsx`.
- If regressions appear, revert this file only to last known good commit and re-apply from Phase 1 upward.

## Open questions before editing

1. Direction: “cockpit-heavy” or “minimal glass” as default for this cycle?
2. Should urgent states be color-only, icon-only, or both?
3. Should the silhouette be monochrome only, or two-tone (dark + accent edge)?
