# Motion Reverse-Engineering Findings

> What we know so far about the real Motion desktop app from package inspection, runtime files, signed-in state, logs, and cached account data.

---

## Scope

This document is the working findings log for the Motion reverse-engineering pass.

It is not the build plan.
It is not the clone spec.
It is the highest-signal record of what has actually been observed on this machine.

The goal:
- separate facts from guesses
- record what the real app is doing
- keep clone work tied to observed Motion behavior

Current environment:
- recon machine: Windows
- installed target: Microsoft-packaged Motion desktop app
- final clone target: macOS
- current account state: signed in

Latest authenticated recon date:
- `2026-04-23`

---

## Executive Summary

Motion is not just a thin wrapper around a website. The installed desktop app is a real Electron shell with meaningful desktop-only surfaces on top of the hosted web app.

After login, the runtime stopped looking like an empty shell and started exposing real product state. We can now see:
- authenticated user identity
- subscription state
- onboarding state
- connected Google account metadata
- cached agenda tasks
- workspace, project, stage, and task-definition data
- saved project/task view definitions
- user settings for scheduling, calendar display, conference defaults, and notetaker behavior
- Firebase-auth-shaped local identity artifacts
- persisted query-style caches in IndexedDB

The important shift is this: reverse engineering is now happening against real Motion product state, not placeholder startup state.

---

## Confirmed Install Facts

### Package identity

Observed Windows package:
- `MotionSoftware.Motion-ProjectsTasksandCalendar`

Installed executable:
- `C:\Program Files\WindowsApps\MotionSoftware.Motion-ProjectsTasksandCalendar_0.117.0.0_x64__t9nvwwj1p93w4\Motion - Projects, Tasks, and Calendar.exe`

Manifest facts:
- app display name: `Motion - Projects, Tasks, and Calendar`
- version: `0.117.0.0`
- publisher display name: `Motion Software`
- full-trust Windows desktop app
- startup task declared
- custom protocol registered: `motion-desktop`

### Package structure

Inside `resources\app`, the package exposes:
- `dist`
- `dist-electron`
- `node_modules`
- `resources`
- `package.json`

This matters because the Microsoft package is inspectable enough to map real shell structure instead of relying only on black-box behavior tracing.

---

## Desktop Architecture Findings

### Technology stack

From packaged `package.json`, Motion desktop is built with:
- Electron 36
- Vite
- React 19
- Tailwind 4
- `electron-store`
- `electron-log`

### Main split

The package clearly separates:
- Electron main process:
  - `dist-electron/main/index.js`
- Electron preload bridge:
  - `dist-electron/preload/index.cjs`
- front-end assets:
  - `dist/assets/App-*.js`
  - `dist/assets/appBar-*.js`
  - `dist/assets/tabs-*.js`

### What this tells us

Motion desktop is not "one window plus website".
It has separate desktop surfaces for:
- main window
- app bar
- tab bar
- option-space window
- tray integration
- deep-link handling

If we only clone the web pages, we will still miss a meaningful part of Motion.

---

## Hosted App Facts

### Base route

Observed hosted base URL:
- `https://app.usemotion.com`

Observed default main route:
- `https://app.usemotion.com/web/calendar`

### Confirmed network hosts seen locally

The runtime has touched:
- `https://app.usemotion.com`
- `https://internal.usemotion.com`
- `https://firestore.googleapis.com`
- `https://identitytoolkit.googleapis.com`
- `https://securetoken.googleapis.com`
- `https://amplitude.inmotion.app`
- `https://amplitudelab.usemotion.com`
- `https://o348473.ingest.sentry.io`
- `https://widget.intercom.io`
- `https://js.intercomcdn.com`
- `https://api-iam.intercom.io`
- `https://js.stripe.com`
- `https://m.stripe.com`
- `https://m.stripe.network`
- `https://lh3.googleusercontent.com`

### What this implies

