# Phase 10 - Windows Product Polish Deep Learn

> This phase turned Rabbit from a working reverse-engineered prototype into a calmer Windows product surface that feels closer to something a customer could actually use every day.

---

## In Plain English

Before this phase, Rabbit already had the real product skeleton: the shell, the task and project model, the agenda rail, inbox state, local-first sync, a live backend path, and a browser preview that could talk to the local backend. The problem was not missing architecture anymore. The problem was product finish.

The app still looked like an internal build in too many places. It exposed copy that talked about parity work and backend plumbing, it showed more state than a customer should see, and the main surfaces still spent too much room explaining themselves instead of showing work. This phase fixed that by tightening the product surface rather than adding another big system.

The important shift is that this was not a random visual cleanup. The work used the real Motion research already stored in the repo as a boundary for what should remain visible: customer-facing navigation, saved views, task creation, agenda, inbox, and sync status. Anything that felt like scaffolding, transport diagnostics, or engineering proof was either removed from the default surface or hidden behind debug mode.

By the end of the phase, Rabbit was still the same product under the hood, but it presented itself differently. The shell became quieter, task and rail cards became denser, success and failure states sounded more like product language, and the major flows were verified end to end against the live local backend. That is why this phase matters: it changed the user-facing truth of the app, not just its code organization.

## What This Phase Was Really Solving

The repo had already crossed the “can it work?” line. What it had not yet crossed was the “would a customer trust this surface?” line.

That trust gap showed up in four ways:

1. Too much visible internal state
   The app was still surfacing terms like backend runtime, cache state, and parity-oriented wording that made Rabbit feel like a test harness.

2. Too much visual competition
   The shell, tabs, rail, composer, task cards, agenda, and inbox all wanted attention at the same time. That made the product feel busy even when the data itself was not large.

3. Too much repeated information
   Several surfaces restated counts, metadata, and descriptive text that the user had already understood from layout context or badge state.

4. No hard finish line
   Without an explicit cut, every missing Motion-adjacent feature could keep the polish phase open forever.

This phase solved those problems directly instead of opening new parity branches prematurely.

## What Was Built

This phase was executed step by step rather than in one large batch. The work split cleanly into surface cleanup, density work, real QA, edge-state polish, and explicit closeout.

### 1. Customer shell cleanup

Rabbit removed prototype and parity-flavored copy from the visible shell and hid entitlement diagnostics by default behind `?debug=1`.

What this changed in practice:

- the shell stopped narrating internal build state
- the task composer stopped dumping every control at once
- customer-facing copy became simpler and shorter

Key file:

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)

### 2. Customer sync status

The sync area stopped acting like a transport dashboard and started acting like a product status card.

What this changed:

- visible sync messaging focused on saved state, pending changes, and last successful save
- backend and entitlement detail stayed available only in debug mode
- the right rail stopped showing low-value transport language to normal users

Key file:

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)

### 3. Shell hierarchy simplification

The sidebar, top actions, tabs, filter row, and right rail were tightened so the shell would stop competing with the content area.

What this changed:

- smaller spacing and calmer rhythm in the sidebar
- reduced secondary labels
- quieter tab chrome
- lighter header actions
- narrower right rail

Key file:

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)

### 4. Content surface tightening

The work surfaces themselves were simplified after the shell was under control.

What this changed:

- task cards lost filler text and unnecessary repeated metadata
- the view header became quieter
- the agenda and inbox cards became denser
- inbox status language became shorter
- the composer spacing was tightened

Key file:

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)

### 5. Live flow QA against the local backend

The phase did not stop at “looks cleaner.” Rabbit was exercised against the real local runtime path:

- preview served from `http://127.0.0.1:4173`
- backend served from `http://127.0.0.1:8787`
- create task
- push outbox
- refresh remote
- complete task
- push again
- delete task
- refresh again

That QA pass proved that the phase had not cosmetically polished the shell while quietly breaking the core loop.

### 6. Edge-state polish

The app’s fallback language and transient states were then cleaned up.

What this changed:

- empty states sounded calmer
- refresh and push states sounded more product-like
- backend failure wording became less technical
- waiting states became more explicit and easier to understand

Key files:

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)
- [state.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/state.js)
- [shellService.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/shellService.js)

### 7. Explicit finish-line definition

The phase ended with a real decision note instead of a vague “more polish later” promise.

Key file:

- [rabbit-windows-polish-finish-line.md](C:/Users/Pumba/Documents/codex/rabbit/learnings/rabbit-windows-polish-finish-line.md)

