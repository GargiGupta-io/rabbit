# Phase 4 Shell Parity Deep Learn

> This phase turned the app from a planner page into a real desktop shell, which matters because Motion is defined by its shell behavior as much as by its task logic.

---

## In Plain English

Before Phase 4, the app technically worked, but it still behaved like a custom productivity page. You opened it and immediately landed on a pile of controls, a task form, and a task list. That is not how Motion feels. Motion feels like a desktop application with a shell around the work: navigation on the left, tabs across the top, a main workspace in the middle, and a secondary rail for agenda and system state.

Phase 4 fixed that mismatch first. Instead of trying to make the old page prettier, we changed the structure of the app so the shell itself became the main product surface. The important lesson is that product fidelity was not just about colors or spacing. It was about where decisions live. Tabs, saved views, sidebar sections, agenda grouping, and theme state had to become real app state before the UI could feel correct.

That is the deeper takeaway from this phase: if the product you are cloning is shell-driven, you cannot bolt that shell on at the end. You have to make the shell part of the data model early, then let the UI read from that model. That is what this phase established.

## What Phase 4 Was Actually Solving

The repo already had useful engineering work from Phases 0 to 3:
- task persistence
- scheduler logic
- calendar overlay support
- entitlement state
- sync metadata

But the top-level product shape was still wrong.

The core problem was:
- the app started from planner controls instead of shell navigation
- saved views were not powerful enough to shape the workspace
- shell state was not first-class in persistence
- the agenda rail existed only as planner output, not as part of desktop chrome
- the visual language still read like a generic white-card app instead of Motion's darker, denser shell

So Phase 4 was not "make it pretty." It was:
1. define shell state
2. persist shell state
3. render the shell as the real app frame
4. make active views change what the workspace shows
5. verify the shell now dominates the experience

## The Main Architectural Shift

The biggest architectural move in this phase was simple:

**Old model**
- planner logic decides everything
- UI is a direct expression of planner controls
- shell is mostly cosmetic

**New model**
- shell state decides navigation and workspace context
- planner logic is one layer inside the shell
- tabs, views, sidebar, and agenda are first-class app concepts

That change sounds small, but it affects everything:
- what gets persisted
- what gets rendered
- what the active route means
- how a saved view changes the current task collection
- how future phases can add inbox, projects, and domain parity without rebuilding the top level again

## The Four Steps That Made the Phase Work

### Step 21: Shell State Model Baseline

This step created the first real shell state layer in `apps/desktop/src/shellService.js`.

What it introduced:
- default shell theme
- default tabs
- default saved views
- sidebar section generation
- agenda snapshot derivation

This mattered because it moved shell behavior out of `main.tsx` and into one module that could be reasoned about, tested, and reused.

### Step 22: Seeded Shell Persistence

This step made shell state part of the persisted payload.

What changed:
- fixtures included shell state
- contracts normalized shell state
- storage roundtripped shell state
- older payloads could be upgraded safely

This mattered because a desktop shell is not real if it resets or has to be recomputed as an afterthought every time.

### Step 23: Shell Layout

This step rebuilt the app frame.

What changed:
- left sidebar
- top tab strip
- central workspace
- right agenda rail
- task/system panels moved into the shell instead of owning the whole page

This was the first moment the app actually looked structurally closer to Motion.

### Step 24: Motion-Like Skin and View-Driven Navigation

This step made the shell behave more like Motion instead of just looking closer.

What changed:
- darker token direction based on Motion evidence
- grouped saved views in the sidebar
- active views started choosing the task collection
- workspace metadata came from shell view definitions
- non-tab views were still treated as real active views

This step is where the shell stopped being decorative.

### Step 25: Verification and Deep Learn

This step closed the phase properly:
- reran the gate
- updated roadmap docs
- wrote this learning note

That matters because without a closeout step, phases blur together and the reasoning behind the structure gets lost.

## What We Built

### Overview

When the app runs now, the first thing the user sees is a desktop shell. The left side is navigation. The top is tab context. The middle is the current workspace. The right side is the agenda and system state. That is a very different product story from "here is a planner form with some stats above it."

Technically, the shell is now driven by persisted shell state and derived shell helpers. The UI still uses the existing planner, scheduler, sync, and entitlement logic, but it no longer lets those layers define the whole app frame.

### Key File: `apps/desktop/src/shellService.js`

This file is the shell brain.

It now does five important jobs:
1. defines default shell theme and tabs
2. defines default saved views
3. groups views into sidebar sections
4. derives an agenda snapshot from tasks and calendar overlay
5. decides what the active view means for the workspace

One of the most important additions was view metadata and view-based task selection:

```js
const SHELL_VIEW_META = {
  calendar: {
    id: 'calendar',
    title: 'Calendar',
    layout: 'schedule',
    collectionLabel: 'Full schedule'
  },
  view_my_deadlines: {
    id: 'view_my_deadlines',
    title: 'My Deadlines',
    layout: 'kanban',
    collectionLabel: 'Deadline pressure'
  }
};
```