At minimum, the runtime depends on:
- hosted web UI
- Motion internal backend
- Firebase auth and/or Firestore-backed state
- Google account/profile/calendar connectivity
- Stripe billing surfaces
- Intercom support or messaging
- Sentry error tracking
- Amplitude analytics and experiments

---

## Runtime Profile Location

### User package root

Observed package data root:
- `C:\Users\Pumba\AppData\Local\Packages\MotionSoftware.Motion-ProjectsTasksandCalendar_t9nvwwj1p93w4`

### Active runtime profile

Observed Chromium-style profile:
- `C:\Users\Pumba\AppData\Local\Packages\MotionSoftware.Motion-ProjectsTasksandCalendar_t9nvwwj1p93w4\LocalCache\Roaming\Motion`

### Confirmed runtime directories

Observed:
- `blob_storage`
- `Cache`
- `Code Cache`
- `Crashpad`
- `GPUCache`
- `IndexedDB`
- `Local Storage`
- `logs`
- `Network`
- `Session Storage`
- `WebStorage`
- `sentry`

### Important files

Observed:
- `motion-production.json`
- `Local State`
- `Preferences`
- `SharedStorage`
- `DIPS`

---

## Signed-In State Findings

### Cached identity

The signed-in cached desktop state now contains:
- `userEmail = gargig469@gmail.com`
- user id `VpUKgR09xfSYCKFCu14zQP8MQGX2`
- display name `Gargi Gupta`
- profile picture URL
- `hasActiveSubscription = true`
- `onboardingComplete = true`

These appeared in logs, `motion-production.json`, and IndexedDB-backed cached query state.

### Firebase auth artifact

IndexedDB contains an auth record with:
- uid
- email
- display name
- photo URL
- email verification state

There is also a literal persisted key starting with:
- `firebase:authUser:...`

That is strong evidence that Motion uses Firebase Auth or a Firebase-auth-shaped identity layer.

### Subscription and entitlement-adjacent state

Observed user and permission cache includes:
- `hasActiveSubscription = true`
- tier-like values in feature-permission data
- `featurePermissionTier` evidence in Local Storage analytics/cache strings

This suggests premium access is part of a richer account and permission model, not just a simple local boolean.

---

## Connected Account Findings

### Host email account

`motion-production.json` contains a connected host email account:
- provider type: `GOOGLE`
- email: `gargig469@gmail.com`
- name: `Gargi Gupta`
- calendar sync enabled: `true`
- email sync enabled: `false`
- status: `OK`

### Google scopes observed locally

Cached scopes include:
- calendar access
- Gmail send
- Gmail modify
- contacts read
- other contacts read
- user profile
- user email
- OpenID
- admin directory user readonly

### What this means

Motion stores enough local metadata for the desktop shell to know:
- which provider is connected
- whether calendar sync is enabled
- whether email sync is enabled
- which meeting defaults are available

This is not just a browser-cookie story. The desktop shell is caching structured account capability data.

---

## Theme and Desktop Preferences

### Theme

Current theme in cached desktop state:
- `dark`

Logs also show:
- `User requested update theme dark`
- `Theme changed to: dark`
- `Main window recreated with new theme`

This matters because it shows the desktop shell reacts to theme changes at the window level, not only inside the hosted page.

### Desktop app bar setting

Observed:
- `showTrayText = true`

Logs also show:
- tray title interval set
- tray text enabled

This is desktop-native behavior, not just a web preference.

---

## Shortcut Findings

### Logged shortcuts

Observed in `main.log`:
- `addTask = Alt+Space`
- `openCalendar = Alt+C`
- `openProjectManager = Alt+P`
- `openScheduler = Alt+A`

### Why this matters

These are real product-level shortcuts we should preserve at the intent level when cloning the desktop shell.

Even if the final macOS build changes modifier conventions later, the existence and purpose of the shortcuts are now confirmed.

---

## Tabs and Windowing Findings

### Cached tabs

