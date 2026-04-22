# Phase 5 Domain Parity Deep Learn

> This phase changed the app from a shell wrapped around a planner into a shell backed by richer Motion-like domain objects, which matters because Motion's behavior comes from its entities as much as from its layout.

---

## In Plain English

Before Phase 5, the app looked closer to Motion than it used to, but underneath that shell it still thought too simply. Tasks were closer to checklist items than Motion tasks. Projects were mostly colored labels. Saved views behaved like clever buttons. Inbox was still missing as a real product surface. That meant the app could look familiar while still making the wrong decisions internally.

Phase 5 fixed that by teaching the repo more of Motion's vocabulary. A task is now something that can carry scheduling state, dependency links, ownership, and template metadata. A project can now belong to a workspace, come from a project definition, hold stage instances, and connect to stage and task definitions. A saved view now behaves more like a real view definition with filters and columns. Inbox is now a real surface with structured items instead of a future idea.

The important lesson from this phase is that product fidelity depends on how the app thinks, not just how it draws. Once the domain objects become closer to Motion, later phases like calendar parity and task-form parity stop feeling like patches and start feeling like natural extensions of the same model.

## What Phase 5 Was Solving

Phase 4 gave the project a Motion-like shell, but the shell was still sitting on top of simplified data.

The main mismatches were:
- tasks did not carry enough scheduling and dependency meaning
- projects were still mostly flat records instead of staged workspace objects
- saved views did not hold enough definition data to behave like Motion views
- inbox existed in research, but not in the app itself

That led to a dangerous kind of progress: the app could feel closer to Motion on the surface while still being architecturally wrong underneath.

So Phase 5 focused on domain parity first:
1. expand task shape
2. seed workspace and project-definition structure
3. turn saved views into runtime definitions
4. add inbox as a first-class shell surface
5. close the phase with a full verification gate

## The Big Shift

The core architectural shift in this phase was moving from UI-driven behavior to domain-driven behavior.

**Before**
- a shell view mostly decided labels and ordering
- projects were mostly there to decorate tasks
- inbox was absent
- task fields were only deep enough to support the local planner

**After**
- task records carry Motion-like meaning
- project state includes workspaces, stage definitions, and task definitions
- shell views hold definition objects with filters, columns, and grouping
- inbox items are normalized into a real domain summary before rendering

That shift matters because Motion is not just a planner with tabs. It is a product whose shell reads rich domain objects and displays different product surfaces from them.

## What We Built

### Step 26: Task Contract Expansion

This step made tasks behave more like Motion tasks instead of simple todo rows.

The important additions were:
- `statusId`
- `priorityLevel`
- `workspaceId`
- `deadlineType`
- `scheduledStatus`
- `scheduledStart`
- `scheduledEnd`
- `estimatedCompletionTime`
- `blockingTaskIds`
- `blockedByTaskIds`
- `stageDefinitionId`
- `taskDefinitionId`

In plain English, every task now carries more context about where it belongs, how it is scheduled, and what it depends on.

The center of that work lives in `apps/desktop/src/taskService.js`.

```js
export const TASK_PRIORITY_LEVELS = ['ASAP', 'HIGH', 'MEDIUM', 'LOW'];
export const TASK_DEADLINE_TYPES = ['ASAP', 'HARD', 'SOFT', 'NONE'];
export const TASK_SCHEDULED_STATUSES = ['ON_TRACK', 'PAST_DUE', 'UNFIT_SCHEDULABLE', 'UNFIT_PAST_DUE'];
```

Plain English: these are the allowed words the app now uses to describe a task's urgency and scheduling health.

Technical detail: using explicit enums here prevents random string drift and keeps normalization consistent between runtime operations and persisted payloads.

The normalizer also became smarter:

```js
scheduledStatus: normalizeScheduledStatus({
  value: input.scheduledStatus,
  isUnfit,
  status,
  dueAt,
  dueDate,
  scheduledStart
}),
blockingTaskIds: normalizeStringArray(input.blockingTaskIds),
blockedByTaskIds: normalizeStringArray(input.blockedByTaskIds),
```

Plain English: a task can now say whether it is on track, late, or unfit, and it can point to the tasks around it that block or depend on it.

Technical detail: this gives the scheduler, the shell views, and later form logic the same shared picture of a task instead of forcing each layer to invent its own interpretation.

### Step 27: Workspace and Project Graph Baseline

This step replaced the old flat project helpers with a richer project domain.

The new structure includes:
- workspaces
- project definitions
- stage definitions
- task definitions
- staged project instances

The most important file here is `apps/desktop/src/projectService.js`.

The default data now includes the observed Motion tutorial graph:
- workspace `My Tasks (Private)`
- project definition `Learn motion`
- stages `Setup Motion`, `Motion Basics`, and `Motion Advanced`
- task definitions like `Connect your calendars`, `Setup your work schedule`, and `Setup Dashboards`

This was not random seed data. It came from the authenticated Motion findings and extracted assets.

One important pattern is that definitions and instances are separate:

