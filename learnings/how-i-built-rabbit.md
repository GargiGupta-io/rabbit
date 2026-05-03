# How I Built Rabbit

> This is the single best document to read if you need to explain how Rabbit was built, what was reverse-engineered from Motion, what was reimplemented in our own codebase, and what still remains before it becomes a fully shipped Mac app.

---

## One-Sentence Version

I built Rabbit by first creating a working local planning baseline, then pivoting into a reverse-engineering-led rebuild where the real Motion desktop app became the source of truth for shell behavior, task structure, calendar behavior, sync shape, and packaging expectations.

---

## The Short Version You Can Say Out Loud

If someone asks, "How did you build this?", the clean answer is:

"I did not just design a planner from scratch and call it Rabbit. I first built a usable baseline, then I reverse-engineered the real Motion desktop app on Windows, studied its shell, local state, cached data, extracted code assets, API shapes, sync structure, and UI patterns, and then rebuilt my repo phase by phase so Rabbit matched Motion much more closely. After the product behavior matched well enough, I added the native shell, Mac-facing polish, hardening, and a real packaging path."

That is the high-level story.

The rest of this document is the detailed version.

---

## What This Project Actually Is

This repo is not just "a productivity app inspired by Motion."

It is a **reverse-engineering-led Rabbit project**.

That matters because there are two very different ways people build clones:

1. They copy the broad idea and invent the rest.
2. They study the real product deeply and rebuild around observed behavior.

This project moved from the first approach toward the second one.

At the end of the work so far, the repo is best described as:

- Rabbit,
- built in our own codebase,
- driven by reverse-engineering evidence,
- with macOS as the final product target,
- using Windows Motion as the main behavior oracle during recon.

---

## The Most Honest Timeline

### Stage 1: I built a baseline app first

At the very beginning, the repo did not start with deep reverse engineering.

It started as a practical desktop productivity app baseline:

- repo scaffold,
- local task logic,
- persistence,
- scheduler baseline,
- entitlement guards,
- desktop shell placeholder.

That work lives in historical Phases 0 to 3.

It was not wasted work. It gave the project:

- a functioning codebase,
- a place to integrate later findings,
- tests,
- storage contracts,
- and release-oriented structure.

But it was not yet the true Rabbit product we wanted.

### Stage 2: I realized the baseline structure was too generic

Once we inspected the real Motion app more seriously, it became obvious that the repo shape was still too custom.

The main problem was not that the code was broken. The problem was that the **product structure** was wrong.

Motion was clearly richer in:

- shell behavior,
- tab and app-bar behavior,
- saved views,
- agenda state,
- task schema,
- workspace/project/stage relationships,
- calendar modeling,
- sync and cache behavior,
- native shell behavior.

So continuing to build "our own planner" would have pushed the codebase further away from Motion, not closer.

### Stage 3: I pivoted into a reverse-engineering-led rebuild

That was the key turning point.

Instead of continuing the old architecture blindly, I reset the roadmap so the real Motion app became the product source of truth.

From that point onward, the project used:

- authenticated local Motion data,
- extracted shell logic,
- extracted sync DTOs,
- extracted API definitions,
- extracted UI logic,
- observed view structures,
- observed task/project graphs,
- observed calendar/account state,
- observed native shell behavior,
- and reverse-engineering notes from the research docs.

That pivot is the reason the later phases matter so much more for clone fidelity.

---

## What I Reverse-Engineered

The reverse-engineering work was not random poking around. It had several structured layers.

### 1. Installed app inspection

I inspected the installed Motion desktop package on Windows and confirmed that it was not just an opaque black box.

I learned:

- the package identity,
- the install path,
- the shell technology,
- the package structure,
- the existence of desktop-only shell layers,
- and the runtime relationship between the local shell and hosted web app.

This showed that Motion was a hybrid desktop app, not just a web page in a window.

### 2. Runtime file and cache inspection