Current cached tab state includes:
- one active tab
- URL: `https://app.usemotion.com/web/calendar`
- title: `Calendar - Motion`

### Logged desktop behavior

Observed in logs:
- tab bar creation
- tab bar bounds updates
- tab navigation events
- `tabs:get`
- `tabs:select`
- `tabs:add`
- `tabs:remove`
- `tabs:move`
- `tabs:navigate`

### Conclusion

Motion desktop has a first-class native tab shell, not just browser history.

That shell needs to be treated as part of the cloned product surface.

---

## App Bar Findings

### Confirmed app bar surface

From logs and packaged bundles, the app bar supports:
- open task
- open event
- create new item
- search
- complete task
- join event
- create quick meeting
- open event note
- note taker send/remove/joined/error flows

### Cached agenda data

The app bar now has real `agenda` data in `motion-production.json`.

Current agenda includes:
- tutorial/onboarding tasks
- recurring instances
- future scheduled tasks
- blocked tasks
- tasks with project/workspace references

### Grouping behavior

The app bar code and data confirm grouping around:
- ongoing
- upcoming
- timeless

---

## Task Model Findings

### Real task fields observed

From cached agenda tasks, we can confirm fields such as:
- `id`
- `createdTime`
- `updatedTime`
- `lastInteractedTime`
- `assigneeUserId`
- `createdByUserId`
- `deadlineType`
- `description`
- `duration`
- `name`
- `priorityLevel`
- `projectId`
- `statusId`
- `workspaceId`
- `dueDate`
- `isAutoScheduled`
- `isBusy`
- `isFixedTimeTask`
- `isUnfit`
- `needsReschedule`
- `scheduleId`
- `snoozeUntil`
- `scheduledStart`
- `scheduledEnd`
- `startOn`
- `type`
- `minimumDuration`
- `scheduledStatus`
- `estimatedCompletionTime`
- `deadlineStatus`
- `chunkIds`
- `blockingTaskIds`
- `blockedByTaskIds`
- `labelIds`
- `uploadedFileIds`
- `customFieldValues`
- `stageDefinitionId`
- `taskDefinitionId`

### Task types observed

Observed:
- `NORMAL`
- `RECURRING_INSTANCE`

### Scheduling-specific flags observed

Observed:
- `isAutoScheduled`
- `scheduledStatus`
- `scheduleOverridden`
- `needsReschedule`
- `ignoreWarnOnPastDue`
- `isFutureSchedulable`
- `manuallyStarted`

### Dependency fields observed

Observed:
- `blockingTaskIds`
- `blockedByTaskIds`
- `isBlocked`

This is a major finding.
It means Motion's task system is not just "task + due date + duration". It includes dependency and schedule-health semantics directly in the entity shape.

---

## Project and Workspace Findings

### Confirmed IDs

Observed live IDs:
- workspace id: `ws_o2deFuW813MLpSxxUpAiY4`
- onboarding/tutorial project id: `pr_BLt7vQJv4HR88TaEN3VfEQ`

### Project-related cached data

IndexedDB shows:
- project status definitions
- a project stage/status structure
- color values such as `#889096`
- auto-schedule setting markers
- member and role data

### Tutorial project structure observed

The signed-in cache includes a real onboarding project definition:
- project definition id: `pde_ZrmpWQfUGXVAXWnw6X8eFY`
- name: `Learn motion`
- description: `Learn how to use Motion for yourself and your team!`

Observed stage definitions:
- `Setup Motion`
- `Motion Basics`
- `Motion Advanced`

Observed tutorial task definitions:
- `Learn about Motion's Project Management Philosophy`
- `Connect your calendars`
- `Setup your work schedule`
- `Learn how to create tasks`
- `Learn how to create project templates`
- `Create your first 3 projects`
- `Setup Team Views`
- `Setup Dashboards`
- `Learn about AI in Motion`

### What the tutorial content exposes