Plain English: this gives each saved view its own identity instead of treating all views like the same task list with a different name.

Technical detail: once views have metadata, the workspace header, chips, empty state, and task selection logic can all read from the same source of truth.

Another key part was grouping views into sidebar sections:

```js
if (privateViews.length) {
  sections.push({
    id: 'my-views',
    title: VIEW_SECTION_TITLES.views,
    items: privateViews.map((view) => ({
      id: view.id,
      label: view.name,
      kind: 'view',
      route: view.route,
      layout: view.layout,
      viewId: view.id
    }))
  });
}
```

Plain English: instead of one flat sidebar list, the shell now separates workspace routes, private views, team views, and projects.

Technical detail: this is closer to how Motion organizes navigation, and it also gives Phase 5 a better place to attach inbox and richer project structures.

The most important behavior function is `selectTasksForShellView()`:

```js
export function selectTasksForShellView(tasks = [], shellState = {}) {
  const meta = getShellViewMeta(shellState);

  switch (meta.id) {
    case 'view_my_deadlines':
      return candidates
        .filter((task) => task.status !== 'done' && task.dueAt)
        .sort(compareByDeadline);
    case 'view_project_timelines':
      return candidates
        .filter((task) => task.projectId && task.projectId !== 'inbox')
        .sort(compareByProjectTimeline);
    default:
      return candidates.sort(compareBySchedule);
  }
}
```

Plain English: the active saved view now changes which tasks show up before local filters like search or status run.

Technical detail: this is the bridge from shell navigation to actual workspace behavior. Without this, a saved view would still just be a label on top of the same task collection.

### Key File: `apps/desktop/src/main.tsx`

This file became the shell renderer instead of the planner page.

The biggest lesson here is that `main.tsx` should no longer invent shell meaning. It should consume shell meaning.

The file now imports shell helpers directly from state:

```ts
import {
  activateShellTab,
  activateShellView,
  getShellState,
  getShellViewMeta,
  getShellThemeClassName,
  selectTasksForShellView
} from './state.js';
```

Plain English: the UI is now asking the shell layer what the app means instead of deciding that itself.

The shell frame is also materially different now:

```html
<aside class="shell-sidebar">...</aside>
<section class="shell-workspace">
  <header class="workspace-header">...</header>
  <div id="tab-strip" class="tab-strip"></div>
  <div class="workspace-body">
    <section class="content-surface">...</section>
    <aside class="shell-rail">...</aside>
  </div>
</section>
```

Plain English: the top-level app is now a shell with regions, not a stack of widgets.

Technical detail: this layout is what allowed the planner to become one workspace surface instead of the whole product.

The render path now flows through shell state first:

```ts
function renderWorkspace() {
  const shellState = getShellState(appData);
  const plannerState = buildPlannerState(shellState);

  shell.className = `desktop-shell ${getShellThemeClassName(shellState.theme)}`;
  shell.dataset.theme = shellState.theme.dataTheme;
  renderSidebar(shellState);
  renderTabStrip(shellState);
  renderViewHeader(shellState, plannerState);
  updateSummary(plannerState, shellState);
  renderTasks(plannerState, shellState);
  renderAgenda(shellState);
}
```

Plain English: the shell now decides the frame first, then the planner content gets rendered inside that frame.

Technical detail: this is the clearest sign that the app is now shell-first rather than planner-first.

### Key File: `apps/desktop/src/contracts.js`

This file made shell state part of the persisted schema.

That was a critical move because view-driven navigation becomes fragile if the shell is not normalized like any other app data.

The shell block is now included during payload normalization:

```js
return {
  version: sanitizeText(payload.version, DEFAULT_APP_VERSION),
  schemaVersion: CURRENT_SCHEMA_VERSION,
  projects,
  tasks,
  calendarOverlay,
  shell: normalizeShellState(payload.shell, {
    projects,
    tasks,
    calendarOverlay,
    updatedAt: payload.updatedAt
  })
};
```

Plain English: shell state is saved, migrated, and validated just like tasks or calendar data.

Technical detail: this removed a whole category of hidden state bugs where the runtime shell and the persisted shell could drift apart.

### Key File: `scripts/test.mjs`

The tests in this phase matter more than they might seem.

Why:
- shell work can easily become cosmetic
- visual-looking changes often hide broken state rules
- view logic fails silently if you do not pin it with expectations

The added tests covered:
- grouped sidebar sections
- view-to-tab activation
- view-driven task collections
- persistence expectations after shell grouping changes

Example:

```js
runTest('activating a saved view syncs the matching tab and resolves Motion-like view metadata', () => {
  const nextShell = activateShellView(fixtureState.shell, 'view_project_timelines');
  const snapshot = deriveShellStateSnapshot({
    ...fixtureState,
    shell: nextShell
  });
  const meta = getShellViewMeta(snapshot);

  assert.equal(snapshot.activeTabId, 'tab_project_timelines');
  assert.equal(meta.layout, 'gantt');
});
```

Plain English: this checks that choosing a saved view does not just change text. It changes the actual shell state the same way a real app would need it to.