After signing in, I inspected local runtime storage and cached product data.

That revealed real, useful product structure such as:

- account state,
- subscription state,
- onboarding state,
- connected Google account metadata,
- agenda snapshots,
- workspace/project/stage/task-definition graphs,
- saved views,
- user settings,
- query-style caches,
- and auth-shaped local artifacts.

This was one of the biggest breakthroughs because it moved the project from guessing to observing.

### 3. Extracted code-asset analysis

Inside the repo, we now have extracted Motion code assets under:

- `developer/motion-research/CODE_ASSETS/API_DEFINITIONS`
- `developer/motion-research/CODE_ASSETS/SHELL_LOGIC`
- `developer/motion-research/CODE_ASSETS/SYNC_ENGINE`
- `developer/motion-research/CODE_ASSETS/UI_LOGIC`
- `developer/motion-research/CODE_ASSETS/UI_SKIN`

Those assets gave us direct clues about:

- shell IPC channels,
- task models,
- sync events,
- API wrapper structure,
- view contracts,
- task form logic,
- calendar logic,
- component structure,
- and design-token direction.

This is what let the rebuild become much more exact.

### 4. Behavior-first product mapping

I also mapped Motion as a product, not just as code.

That means I studied:

- screens,
- navigation,
- task flows,
- views,
- inbox behavior,
- agenda behavior,
- calendar behavior,
- native shell behavior,
- and release packaging expectations.

That matters because clones fail when they copy internals without understanding the actual user experience.

---

## The Most Important Research Docs

If you need to explain where the clone came from, these are the highest-value source docs:

- [findings.md](/C:/Users/Pumba/Documents/codex/Motion/developer/motion-research/findings.md)
- [FINAL_REPORT.md](/C:/Users/Pumba/Documents/codex/Motion/developer/motion-research/FINAL_REPORT.md)
- [ENGINEERING_LEARNINGS.md](/C:/Users/Pumba/Documents/codex/Motion/developer/motion-research/ENGINEERING_LEARNINGS.md)
- [clone-spec.md](/C:/Users/Pumba/Documents/codex/Motion/developer/motion-research/clone-spec.md)
- [repo-gap-analysis.md](/C:/Users/Pumba/Documents/codex/Motion/developer/motion-research/repo-gap-analysis.md)

These explain:

- what Motion actually is,
- what we learned from the installed app,
- what structures mattered most,
- how far the old repo was from real Motion,
- and why the roadmap had to be reset.

---

## The Rebuild Strategy

After the reverse-engineering pivot, I rebuilt the app in a deliberate order.

This order was important because you cannot get a close clone by polishing the wrong foundation.

The rebuild phases were:

1. Shell parity
2. Task/project/view/inbox parity
3. Calendar/scheduler/form parity
4. API/sync/cache parity
5. Native desktop/mac parity and hardening
6. Packaging and release setup

That sequence mirrors how Motion actually works:

- first the shell,
- then the domain model,
- then scheduling and forms,
- then transport and cache,
- then native shell behavior,
- then packaging and shipping path.

---

## Phase-by-Phase Explanation

### Phases 0 to 3: Foundation Work

These phases created the starting codebase.

Main outcomes:

- repo scaffold,
- app shell baseline,
- local task engine,
- persistence,
- scheduler primitives,
- entitlement guards,
- sync outbox baseline,
- calendar overlay baseline.

What to say about them:

"The early phases gave me a working desktop planner foundation. They were useful engineering groundwork, but they were not yet Rabbit as a convincing Motion-derived product. Once the reverse-engineering evidence got strong enough, I treated those phases as baseline infrastructure rather than final product truth."

### Phase 4: Shell parity

This was the first major rebuild phase after the roadmap reset.

Goal:

- replace the generic planner page with a Motion-like desktop shell.

Main outcomes:

- sidebar,
- tabs,
- central view surface,
- right rail,
- shell state model,
- Motion-like dark visual structure,
- view-driven navigation.