These definitions are not just names. Their cached descriptions reveal real product flows:
- create tasks from the big blue `+ New` button
- type `/task` inside documents
- type `/project` inside documents
- create tasks from selected text with AI
- open `Settings` in the top-left and go to `Schedules`
- create project templates from settings or the new-project modal
- hover a workspace or folder and click `+`
- use the `Tutorials` section in main navigation

That makes the tutorial data unexpectedly valuable for reverse engineering because it exposes Motion's intended navigation model and product IA.

### Workspace-related findings

Cached settings and views reference:
- workspace-level defaults
- workspace-level task defaults
- workspace-level view grouping
- workspace-specific settings

Observed workspace metadata also includes:
- workspace name `My Tasks (Private)`
- workspace-scoped task defaults in user settings
- folder ids persisted in `folderState`

This suggests workspace is not just a UI grouping. It is part of the defaulting and permission model.

---

## Saved Views Findings

### Views observed in IndexedDB

Observed named views:
- `My Deadlines`
- `My Tasks`
- `Project Timelines`
- `Team Schedule`

### View definition findings

Cached view definitions include:
- type: `projects-and-tasks`
- grouping fields
- task filters
- project filters
- date range
- order rules
- layout type
- item type
- workspace grouping

Observed layout values include:
- `kanban`
- `gantt`

### Exact view shapes observed

`My Deadlines`
- private
- type `projects-and-tasks`
- groups by `deadline` by `day`
- date range `quarter`
- filters tasks to assignee `@me`
- filters to `isAutoScheduled = true`
- filters to `type = NORMAL`
- filters due date `>= now`
- excludes completed, canceled, and archived tasks
- sorts by `estimatedCompletionTime ASC`
- item type `tasks`
- layout `kanban`

`My Tasks`
- private
- groups by `deadline` by `week`
- filters to assignee `@me`
- includes completed and canceled tasks
- excludes archived tasks
- sorts by `scheduledStart ASC`
- item type `tasks`
- layout `kanban`

`Project Timelines`
- not private
- groups by `workspace`
- item type `projects`
- sort field `startDate ASC`
- layout `gantt`

`Team Schedule`
- not private
- groups by `scheduledDate` by `day`, then `user`
- does not hide empty groups
- filters task `estimatedCompletionTime` to `defined-relative = next-7-days`
- includes completed and canceled tasks
- excludes archived tasks
- sorts by `estimatedCompletionTime ASC`
- item type `tasks`
- layout `kanban`

### Why this matters

This is one of the strongest product-structure clues so far.

Motion does not appear to treat these screens as hard-coded pages only.
It appears to model them as saved view definitions with query-like filter and layout state.

That could materially change how we rebuild the clone.

---

## User Settings Findings

### Confirmed settings groups

IndexedDB cached settings show groups for:
- timezones
- auto-schedule settings
- onboarding
- conference settings
- folder state
- task default settings
- calendar display settings
- sidebar display settings
- notetaker settings

### Notable values observed

Observed:
- default timezone: `Asia/Kolkata`
- `taskBreaksEnabled = true`
- `taskBreakDuration = 30`
- `taskBreakIntervalHours = 4`
- `taskTimeBlockMode = no-events`
- `showTaskNamesInEvents = true`
- `showTasksInCalendar = true`
- `showScheduledPastDueTasks = false`
- `showRecurringPastDueTasks = false`
- `showProjectedEntities = true`
- selected calendar view: `3-day`
- onboarding latest screen: `choose_theme`
- `isOnboardingComplete = true`
- conference type default: `meet`
- `zoomLinkType = manual`
- `enableBotForAllMeetings` observed as both `true` and `false` across cached snapshots
- `sendRecapToAllAttendees` observed as both `true` and `false` across cached snapshots
- CTA dismissals cached for `DISMISSED_DESKTOP_APP_DOWNLOAD_PROMPT` and `NOTETAKER_ONBOARDING_ALERT`
- `folderState` persists expanded folder ids like `fol_94juvZvzFjX3BUcCJZHeFx`, `fol_r4SwHrAnYfJ6um8ChUYhBs`, and `foi_WcWFfcB6BwyQ19CL3kEftu`

