# Rabbit Windows Polish Finish Line

Date: 2026-05-05

## What counts as finished for this phase

Rabbit can be called finished for the current Windows polish phase when all of these are true:

- the visible shell looks customer-facing rather than prototype-facing
- the core task lifecycle works end to end:
  - create
  - complete
  - delete
  - refresh remote
  - push outbox
- inbox and agenda surfaces stay readable and stable during those flows
- loading, empty, success, and error states use calm product language
- the local backend path remains stable enough for repeatable preview testing on Windows

This phase is not trying to declare Rabbit fully shippable as a final macOS desktop product.
It is declaring the current Windows product surface good enough to keep moving without adding more shell clutter or speculative parity work.

## What still matters before calling Rabbit finished

Only these items still matter before calling this phase finished:

1. Final verification and closeout
   - rerun repo checks
   - write the phase handoff note
   - close the step log cleanly

There are no additional must-have UI features inside this phase.
The current product cut is enough for closeout once final verification is done.

## Explicitly deferred from this phase

These are real gaps, but they are not blockers for closing the Windows polish phase:

1. Real desktop-shell validation on macOS
   - native window chrome
   - traffic-light placement
   - drag regions
   - font/rendering differences

2. Final packaging, signing, and notarization
   - Tauri/mac build execution
   - Apple signing
   - notarization
   - final `.app` and `.dmg` proof

3. Account and workspace product depth
   - login/signup
   - account settings
   - workspace switching and join flows

4. Full calendar and event authoring parity
   - event creation
   - event editing
   - richer calendar write flows

5. Full Motion utility parity
   - option-space style quick-add surface
   - deeper search behavior
   - fuller quick-meeting behavior
   - broader keyboard-shortcut coverage

6. Collaboration and multi-user product depth
   - comments
   - richer assignment flows
   - shared-workspace collaboration behavior

7. Production backend hardening
   - hosted persistent backend
   - real auth
   - real multi-user state
   - deployment and operational hardening

8. Premium, billing, and AI expansion
   - paywall behavior
   - subscription surfaces
   - broader AI employee and notes flows

## Decision

Rabbit should now be treated as:

- finished enough for the Windows product-polish phase after final verification
- not yet finished as a Mac desktop release
- not yet finished as a fully hosted multi-user SaaS product

That means the next major branch after this phase should be chosen deliberately:

1. Mac/Tauri/release path
2. deeper product features
3. production backend hardening