Why it mattered:

Motion does not feel like a simple page with widgets on it. It feels like a desktop shell with persistent navigation and view structure. Rebuilding the shell first made later parity much easier.

Main learning doc:

- [phase-4-shell-parity-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-4-shell-parity-deeplearn.md)

### Phase 5: Task, project, view, and inbox parity

Goal:

- align the repo's core product entities with Motion's observed domain model.

Main outcomes:

- richer task schema,
- workspace and project graph,
- stage and task-definition structure,
- real saved-view runtime definitions,
- inbox shell surface.

Why it mattered:

Motion is not just a list of tasks. It is a layered product model where tasks sit inside workspaces, projects, stages, views, and inbox flows. This phase made the domain model much more authentic.

Main learning doc:

- [phase-5-domain-parity-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-5-domain-parity-deeplearn.md)

### Phase 6: Calendar, scheduling, and form parity

Goal:

- align calendar entities, scheduler semantics, and task-creation behavior with Motion.

Main outcomes:

- richer calendar models,
- better scheduling semantics,
- blocked/unfit/pending-reschedule handling,
- fuller task composer,
- project-aware defaults,
- recurrence and scheduling form behavior.

Why it mattered:

Motion's main value is not just storing tasks. It is organizing time. This phase moved the app closer to Motion's real planning behavior.

Main learning doc:

- [phase-6-calendar-scheduling-form-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-6-calendar-scheduling-form-deeplearn.md)

### Phase 7: API, sync, and cache parity

Goal:

- align the app's transport and state layers with extracted Motion contracts.

Main outcomes:

- typed client wrappers,
- Motion-shaped sync events,
- PowerSync-style upload and reconciliation,
- query-cache persistence,
- bootstrap/cache alignment.

Why it mattered:

By this point the UI could look and feel closer to Motion, but the internal data movement also had to match more closely. This phase made the app behave more like Motion under the hood, not just on the screen.

Main learning doc:

- [phase-7-api-sync-cache-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-7-api-sync-cache-deeplearn.md)

### Phase 8: Native desktop, Mac parity, and hardening

Goal:

- move from product parity toward real desktop-native fidelity.

Main outcomes:

- desktop shell bridge,
- desktop actions and tab behavior,
- Mac-facing platform profile,
- hardening of shell and release assumptions,
- tighter native surface.

Why it mattered:

An exact clone is not only about tasks and views. It is also about how the app behaves as a desktop product. This phase made the app feel more like a real desktop client and not just a browser-like shell.

Main learning doc:

- [phase-8-native-desktop-mac-hardening-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-8-native-desktop-mac-hardening-deeplearn.md)

### Phase 9: Packaging, native build lane, and release setup

Goal:

- create a real path from source code to a packageable desktop artifact.

Main outcomes:

- real `apps/desktop/dist/` output,
- Tauri-aligned build entrypoints,
- native preflight,
- dry-run packaging path,
- Mac CI packaging scaffold,
- packaging smoke-check contract.

Why it mattered:

Until this phase, the app could be developed and tested but not honestly described as having a real release path. This phase created that release path while staying honest about the remaining native limitations.

Main learning doc:

- [phase-9-packaging-native-build-release-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-9-packaging-native-build-release-deeplearn.md)

---

## What I Actually Built Versus What I Studied

This is one of the most important distinctions in the whole project.

### What I studied from the real Motion app

I studied:

- product structure,
- shell layout,
- tabs and app-bar behavior,
- task schema,
- workspace/project/stage model,
- saved views,
- inbox shape,
- calendar data shape,
- scheduler semantics,
- task-form behavior,
- API wrappers,
- sync DTOs,
- cache behavior,
- native shell patterns,
- packaging and release expectations.

### What I built in my own repo

I built:

- my own shell state and shell UI,
- my own task/project/view/calendar models,
- my own client wrappers,
- my own sync and cache layer,
- my own native shell bridge,
- my own Tauri packaging setup,
- my own tests,
- my own documentation and release structure.