### Interpretation

Motion is caching detailed, structured user settings in a query/state layer, not scattering everything across random local keys.

That suggests the clone should eventually model settings as domain entities, not just convenience toggles.

---

## Onboarding Findings

### Signed-in onboarding state

Observed:
- `onboardingComplete = true` in user cache
- `isOnboardingComplete = true` in settings cache
- `didSkipOnboarding = false`
- `onboardingCompletedSurvey = false`
- `onboardingLatestScreen = choose_theme`
- `onboardingVersion = 2`

### Meaning

Motion tracks onboarding in more than one place:
- high-level account/user state
- detailed per-user settings cache

That means onboarding is part of the persistent product model, not just a temporary first-run flow.

---

## Calendar Findings

### Connected calendar capability

Observed:
- Google host account
- calendar sync enabled
- default conference type set to `meet`
- calendar list query cache present
- calendar display settings present

### Calendar query findings

Observed query key:
- `["uncached_calendar_list"]`

Observed cache state:
- `status = success`
- `fetchStatus = idle`
- `dataUpdateCount` present
- `calendarList` object present in IndexedDB

That confirms Motion is caching calendar-list state locally after auth, even though the current extracted strings do not yet expose a clean human-readable calendar item list.

### Calendar display settings

Observed:
- `showProjectedEntities = true`
- selected view: `3-day`
- `showTasksInCalendar = true`

### What is still missing

We still need:
- real imported event entity shapes
- calendar list content
- event edit flows
- event conflict behavior
- booking flow mapping

The account is connected enough now that those should be obtainable in the next recon pass.

---

## Inbox Findings

### What is confirmed

We have strong evidence that inbox exists as a first-class product surface:
- inbox routes and related UI strings appear in bundled assets
- desktop logs reference inbox badge behavior
- folder state is persisted locally

### What is not yet extracted cleanly

We do not yet have a clean inbox-item payload from IndexedDB or Local Storage on this account.

Current interpretation:
- the inbox may simply not have populated entities yet
- or its cached representation is not easily visible from current string extraction

That makes inbox one of the clearest remaining recon gaps.

---

## Auth and Data-Layer Findings

### Firebase-like evidence

Strong evidence now points to Firebase components:
- authUser cache entry
- literal persisted key starting with `firebase:authUser:...`
- `identitytoolkit.googleapis.com`
- `securetoken.googleapis.com`
- `firestore.googleapis.com`
- bundle strings referencing `fire-auth` and `fire-fst`

### Query cache model evidence

IndexedDB is not storing arbitrary blobs only. It is clearly persisting named query results and model payloads.

Observed query keys include:
- `["v2","users","me","settings"]`
- `["v3","views"]`
- `["uncached_calendar_list"]`
- `["v2","workspaces", {...}]`

That strongly suggests a structured client cache layer, likely a query library with persisted results, sitting alongside Firebase-auth state.

### Practical implication

Motion appears to use a mix of:
- Motion-hosted app/backend
- Firebase auth/cache/query infrastructure
- local IndexedDB query persistence

This is one of the most important findings in the entire recon effort.

It means the app's local state is not just hand-rolled JSON.
It is likely tied to a query-caching layer and Firebase-backed session model.

---

## Analytics and Support Findings

### Confirmed telemetry/support layers

Observed:
- Sentry
- Amplitude
- Intercom

### Experiment and flag evidence

Observed:
- `desktop-app-bar-m1`
- experiment exposure entries in Local Storage
- Amplitude experiment-related cache entries

### What this means

Feature rollout and behavior may vary by:
- signed-in user
- experiment group
- feature permission tier

We should expect some behavior to be controlled by remote flags.

---

## What Changed After Login