## How the Pieces Connect

The Phase 4 flow now looks like this:

```text
Persisted app data
  |
  v
contracts.js normalizes shell/task/calendar state
  |
  v
storage.js loads the normalized payload
  |
  v
state.js exposes shell helpers and selectors
  |
  v
main.tsx asks for shellState
  |
  +--> sidebar sections
  +--> active tab
  +--> active view metadata
  +--> agenda snapshot
  +--> view-specific task collection
  |
  v
workspace renders planner logic inside the shell
```

This is the key connection to remember:
- persistence keeps shell state stable
- shell service gives it meaning
- main renders that meaning
- planner logic stays useful, but no longer owns the whole product

## Common Patterns Introduced in This Phase

### Pattern 1: Shell Metadata as Domain State

What it's for: gives the shell enough meaning that the UI can stay thin.

Use it when:
- a view changes behavior, not just labels
- the same metadata is needed by multiple UI regions
- you want tests to pin workspace behavior without touching the DOM

### Pattern 2: View Selection Before Ad Hoc Filters

What it's for: makes saved views define the base collection before temporary filters refine it.

Why this matters:
- saved views are product concepts
- local filters are temporary controls
- if you reverse that relationship, the shell feels fake

### Pattern 3: Persisted Shell State

What it's for: keeps the shell from becoming invisible runtime-only state.

Use it when:
- tabs or views should survive reloads
- migrations need to preserve top-level product context
- later phases will depend on shell state already existing

## The Biggest Gotchas We Hit

### 1. Grouping the sidebar broke older test expectations

In plain English: once we improved the shell structure, the tests were still expecting the old flatter sidebar.

Technical cause: test assertions were pinned to the old `sidebarSections.length` even though grouping into workspace, my views, team views, and projects was the correct new behavior.

Fix: update the tests to assert the new grouped structure explicitly, not just the count from an older model.

### 2. Non-tab views were falling back to the calendar scope

In plain English: if a saved view did not have its own tab, the shell sometimes acted like the user was still on calendar.

Technical cause: shell scope resolution trusted the active tab too early, which made route tabs override a valid active saved view.

Fix: treat `"calendar"` as an explicit route scope and allow non-tab saved views to stay first-class active views in the shell snapshot.

### 3. Skin work can accidentally stay cosmetic

In plain English: it is easy to darken the UI and still leave the product behaving like the old page.

Technical cause: styling can change much faster than state architecture.

Fix: couple the visual change with behavioral change in the same phase. In this case, the darker skin landed together with grouped views and view-driven task selection.

## Why This Phase Matters for the Reverse-Engineering Goal

This phase is a good example of how reverse engineering should guide implementation.

We did not just ask:
- "what colors does Motion use?"

We asked:
- "what kind of app frame does Motion have?"
- "what concepts are stable in that frame?"
- "what does a saved view mean in Motion?"
- "what sits in the shell versus in the work surface?"

That is a more useful reverse-engineering lens because it drives architecture, not just polish.

If we had skipped this and gone straight into richer task fields or sync alignment, the repo would have gotten technically deeper inside the wrong product shape.

## How Phase 4 Connects to Phase 5

Phase 5 is about domain parity:
- richer task schema
- workspaces
- stages
- task definitions
- inbox surface

That work is now easier because Phase 4 created the frame those domains need.

Examples:
- inbox now has a real place to live in the shell
- saved views can evolve into stronger domain objects
- richer task shapes can flow into view-specific collections
- workspace and project structures can appear in the sidebar without rethinking the whole layout

Without Phase 4, Phase 5 would have mixed shell design and domain design into the same messy step.

## What To Remember

If you only remember a few things from this phase, keep these:

1. **Shell parity is architectural, not cosmetic.**
   The shell has to be part of the state model.

2. **Saved views must change data selection, not just labels.**
   Otherwise the app feels fake.

3. **Persistence matters even for UI-level structure.**
   Tabs, views, and theme become more reliable once they live in the contract layer.

4. **A reverse-engineered clone should follow observed product structure first.**
   Deeper backend or domain work only helps if the product frame is already right.

## Quick Reference

### Files that define Phase 4

- `apps/desktop/src/shellService.js`
- `apps/desktop/src/main.tsx`
- `apps/desktop/src/contracts.js`
- `apps/desktop/src/fixtures.js`
- `apps/desktop/src/storage.js`
- `scripts/test.mjs`
- `learnings/plans/phase-4-plan.md`
- `learnings/steps.md`

### Phase 4 outcomes

- shell state exists as real persisted data
- app opens in a Motion-like shell
- saved views shape the workspace
- sidebar groups are closer to Motion
- agenda rail is part of the app frame
- tests pin the shell behavior

### What Phase 4 did not solve

- richer Motion task schema
- workspaces/stages/task definitions
- inbox domain
- true API/sync parity
- macOS-specific shell fidelity

Those belong to later phases.

## Updates

- 2026-04-24 — Created the initial Phase 4 deep-learn write-up after the shell parity verification gate passed and the roadmap moved on to Phase 5.
