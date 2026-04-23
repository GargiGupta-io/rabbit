# Phase 6 Calendar, Scheduling, and Form Parity Deep Learn

> This phase made the app think more like Motion when time, scheduling pressure, and task creation collide, which matters because Motion's product value is mostly about how it interprets time rather than how it merely stores tasks.

---

## In Plain English

Before Phase 6, the app already looked much more like Motion than it did at the start of the project. It had a proper shell, richer task data, saved views, and a visible inbox surface. But the most important product behavior was still too thin. The calendar layer still acted more like a list of blocked times than a real calendar model. The scheduler still flattened several kinds of planning trouble into generic warnings. The task form had improved, but it still behaved more like a custom app form than a Motion-style planning surface.

Phase 6 fixed that by making the app understand time more deeply. It now stores richer calendar entities, distinguishes between different kinds of schedule trouble, and uses a much more realistic task composer. When you create work inside a staged project, the form can now infer which stage you are working in, suggest dates that make sense for that stage, and preserve recurrence rules with more structure. That makes the app feel less like a planner with Motion styling and more like a real attempt to clone Motion's planning behavior.

The key lesson from this phase is simple: in Motion, time is not decoration. Time shapes the product. Calendar entities, scheduling semantics, and task-form defaults are all part of the same system. If those parts are modeled separately or loosely, the product may look familiar while still behaving wrong. Phase 6 closed much of that gap.

## What Phase 6 Was Solving

Phase 5 gave the repo a much better domain model:
- richer task entities
- staged projects
- saved views
- inbox state

That was necessary groundwork, but it still left three major mismatches:

1. calendar data was not rich enough
2. scheduler output did not reflect Motion's more specific planning states
3. task creation still was not driven enough by project and schedule context

Those gaps matter because they directly affect what users trust. Motion is valuable when it tells a user:
- what time is really blocked
- why a task is failing to fit
- what is blocked by dependencies
- what should happen by default when new work is created inside a project

If those decisions are wrong, the clone may still look close while silently behaving unlike the real app.

So Phase 6 was really about joining three layers into one consistent planning model:
- calendar structure
- scheduling interpretation
- task-form defaults

## The Big Shift

The biggest architectural shift in this phase was moving from raw schedule fields to interpreted planning state.

**Before Phase 6**
- calendar overlay mostly meant busy blocks
- schedule warnings were broad and generic
- the task form mostly collected user input
- project context was only lightly reflected in creation defaults

**After Phase 6**
- calendar overlay includes richer Motion-like calendar and event metadata
- scheduler output separates dependency blocks, calendar conflicts, task conflicts, pending reschedules, and unfit work
- the task form acts more like a Motion composer instead of a plain entry form
- project stages now influence suggested dates and structure for new tasks

That shift matters because Motion is not just storing task timestamps. It is interpreting scheduling reality and helping users create work in a way that fits that reality.

## What We Built

### Step 31: Calendar Entity Alignment

This step expanded the calendar layer so it behaves more like Motion's observed calendar model instead of a simple busy-block utility.

The main file was [calendarService.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/calendarService.js).

The expanded model now carries:
- calendar entities
- provider metadata
- access roles
- organizer data
- attendee data
- visibility
- conference details
- recurrence-related fields
- provider-aware source metadata

In plain English, the app now knows more about where a calendar event came from and what kind of event it is. That makes later scheduling logic more believable because it is no longer working from a tiny stripped-down event shape.

One of the important outcomes was that fixture overlays now carry richer account and calendar identity instead of only event times. That puts the app much closer to the extracted Motion API direction.

### Step 32: Scheduling Semantics Alignment

This step taught the scheduler to classify different planning problems more honestly.

The key files were:
- [scheduler.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/scheduler.js)
- [taskService.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/taskService.js)
- [main.tsx](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/main.tsx)

Instead of one general conflict state, the planner now surfaces:
- dependency-blocked tasks
- calendar conflicts
- task conflicts
- pending-reschedule tasks
- unschedulable tasks

In plain English, the app now explains *what kind of bad scheduling situation happened*, not just that something went wrong.

That distinction is important because each state suggests a different fix:
- a dependency block means something else must be completed first
- a calendar conflict means the task overlaps committed time
- a task conflict means two pieces of work overlap each other
- a pending-reschedule state means the task needs to be placed again
- an unfit state means the current window does not have enough room

This makes the shell metrics and task warnings more faithful to Motion's language and behavior.

### Step 33: Task Form Baseline

This step replaced the old inline task-entry row with a proper composer surface.

The central files were:
- [state.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/state.js)
- [taskService.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/taskService.js)
- [main.tsx](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/main.tsx)