```js
const DEFAULT_PROJECT_DEFINITIONS = [
  {
    id: 'pde_learn_motion',
    name: 'Learn motion',
    stageDefinitionReferences: [...],
    stages: [...]
  }
];

const DEFAULT_PROJECTS = [
  createBaseProject({
    id: 'pr_learn_motion',
    projectDefinitionId: 'pde_learn_motion',
    activeStageDefinitionId: 'stagedef_motion_basics',
    stages: [...]
  })
];
```

Plain English: the project definition is the blueprint, and the project record is the live instance following that blueprint.

Technical detail: this mirrors Motion more closely and gives the repo a better place to attach task defaults, stage logic, and project templates later.

`apps/desktop/src/state.js` was updated so seeded tasks are not normalized alone anymore. They are now reconciled against the project graph and decorated with workspace and tutorial metadata.

That means runtime tasks can now answer questions like:
- which workspace do I belong to?
- what stage am I in?
- am I part of a tutorial-style project?

### Step 28: Saved View Runtime Parity

This step turned saved views into real runtime definitions.

Before this step, a view mostly meant:
- a name
- a route
- a layout
- a sort field

After this step, a view now carries:
- `definitionVersion`
- `definition.type`
- `definition.itemType`
- `definition.visibility`
- `definition.groups`
- `definition.sort`
- `definition.columns`
- `definition.filters`
- `definition.dateRange`

This all lives in `apps/desktop/src/shellService.js`.

The preset model looks like this:

```js
const VIEW_DEFINITION_PRESETS = {
  view_my_deadlines: {
    itemType: 'tasks',
    visibility: 'private',
    groups: [{ field: 'deadline', by: 'day' }],
    sort: [{ field: 'estimatedCompletionTime', direction: 'asc' }],
    filters: {
      tasks: {
        assignee: '@me',
        completed: 'exclude',
        isAutoScheduled: true
      }
    }
  }
};
```

Plain English: a saved view now acts more like a recipe for what should appear in the workspace and how it should be arranged.

Technical detail: this is much closer to Motion's `views-v3` direction and is the reason the center workspace can now be driven by real view definitions instead of page-specific switch statements.

The selector logic also changed:

```js
const filtered = candidates
  .filter((task) => matchesTaskFilters(task, meta.filters?.tasks || {}, referenceNow, currentUserId))
  .filter((task) => {
    if (meta.itemType === 'projects') {
      return Boolean(task.projectId && task.projectId !== 'inbox');
    }
    return true;
  });
```

Plain English: the shell now starts with the view's own rules before applying temporary UI filters like search or status.

Technical detail: that order matters. Motion-like saved views should define the base collection, and ad hoc UI filters should refine it afterward.

`apps/desktop/src/main.tsx` was updated so the header and task surface read from `getViewStateSummary()` instead of inferring everything from route names.

That means the header now reflects:
- visible columns
- visibility
- grouping
- collection type
- filter summary

### Step 29: Inbox Surface Baseline

This step finally added inbox as a real product surface.

The research showed two important things:
- inbox definitely exists in Motion as a first-class surface
- our local recon still did not yield a clean real inbox payload for this account

So the right move was not to guess a full backend. It was to build a structured baseline around the inbox item types we did observe in the extracted assets.

`apps/desktop/src/state.js` now includes inbox normalization and summary helpers.

The normalized inbox understands item types such as:
- `task-assigned`
- `mentioned-in-task-comment`
- `project-stage-entered`
- `meeting-insights`
- `post-onboarding`

The summary model calculates:
- unread count
- total count
- needs-action count
- source count
- active inbox label
- highlighted item
- safe empty-state copy

The important behavior is target resolution:

```js
const task = tasks.find((entry) => entry.id === metadata.taskId) || null;
const project = getProjectById(projects, metadata.projectId || task?.projectId);
const stage = getStageDefinitionById(projectDefinitions, metadata.stageDefinitionId || task?.stageDefinitionId);
```

Plain English: inbox items do not just show text. They try to point back to the task, project, or stage they are really about.

Technical detail: this keeps the inbox tied to the same domain graph as the rest of the app instead of turning it into an isolated notification list.

`apps/desktop/src/fixtures.js` now seeds a personal inbox with deterministic items, and `apps/desktop/src/main.tsx` renders that inbox in the shell rail.

## How the Pieces Connect

By the end of Phase 5, the domain flow looks like this:

```text
Fixtures / storage payload
  |
  v
contracts.js normalizes task + shell + calendar shape
  |
  v
state.js builds project domain + task domain + view summary + inbox summary
  |
  +--> projectService.js resolves workspaces, project definitions, stages, task definitions
  +--> shellService.js resolves saved-view definitions and filtered collections
  +--> state.js inbox summary resolves targets back into the project/task graph
  |
  v
main.tsx renders shell, workspace, agenda rail, inbox rail, sync, and entitlement
```

The important connection is that inbox, views, projects, and tasks now all reference the same domain structures instead of each living in their own mini-model.

