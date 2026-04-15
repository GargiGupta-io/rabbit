# Motion Clone App - Learning & Execution Plan (Beginner-Friendly)

## What you are building

- You are building a production-grade desktop app for macOS with Motion-like capabilities.
- You are mostly on Windows and have limited time on a shared Mac.
- You want to ship a polished product while reducing day-to-day dependence on a Mac.
- You also want to make reverse-engineering/clone attempts harder.

The plan below is designed for non-linear learning: clear, practical, and hand-hold heavy.

---

## Decision summary from this session

- You do not need the Motion app installed right now to start reversing features.
- Reverse engineering starts from public product behavior and web flows.
- Native SwiftUI would give the best mac feel but needs more Mac build time.
- With shared Mac constraints, the practical path is **Tauri + React/Next + Rust** first.
- Final Mac tasks should be done by CI or short Mac sessions, not daily interactive work.
- "Perfect clone-proof binary" is unrealistic; focus on **hardening + server authority**.

---

## Stack meaning (simple)

- `Tauri`: desktop shell that wraps a web UI and gives native app packaging.
- `React/Next`: user interface and app workflows.
- `Rust`: native bridge for OS actions (files, secure storage, notifications, menus).

This gives you:
- Windows-first productivity.
- Small native binaries.
- Lower Mac dependency during development.

---

## What can be done on Windows vs Mac

- Windows-friendly:
  - product planning and specs
  - data model and sync design
  - task/AI/business logic
  - API clients, tests, and CI logic
  - most web UI implementation
- Mac-required:
  - final native packaging build
  - code signing and notarization
  - mac-specific permission and entitlement checks
  - final App Store or direct release artifact verification

Recommended flow:
- Keep local development and commits on Windows.
- Use GitHub macOS runners or a remote Mac (on-demand) for release validation.

---

## Reverse-engineering approach

You do not need to install the Motion app now.
Start with public behavior:

1. Extract key user journeys: signup, onboarding, task creation, scheduling, reminders, conflicts.
2. Capture flows by sections: today/forecast/calendar, task states, recurring setup, AI assist.
3. Build your own feature inventory with priorities:
  - P0: must-have for first release.
  - P1: needed soon after.
  - P2: later upgrades.
4. Convert each feature into explicit acceptance tests.

Optional later: install Motion briefly for micro UX comparison only.

---

## What you asked about "hard to decode / clone"

Truth in plain terms:
- A desktop binary cannot be made impossible to reverse engineer.
- You can make it **hard enough** that casual copying/cloning is expensive.
- The best defense is not only code hardening, but **moving business logic to server**.

So this plan uses **Anti-Cloning Baseline v1**.

---

## Anti-Cloning Baseline v1 (plain version)

### 1) Signed release builds + CI integrity checks
- Build releases only from one controlled CI workflow.
- Sign mac artifacts with your Apple identity.
- Remove debug details and source maps from production artifacts.
- CI rejects unsigned or malformed release artifacts.

### 2) Signed update chain + hash verification
- Publish updates from one official channel only.
- Include package hash/signature for each release.
- App verifies update integrity before install.

### 3) Server-authoritative licensing + feature logic
- Premium checks and sensitive business rules run on backend.
- Client asks server for entitlement status at key points.
- Local tampering cannot grant premium actions.

### 4) Minified/obfuscated frontend and smaller attack surface
- Minify JS bundle and do not ship source maps.
- Expose only a small set of validated Rust commands in Tauri bridge.
- Keep dangerous operations out of frontend-only logic.

### 5) Secure local storage
- Store tokens/keys in OS keychain/credential storage.
- Encrypt sensitive local data where useful.
- Never place API secrets in static app files.

### 6) Runtime checks + tamper/abuse telemetry
- Add startup/runtime sanity checks.
- Log token abuse, repeated invalid checks, and signature anomalies.
- Limit sensitive flows when checks fail.

### 7) Incident controls and revocation
- Server-side account/device revocation.
- Immediate token invalidation capability.
- Emergency kill-switch flow for compromised clients.

This is practical protection, not magic.

---

## Why "server-authoritative" matters for clone resistance

- If all logic is in the app, a clone can copy behavior.
- If core decisioning is server-side, copied binaries lose value.
- Server can disable stolen tokens, invalidate clones, and patch behavior quickly.

---

## Detailed roadmap by phase

### Phase 0 - Product framing
- Lock in goals, scope, and success criteria.
- Pick architecture and define where logic runs (client vs backend).
- Create release roadmap: v1 / v1.1 / v1.2.

### Phase 1 - Reverse-engineering spec
- Build a behavior matrix from Motion-inspired features.
- Define explicit data entities and workflows.
- Turn each major flow into acceptance requirements.

### Phase 2 - Architecture and security model
- Define task, project, schedule, workspace, sync, and license data model.
- Add offline-first and sync conflict model.
- Define permission boundaries and threat model.

### Phase 3 - Build scaffolding
- Create repo structure.
- Set up lint, format, tests, and CI.
- Add mac build workflow using remote Mac or GitHub Actions.

### Phase 4 - Core app shell
- Navigation, onboarding, search, and account states.
- Sessions and logout behavior.

### Phase 5 - Tasks and projects (MVP)
- CRUD for task/project.
- Today/upcoming/overdue views and search.
- Soft delete, undo, basic recurrence.

### Phase 6 - Scheduling engine
- Day/week planning view.
- Deadline/dependence and focus-time constraints.
- Conflict detection and reschedule suggestions.

### Phase 7 - AI workflow layer
- Smart suggestions with strict prompt and output schema checks.
- Human-confirmed action application and rollback.

### Phase 8 - Integrations and notifications
- Calendar integration (read/write model).
- Reminder + notification flows.
- Menubar/menu quick actions.

### Phase 9 - Security hardening baseline
- Implement signing, update verification, server entitlements.
- Implement keychain-backed tokens and runtime checks.
- Add abuse/incident logs and alerting.

### Phase 10 - Testing pass
- Unit/integration tests.
- Sync and recurrence edge cases.
- Mac-only flow checks in CI.

### Phase 11 - Packaging and release
- Signing, notarization, upgrade path, and migration plan.
- Private beta + crash and adoption metrics.

### Phase 12 - Public launch and iterate
- Resolve launch blockers.
- Add P1 enhancements and feedback-driven changes.

---

## How I will hand-hold execution with you

At the end of each phase:
- you get the exact outcome,
- what changed and why,
- what to test,
- what errors mean and what to do,
- and the next concrete step.

That is the execution style so you never feel lost.

---

## Existing documents reference

- `plans/phase-0-plan.md`
- `planning.md`

`planning.md` remains the main combined learning + execution document for this phase.

---

### Phase 0 detailed plan
- Step-by-step execution has been expanded in:
  - [phase-0-plan](/C:/Users/Pumba/Documents/codex/Motion/plans/phase-0-plan.md)
- Current state:
  - Step 1 complete
  - Step 2 complete
  - Step 3 complete

### Phase 0 checkpoint lock (2026-04-15)

- Phase 0 is now fully locked and ready for Phase 1.
- P0 scope (must be done before Phase 1): repository foundation, platform/security contracts, executable shell placeholder.
- P1 scope (must wait until Phase 0 completion): task/project data model, scheduling engine, AI workflow, calendar + reminders integrations.
- No undocumented feature drift was added during Phase 0.
- Security baseline v1 is established in docs/contracts/release-security-contract.md.