The form now supports:
- title
- description
- project
- assignee
- priority
- status
- schedule mode
- schedule selection
- start and due fields
- duration
- minimum duration
- deadline type
- recurrence

In plain English, the app no longer creates tasks through a tiny text row. It now gives task creation the amount of structure Motion expects.

This mattered because the old row could only ever behave like a simplified planner input. A richer task model needs a richer creation surface, or the model and UI drift apart.

### Step 34: Project-Aware Defaults and Recurrence Structure

This step made the composer react to project context instead of just collecting values.

The important files were:
- [projectService.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/projectService.js)
- [taskService.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/taskService.js)
- [main.tsx](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/main.tsx)

The form can now:
- show stage options for staged projects
- use the active stage as a default
- suggest start and due windows from the project's stage timeline
- preserve recurrence intervals
- carry `projectDefinitionId` and `stageDefinitionId` into the normalized draft

In plain English, creating a task inside a staged project now feels more like creating work inside a real planning system rather than attaching a project label to a generic todo.

## How the Pieces Connect

Phase 6 works because the calendar layer, scheduler, and form are no longer isolated.

The flow now looks like this:

```text
[Calendar overlay]
    |
    v
[calendarService.js] ---> richer calendar entities and busy blocks
    |
    v
[scheduler.js] -------> blocked/conflict/pending/unfit interpretation
    |
    v
[main.tsx] -----------> shell metrics, task warnings, agenda context

[projectService.js] ---> stage-aware project defaults
    |
    v
[main.tsx form] ------> stage selector + default dates + recurrence interval
    |
    v
[taskService.js] -----> normalized task draft with project/stage scheduling data
```

In plain English, one side of the phase teaches the app how to understand time that already exists, and the other side teaches it how to create new work that respects that time.

## Key Files and Why They Matter

### [calendarService.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/calendarService.js)

Plain English: this file is the translator between raw calendar data and the app's planning model.

Technical role:
- normalizes calendars
- normalizes events
- keeps stable provider fields
- derives busy blocks without discarding richer metadata

Why it matters:
- later phases can use richer API clients without reshaping the whole app again
- scheduler logic can depend on a more believable event shape

### [scheduler.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/scheduler.js)

Plain English: this file is where the app decides what kind of schedule trouble is happening.

Technical role:
- merges task intervals with external busy blocks
- derives semantic buckets
- returns planner output the shell can explain

Why it matters:
- UI warnings are only trustworthy if the classification logic is good
- the shell metrics now reflect distinct scheduling states instead of one generic conflict count

### [taskService.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/taskService.js)

Plain English: this file turns the form's user-facing values into a normalized task record the rest of the app can trust.

Technical role:
- normalizes task fields
- derives fixed-time scheduling values
- preserves recurrence intervals
- carries project and stage identifiers into saved drafts

Why it matters:
- the task form can stay expressive while persistence stays predictable
- future API and sync phases can work from a cleaner task draft shape

### [projectService.js](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/projectService.js)

Plain English: this file gives the form enough project intelligence to choose the right stage and date defaults.

Technical role:
- resolves staged project definitions
- orders stage definitions
- returns stage options
- computes default start and due windows from stage and project dates

Why it matters:
- task creation now reflects the project graph instead of ignoring it
- the clone behaves more like Motion's project-aware flows

### [main.tsx](/C:/Users/Pumba/Documents/codex/motion/apps/desktop/src/main.tsx)

Plain English: this file is where the shell exposes the phase's new behavior to the user.

Technical role:
- renders richer planner summaries
- shows schedule-state warnings on tasks
- renders the full task composer
- applies project-aware form state

Why it matters:
- this is the visible proof that the planner no longer depends on the old quick-entry row
- the task form is now clearly the primary task-edit surface

## Patterns That Emerged

### Pattern 1: Normalize Early, Interpret Later

What it is for: keep raw input handling separate from planning semantics.

The phase repeatedly followed this pattern:
- normalize calendar entities first
- normalize task draft state first
- classify scheduler semantics after normalization

That reduces noise and makes tests easier to keep deterministic.

### Pattern 2: Domain Defaults Should Come From Context, Not Widgets

What it is for: stop form behavior from depending on whichever input the user touched first.

The project-aware composer now pulls defaults from:
- project definitions
- stage ordering
- stage due dates
- current project stage

That is closer to how Motion behaves and also more maintainable than scattering defaults across UI event handlers.

### Pattern 3: Distinguish Semantics, Not Just Data Fields

What it is for: make the app explain different types of trouble in different ways.