This note says what counts as done for the Windows polish phase and, just as importantly, what is intentionally deferred:

- Mac-native validation
- packaging/signing/notarization
- account/workspace depth
- fuller calendar/event authoring
- broader utility parity
- collaboration depth
- production backend hardening

## The Core Design Decision

The most important design decision in this phase was to treat Rabbit as a product surface problem, not an architecture problem.

That sounds simple, but it matters. The repo already had enough architecture to justify endless refactors. Doing that would have delayed the real goal, which was to make the current product surface feel less cluttered and more deliberate. The right move was to reuse the existing shell and domain work, not restart it.

This decision also kept the phase bounded:

- no large state refactor
- no new backend expansion
- no new Mac packaging work
- no fake Motion features added just to fill visual gaps

That restraint is part of the value of the phase.

## Motion-Specific Lessons

The Motion research mattered here in a different way than in the parity phases.

Earlier phases used Motion as a source of truth for:

- data shapes
- shell responsibilities
- view models
- sync and API direction
- scheduling semantics

This phase used Motion as a source of truth for subtraction.

That means the useful question was no longer “what features should Rabbit add?” It was:

- what should still be visible?
- what is customer-facing versus engineering-facing?
- what density level feels closer to Motion’s calmer product rhythm?

That is an important lesson for future parity work. Reverse-engineering is not only about adding missing systems. It is also about deciding what not to show.

## Why the Local Backend Still Matters

One of the best choices in this phase was not treating the backend as “later.”

The local backend already existed, so the polish pass used it. That mattered because product polish can easily become fake if it only happens against static local state. Real flow validation forced Rabbit to prove:

- refresh language makes sense after a real refresh
- push language makes sense when outbox changes actually move
- task cards remain coherent after remote reconciliation
- inbox and agenda still read correctly after task mutations

This kept the phase honest.

## What Changed in the Finish Definition

Before the finish-line note, “finished” could have meant anything:

- more Motion parity
- more backend hardening
- Mac packaging
- collaboration depth
- utility features

After the note, “finished” for this phase now means something narrower and more useful:

- the visible product surface is customer-facing
- the main task loop works live on Windows
- edge states are calm enough to stop feeling like a prototype

That finish definition is what lets the project move forward cleanly into the next branch instead of circling this polish pass forever.

## Files That Matter Most

If someone wants to understand this phase quickly, these are the key files:

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)
  This is where most visible shell, task, agenda, inbox, sync, and transient-state polish landed.

- [state.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/state.js)
  This is where the inbox empty-state summary and customer-facing runtime summaries still converge.

- [shellService.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/shellService.js)
  This is where saved-view empty states and shell-facing view metadata stay aligned with the calmer product tone.

- [rabbit-windows-polish-finish-line.md](C:/Users/Pumba/Documents/codex/rabbit/learnings/rabbit-windows-polish-finish-line.md)
  This is the explicit scope boundary for what was closed here and what was deferred.

## Verification That Closed the Phase

The phase close was not based on visual confidence alone.

Verification covered:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run test`
- `npm.cmd run desktop:build`
- live preview at `http://127.0.0.1:4173`
- live backend at `http://127.0.0.1:8787`
- create/complete/delete/push/refresh flow validation

That combination matters because it proves both:

- repo health
- real product-loop stability

## What This Phase Did Not Solve

This phase did not try to solve the last mile of Rabbit as a Mac desktop product.

It did not solve:

- native Mac shell fit
- traffic lights and drag regions
- Tauri runtime on a Mac
- signing and notarization
- final `.app` and `.dmg` proof

It also did not solve Rabbit as a fully hosted SaaS product:

- multi-user auth
- deployed persistent backend
- production billing and paywall flow
- full collaboration depth

That is not a weakness of the phase. It is what kept the phase real.

## The Best Way to Think About Rabbit Now

After this phase, Rabbit should be thought of as:

- a polished Windows development surface
- a credible Motion-shaped product shell
- a validated local-first product loop with live local backend support
- a project that is ready to branch into either Mac release work, deeper backend work, or additional product features

That is a stronger and more honest position than “almost done.”

## Updates

- 2026-05-05 - Added the Windows product-polish phase note after completing shell cleanup, sync/status cleanup, shell hierarchy tightening, content-surface tightening, live flow QA, edge-state polish, and explicit finish-line scoping.

---

*Generated: 2026-05-05 | Project: rabbit | Key files: apps/desktop/src/main.tsx, apps/desktop/src/state.js, apps/desktop/src/shellService.js, learnings/rabbit-windows-polish-finish-line.md*