## Common Patterns Introduced in This Phase

### Pattern 1: Normalize Once, Reuse Everywhere

What it's for: keep the meaning of a task, project, or inbox item consistent across runtime and persistence.

This phase leaned hard on normalization helpers:
- task normalization
- project graph normalization
- view definition normalization
- inbox item normalization

That matters because reverse-engineered clones drift fast if each layer invents its own shape.

### Pattern 2: Definitions vs Instances

What it's for: separate templates or blueprints from live product records.

Examples:
- project definition vs project instance
- stage definition vs stage instance
- saved view definition vs active view runtime state

This is one of the strongest Motion-like patterns we adopted in this phase.

### Pattern 3: Domain Summary Helpers for UI

What it's for: keep `main.tsx` from becoming a second business-logic layer.

Examples:
- `getViewStateSummary()`
- `getInboxStateSummary()`

Plain English: the UI asks for a prepared summary instead of re-deriving domain behavior itself.

Technical detail: this keeps rendering code thinner and makes tests easier to write against deterministic summaries.

## Edge Cases and Gotchas

### 1. Raw fixture tasks did not always carry every field a view expected

In plain English: a saved view can break if it assumes every task already looks fully normalized.

Technical cause: `selectTasksForShellView()` started filtering by `type`, but raw fixture tasks did not always include it.

Fix: make the view logic tolerant of raw and normalized task rows by falling back to `NORMAL`.

### 2. Workspace ids have to be internally consistent across tasks and projects

In plain English: if a task points to a workspace the project graph does not know about, the domain model stops feeling real.

Technical cause: early fixture data used a workspace id that was not part of the seeded workspace graph.

Fix: align project defaults and fixture tasks to the same workspace ids, especially for team vs private contexts.

### 3. Timeline sorting needs semantic dates, not just any date-shaped field

In plain English: project timelines should feel ordered by real scheduled context, not by whichever field happens to be present first.

Technical cause: sorting by `startOn` before `scheduledStart` produced the wrong task order in the project timeline view.

Fix: prefer `scheduledStart` and `startAt` before falling back to `startOn`.

### 4. Inbox should not invent backend behavior it cannot support yet

In plain English: it is better to build a clean local inbox baseline than to fake a whole unread-sync system with no evidence.

Technical cause: the extracted Motion research gave strong item-type evidence but not a full populated local inbox payload for this account.

Fix: build a structured personal inbox baseline around observed item types, empty-state behavior, and target resolution without pretending the full backend already exists.

## Why Phase 5 Matters

Phase 5 is where the app stopped being just a nicer planner shell and started becoming a richer clone candidate.

After this phase:
- task cards can carry more Motion-like meaning
- project graphs can represent tutorial and staged work
- saved views can drive the workspace with more authority
- inbox exists as a real user-facing area

That is a major milestone because later calendar and form work will now reinforce the right product structure instead of compensating for missing domains.

## How Phase 5 Connects to Phase 6

Phase 6 is about:
- calendar entity alignment
- scheduler semantics
- task form parity
- recurrence and project-aware defaults

That work depends directly on Phase 5:
- richer task fields now exist for schedule semantics
- project and stage definitions now exist for form defaults
- saved views now exist as real definitions that calendar-aware surfaces can respect
- inbox is already in the shell, so later communication or meeting-related changes have a place to land

Without Phase 5, Phase 6 would have had to invent calendar and form behavior on top of weak domain objects.

## What To Remember

If you only keep a few ideas from this phase, keep these:

1. **A Motion clone needs Motion-like entities, not just Motion-like screens.**
2. **Definitions and live instances should be separate whenever Motion treats them separately.**
3. **Saved views are real domain objects, not glorified filter buttons.**
4. **Inbox belongs in the same domain graph as tasks and projects, not off to the side as a generic notification list.**
5. **Phase-by-phase parity works best when each phase strengthens the product model before adding more surface area.**

## Quick Reference

### Main files touched in Phase 5

- `apps/desktop/src/taskService.js`
- `apps/desktop/src/contracts.js`
- `apps/desktop/src/projectService.js`
- `apps/desktop/src/shellService.js`
- `apps/desktop/src/state.js`
- `apps/desktop/src/fixtures.js`
- `apps/desktop/src/main.tsx`
- `scripts/test.mjs`
- `learnings/plans/phase-5-plan.md`
- `learnings/steps.md`

### Outcomes by step

- **Step 26**: task schema became Motion-like enough to carry schedule and dependency meaning
- **Step 27**: workspaces, project definitions, stages, and tutorial project structure landed
- **Step 28**: saved views became runtime definitions with filters and columns
- **Step 29**: inbox became a real shell surface
- **Step 30**: verification gate passed and the phase was closed properly

### Verification gate

Phase 5 closed with:
- `npm run test`
- `npm run typecheck`
- `npm run build`

All passed on 2026-04-24.

## Updates

- 2026-04-24 — Created the initial Phase 5 deep-learn write-up after the verification gate passed and the roadmap moved on to Phase 6.