Before login, the shell mostly showed:
- empty tabs
- empty agenda
- `userEmail = null`
- shell startup and desktop IPC only

After login, the runtime now shows:
- real user identity
- subscription state
- onboarding state
- Google account metadata and scopes
- real tasks in agenda
- workspace and project references
- tutorial project, stage, and task definitions
- saved views
- user settings
- cached calendar-list query state
- Firebase-like auth artifacts
- authenticated network hosts

This is the clearest point where reverse engineering became worth doing at the data-model level.

---

## Highest-Confidence Findings

These are the findings I would treat as solid right now:

1. Motion desktop is a real Electron desktop shell with separate tab, app-bar, tray, and option-space surfaces.
2. The hosted app lives at `app.usemotion.com`, but the desktop app adds meaningful native behavior on top.
3. The runtime uses a Chromium-style local profile with IndexedDB, Local Storage, logs, and desktop config JSON.
4. Signed-in state is cached locally in structured form, including user identity, account capabilities, agenda tasks, views, and settings.
5. Firebase auth/query infrastructure is very likely part of the stack.
6. Motion tasks include schedule semantics and dependency semantics directly in the task model.
7. Motion views appear to be data-driven saved definitions, not only hard-coded screens.
8. Calendar, scheduling, onboarding, conference defaults, CTA dismissals, and notetaker settings are all part of cached user settings.
9. Tutorial project definitions leak real navigation and creation flows, which makes them useful reverse-engineering evidence.

---

## Open Questions

These still need direct recon:

1. What do full event entities look like once calendar events themselves, not just `calendarList`, are cached locally?
2. How much of task/project state lives in IndexedDB cache versus direct runtime JSON?
3. Which endpoints are Motion-owned versus Firebase-owned for specific product actions?
4. Are saved views server-backed, client-defined, or hybrid?
5. How are recurring tasks fully modeled beyond instance-level fields?
6. How does inbox data look in local storage when populated?
7. Which premium features are enforced by feature permissions versus subscription flags?
8. What is the exact shape of workspace memberships, roles, and collaborative entities?

---

## Implications For The Clone

### What this invalidates

These findings weaken the earlier build-from-scratch direction:
- inventing local-only storage models first
- assuming tasks are simple records
- assuming the shell is mostly cosmetic
- treating views as fixed pages only
- postponing reverse engineering until later

### What this suggests instead

The clone should likely be rebuilt around:
- a desktop shell layer
- a richer task and scheduling entity model
- view-definition-driven screens
- explicit workspace, project, task, and user-settings domains
- a sync/auth strategy shaped by observed Motion behavior, not convenience

### Mac target note

These findings are still valuable for the macOS clone because most of them are product and data-model findings, not Windows-only shell quirks.

Windows is currently our behavior oracle.
Mac should be the final shell-polish pass.

---

## Next Recommended Recon

Highest-value next actions:

1. Inspect populated calendar event data after sync settles or after opening calendar-heavy views.
2. Capture inbox-local state once the inbox has visible data.
3. Map screen-by-screen flows while signed in:
   - Calendar
   - Inbox
   - Projects
   - Tasks
   - Settings
4. Identify which local caches correspond to:
   - user settings
   - views
   - tasks
   - projects
   - workspace state
5. Trace authenticated request patterns for:
   - task mutation
   - project creation
   - calendar sync
   - recurring tasks
   - notetaker / quick meeting

---

## Supporting Files

Related research files:
- `C:\Users\Pumba\developer\plans\motion-reverse-engineering-clone.md`
- `C:\Users\Pumba\developer\motion-research\feature-map.md`
- `C:\Users\Pumba\developer\motion-research\clone-spec.md`
- `C:\Users\Pumba\developer\motion-research\storage-map.md`
- `C:\Users\Pumba\developer\motion-research\network-map.md`
- `C:\Users\Pumba\developer\motion-research\manual-next-steps.md`

---

Generated: `2026-04-23`