So this is not a copy of Motion's source code.

It is a **reimplementation**, but one guided by reverse-engineering evidence so that the product shape becomes much closer to Motion than a generic planner would be.

---

## The Final Architecture in Simple Terms

If you need to explain the app technically, the cleanest summary is this:

### 1. Shell layer

This layer controls:

- sidebar,
- tabs,
- view selection,
- right rail,
- desktop actions,
- native shell bridge behavior.

Key files:

- [main.tsx](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/main.tsx)
- [shellService.js](/C:/Users\Pumba/Documents/codex/Motion/apps/desktop/src/shellService.js)
- [desktopShellBridge.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/desktopShellBridge.js)
- [desktopPlatform.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/desktopPlatform.js)

### 2. Domain layer

This layer models:

- tasks,
- workspaces,
- projects,
- stages,
- task definitions,
- views,
- inbox state,
- identity defaults.

Key files:

- [taskService.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/taskService.js)
- [projectService.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/projectService.js)
- [state.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/state.js)
- [fixtures.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/fixtures.js)

### 3. Planning layer

This layer handles:

- scheduler logic,
- calendar overlay logic,
- schedule summaries,
- blocked/unfit/conflict states,
- task-form defaults and planning context.

Key files:

- [scheduler.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/scheduler.js)
- [calendarService.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/calendarService.js)

### 4. Transport and persistence layer

This layer handles:

- storage contracts,
- persisted state,
- client wrappers,
- sync events,
- upload reconciliation,
- local cache and bootstrap state,
- entitlement state.

Key files:

- [storage.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/storage.js)
- [contracts.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/contracts.js)
- [tasksClient.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/tasksClient.js)
- [viewsClient.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/viewsClient.js)
- [calendarClient.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/calendarClient.js)
- [inboxClient.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/inboxClient.js)
- [bootstrapClient.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/bootstrapClient.js)
- [syncContract.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/syncContract.js)
- [syncClient.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/syncClient.js)
- [entitlement.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/entitlement.js)
- [entitlementClient.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/entitlementClient.js)

### 5. Native packaging layer

This layer handles:

- frontend bundle generation,
- Tauri native build wiring,
- native preflight,
- CI packaging scaffold,
- packaging verification docs.

Key files:

- [build.mjs](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/scripts/build.mjs)
- [native-preflight.mjs](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/scripts/native-preflight.mjs)
- [native-build.mjs](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/scripts/native-build.mjs)
- [tauri.conf.json](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src-tauri/tauri.conf.json)
- [Cargo.toml](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src-tauri/Cargo.toml)
- [build.rs](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src-tauri/build.rs)

---

## How I Can Explain the Build Process to Someone

If someone asks for a more detailed but still clear explanation, this is a good version:

"I first built a usable local desktop planning app so I had a real codebase to work with. Then I realized that if I kept expanding that codebase on intuition alone, it would drift away from Motion. So I pivoted into a reverse-engineering-led process. I studied the installed Motion desktop app, inspected local runtime files and signed-in caches, analyzed extracted shell, sync, API, and UI assets, and then rebuilt my repo phase by phase around that evidence. I first matched the shell, then the domain model, then calendar and scheduling behavior, then API and sync structure, then native desktop behavior, and finally the packaging path. The result is not a copied codebase. It is a reimplementation whose architecture and behavior are much more tightly aligned to Motion because the rebuild was driven by observed evidence instead of guesswork."

---

## What Makes This Better Than Just Building a Planner From Scratch

The main difference is fidelity.

A planner built from scratch can still be good software, but it will usually differ from Motion in:

- shell structure,
- view model,
- agenda behavior,
- project/task graph,
- scheduler semantics,
- API shapes,
- cache structure,
- desktop-specific behavior.

This project is closer because the rebuild was anchored to:

- real Motion data,
- real Motion structures,
- real Motion shell clues,
- and real Motion transport patterns.

That means the clone is not just similar in broad idea. It is similar in **product shape**.

---

## What Is Still Not Finished

The biggest remaining gap is not product parity. It is release completion.

Right now, the repo has:

- a real frontend desktop bundle,
- a native preflight path,
- a dry-run native build path,
- a Mac CI packaging scaffold,
- and packaging smoke-check docs.

But it still does not have a final shipped Mac artifact because:

- `rustc` is not installed on this machine,
- `cargo` is not installed on this machine,
- `cargo-tauri` is not installed on this machine,
- final Apple signing credentials are not wired,
- notarization is still not implemented end to end,
- and real `.app` / `.dmg` packaging still needs a Rust-enabled Mac host or CI runner.

So if someone asks "Is the app fully shipped?", the honest answer is:

"The product build is strong, the clone structure is strong, and the packaging path is real, but the final Mac release lane still needs the actual Rust-and-Apple packaging environment."

---

## If Someone Asks "Was It Really Reverse-Engineered?"

The cleanest answer is:

"Yes, but in a product- and architecture-led way. I studied the installed Motion desktop app, its local runtime state, authenticated caches, extracted shell and sync logic, API definitions, and UI logic. Then I used those findings to rebuild my own app structure and behavior much more closely around Motion. I did not just eyeball the design and invent the rest."

That is the strongest honest answer.

---

## If Someone Asks "Did You Copy Their Code?"

The cleanest answer is:

"No. I reimplemented the clone in my own repo. What I used from reverse engineering was the product structure, behavior, data shape, shell patterns, transport direction, and release expectations. The code in this repo is our own implementation, but it was shaped by detailed evidence from the real Motion app."

That distinction matters and you should keep it clear.

---

## The Best Docs to Read Next

If someone wants the whole story at different depths, I would point them here:

### For the whole roadmap

- [planning.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/planning.md)

### For the exact execution history

- [steps.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/steps.md)

### For the recon evidence

- [findings.md](/C:/Users/Pumba/Documents/codex/Motion/developer/motion-research/findings.md)
- [FINAL_REPORT.md](/C:/Users/Pumba/Documents/codex/Motion/developer/motion-research/FINAL_REPORT.md)
- [ENGINEERING_LEARNINGS.md](/C:/Users/Pumba/Documents/codex/Motion/developer/motion-research/ENGINEERING_LEARNINGS.md)

### For the deep technical phase explanations

- [phase-4-shell-parity-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-4-shell-parity-deeplearn.md)
- [phase-5-domain-parity-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-5-domain-parity-deeplearn.md)
- [phase-6-calendar-scheduling-form-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-6-calendar-scheduling-form-deeplearn.md)
- [phase-7-api-sync-cache-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-7-api-sync-cache-deeplearn.md)
- [phase-8-native-desktop-mac-hardening-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-8-native-desktop-mac-hardening-deeplearn.md)
- [phase-9-packaging-native-build-release-deeplearn.md](/C:/Users/Pumba/Documents/codex/Motion/learnings/phase-9-packaging-native-build-release-deeplearn.md)

---

## The Clearest Final Summary

If I had to explain the whole project in one paragraph, I would say this:

"I started with a working desktop planning baseline, then pivoted into a reverse-engineering-led rebuild once I had enough evidence from the real Motion app. I used the installed app, authenticated local state, extracted shell logic, extracted task and sync models, API definitions, and UI logic as the source of truth, and then rebuilt my repo in phases: shell parity, domain parity, calendar and scheduling parity, API and sync parity, native desktop parity, and finally packaging and release setup. So the app was not built by guessing what Motion might do. It was rebuilt around observed Motion behavior and structures, then hardened and prepared for a real Mac release path."

---

*Created: 2026-04-28 | Project: Motion | Purpose: single talking doc for explaining how the clone was built end to end*