A raw date overlap is not enough. The product needs to know whether the overlap means:
- blocked
- conflicted
- pending
- unfit

That pattern made the UI and the tests more trustworthy.

## Edge Cases and Gotchas

1. **Time-zone expectations in defaults**
   In plain English: it is easy to think a generated default time should appear shifted when really the helper is intentionally creating a specific hour in UTC.
   Technical cause: default project dates were converted using explicit ISO-at-hour helpers, not through local-input parsing.
   How to avoid: test the intended helper output directly and only convert to local-input format where the UI actually needs it.

2. **Project-aware defaults can overwrite user edits**
   In plain English: if the form recomputes project defaults too aggressively, the app can feel like it is fighting the user.
   Technical cause: project or stage changes trigger default recomputation, which can wipe manually entered date values.
   How to avoid: track custom-value flags separately from computed defaults and only reset them when the project or stage context truly changes.

3. **Recurrence without interval rules becomes vague**
   In plain English: saying “weekly” is not enough if the app cannot also say “every 2 weeks”.
   Technical cause: recurrence patterns alone do not capture spacing.
   How to avoid: always preserve a recurrence interval field, even in early local-first implementations.

4. **Calendar richness can pollute planner logic**
   In plain English: once events carry more metadata, it is tempting to let every field influence the planner.
   Technical cause: richer event models invite over-coupling.
   How to avoid: keep the planner dependent on a stable subset of fields and keep everything else as attached metadata for later phases.

## Why This Phase Matters Before Phase 7

Phase 7 is about:
- API clients
- sync event shape
- cache/query behavior
- PowerSync-style transport

That work would be risky if the local product model were still too thin.

Phase 6 reduces that risk because:
- calendar entities now have a stronger local contract
- task drafts now preserve more Motion-like structure
- scheduler outputs are more semantically meaningful
- the primary task-edit surface is now the richer composer, not an outdated input row

In plain English, Phase 6 made the app worth syncing more faithfully. There is less value in aligning transport if the thing being transported is still the wrong shape.

## Quick Reference

### What Phase 6 added

| Area | New capability | Why it matters |
|------|----------------|----------------|
| Calendar | Richer calendar and event normalization | Better parity with Motion's observed calendar model |
| Scheduler | Blocked/conflict/pending/unfit buckets | More honest planning feedback |
| Form | Full task composer | Replaces the old inline add-task row |
| Project defaults | Stage-aware suggested dates | New tasks now respect project context |
| Recurrence | Interval handling | Recurring work is stored with more structure |

### Main files

| File | Role |
|------|------|
| `apps/desktop/src/calendarService.js` | Normalizes richer calendar entities and events |
| `apps/desktop/src/scheduler.js` | Interprets scheduling semantics |
| `apps/desktop/src/taskService.js` | Converts form state into normalized task drafts |
| `apps/desktop/src/projectService.js` | Supplies stage-aware defaults for task creation |
| `apps/desktop/src/main.tsx` | Renders planner semantics and the full task composer |

## Going Deeper

### 1. Relative project dates and stage transitions

The next deeper topic is making task defaults respond not just to stage due dates but to relative project timing rules, definition templates, and project-transition events.

### 2. Calendar-driven scheduling heuristics

The scheduler now distinguishes better states, but it still is not fully aligned with Motion's remote intelligence or cache-backed scheduling decisions. That becomes more interesting once Phase 7 starts connecting local behavior to extracted API and sync models.

### 3. Form-state migration and draft persistence

The current composer now has much richer defaults. A future deep dive could document how local draft persistence should work if task creation needs unsaved drafts, autosave, or multistep editing behavior closer to the real app.

## What to Remember

- Calendar shape, scheduler semantics, and task creation defaults are one system.
- A Motion clone needs to interpret time, not just display it.
- Replacing the old quick-entry row was important because the richer task model needed a richer creation surface.
- Stage-aware defaults matter because project context is part of Motion's planning behavior.
- Phase 6 was the point where the app became much more believable as a planning product, not just as a styled productivity shell.

## Suggested Quiz Questions

1. Why was it important to separate blocked, conflicted, pending, and unfit tasks instead of keeping one generic conflict state?
2. What did the project-aware task-form defaults add that the Step 33 form still lacked?
3. Why would Phase 7 be risky if Phase 6 had not first improved calendar entities and task draft structure?

---

*Generated: 2026-04-25 | Project: motion | Phase: 6 | Key files: apps/desktop/src/calendarService.js, apps/desktop/src/scheduler.js, apps/desktop/src/taskService.js, apps/desktop/src/projectService.js, apps/desktop/src/main.tsx*
