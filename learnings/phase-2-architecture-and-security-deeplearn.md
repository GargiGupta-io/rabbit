# Phase 2 Deep Dive

> This document explains how Phase 2 works, why it exists, and what we changed at a practical level so you can keep building without guessing. Phase 2 is the foundation shift from a demo shell to a product that can safely grow.

## In Plain English

Right now you have a working app that can add tasks, mark them done, delete them, and show simple planning summaries. It works, but it is still fragile in the one way real apps often are: it trusts whatever is in local storage. If that saved file is missing fields, old, or even slightly wrong, the app may still run by luck, or it may start misbehaving.

Phase 2 fixes this by introducing a “contract” layer. Think of a contract like a border security checkpoint at the entry of your country. Nothing enters storage unless it has the right documents. That checkpoint does two jobs:

- It repairs what it can safely repair.
- It records what it changed, so you can track migration over time.

Why this matters now: every future feature you add (calendar sync, AI suggestions, teams, subscriptions, offline state) depends on stable data shape. If your data shape changes every time you add one feature, you end up spending too much time chasing bugs. Phase 2 gives you a stable spine.

## What Is Phase 2 (The Technical View)

Phase 2 is a narrow but important re-architecture in four themes:

1. Data contracts and migration guards.
2. Separation of core domain logic from UI glue.
3. Scheduling logic extracted to reusable primitives.
4. Security/entitlement behavior moved toward strict validation and clear runtime behavior.

We are executing it in small steps so you always have a running product. Step 1 is data contracts first.

## The Problem It Solves

### Problem before Step 1
The app previously persisted data directly from memory with minimal validation. Old shapes and broken data were tolerated and normalized indirectly through `state.js` functions. That worked for quick iteration, but it makes it harder to:

- Add versioned upgrades later.
- Handle data from older app versions.
- Detect corruption or tampering.
- Keep feature flags and licensing behavior stable across launches.

### Why that becomes urgent later
Once you add sync, AI, or cross-device behavior, this data starts being treated as source-of-trust. Without a contract, you are trusting dirty input. A strict, intentional contract gives you predictable migration, easier debugging, and safer rollout control.

## How It Works (Step 1)

### 1) The contract object in `apps/desktop/src/contracts.js`

Plain English: this file is your data passport office. It checks incoming saved payloads, fixes recoverable fields, and sets clear version markers.

Technical detail:
- `CURRENT_SCHEMA_VERSION` and `EARLIEST_SCHEMA_VERSION` represent format levels.
- `normalizePersistedPayload()` is the main normalizer.
- `validatePersistedPayload()` calls normalization and returns `{ ok, errors, value }`.
- `normalizeProjects()` and `normalizeTasks()` apply defensive parsing:
  - duplicate project IDs are deduplicated,
  - invalid task titles are dropped,
  - durations are clamped to acceptable bounds,
  - recurrence patterns are normalized,
  - project references are corrected to known IDs.
- `APP_DATA_DEFAULT` is the safe baseline fallback payload.

### 2) Migration marker structure

Plain English: migration markers are like a short changelog written into saved data each time format rules change. This helps you prove what happened and why.

Technical detail:
- `migration.fromVersion`, `migration.toVersion`, and `migration.steps` are persisted inside payload.
- Legacy payloads (missing `schemaVersion`) get migration steps such as `injected schemaVersion (legacy payload)`.
- If legacy version is lower than `CURRENT_SCHEMA_VERSION`, it records `migrated v1 -> v2` style steps.

### 3) Storage layer now becomes contract-aware

Plain English: every save and load goes through a gate.

Technical detail:
- `storage.js` now imports `normalizePersistedPayload`.
- `loadStoredData()`:
  - reads raw localStorage string,
  - falls back to safe default on parse/shape failure,
  - returns normalized payload with contract fields and migration metadata.
- `saveStoredData()`:
  - normalizes before write,
  - enforces `schemaVersion`,
  - updates `updatedAt`, `lastSavedAt`, and `revision`.

This makes old and clean payloads both work, but in a controlled way.

## What We Built

### [apps/desktop/src/contracts.js]

Plain English: this file now defines how your app data should be shaped and how old data is migrated.

Technical detail: it centralizes normalization and validation so state and UI code can remain simpler. It exports:
- `CURRENT_SCHEMA_VERSION`,
- `EARLIEST_SCHEMA_VERSION`,
- `APP_DATA_DEFAULT`,
- `normalizePersistedPayload()`,
- `validatePersistedPayload()`.


```javascript
// apps/desktop/src/contracts.js (entry points)
export const APP_DATA_DEFAULT = normalizePersistedPayload({
  version: DEFAULT_APP_VERSION,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  projects: DEFAULT_PROJECTS,
  tasks: []
});

export function normalizePersistedPayload(raw = {}) {
  const payload = isPlainObject(raw) ? raw : {};
  const fromVersion = detectSchemaVersion(payload);
  const projects = normalizeProjects(Array.isArray(payload.projects) ? payload.projects : []);
  const projectIds = new Set(projects.map((project) => project.id));

  const migration = normalizeMigrationInfo(payload, fromVersion, CURRENT_SCHEMA_VERSION);

  return {
    version: sanitizeText(payload.version, DEFAULT_APP_VERSION),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: normalizeDate(payload.updatedAt) || nowIso(),
    createdAt: normalizeDate(payload.createdAt) || nowIso(),
    lastLoadedAt: nowIso(),
    migration,
    revision: sanitizeText(payload.revision, `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`),
    projects,
    tasks: normalizeTasks(Array.isArray(payload.tasks) ? payload.tasks : [], projectIds)
  };
}
```

Technical detail: this function is pure and deterministic from a given input. It preserves recoverable values, assigns safe defaults, and injects migration metadata. The contract object now carries enough context (`schemaVersion`, `migration`, `revision`) to reason about shape evolution.

### [apps/desktop/src/storage.js]

Plain English: storage load/save now always run through the contract layer, so local data can never silently bypass rules.

Technical detail:

```javascript
export function loadStoredData() {
  const raw = localStorage?.getItem?.(STORAGE_KEY);
  if (!raw) {
    return fallbackPayload();
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return fallbackPayload();
    }
    return normalizePersistedPayload(parsed);
  } catch {
    return fallbackPayload();
  }
}

export function saveStoredData(data = {}) {
  const normalized = normalizePersistedPayload(data);
  normalized.schemaVersion = CURRENT_SCHEMA_VERSION;
  normalized.updatedAt = new Date().toISOString();
  normalized.lastSavedAt = normalized.updatedAt;
  normalized.revision = `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  if (!localStorage) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}
```

Technical detail: `fallbackPayload()` guarantees safe startup. If saved state is missing, malformed, or from older versions, app boots into predictable structure rather than failing with partial data.

### [scripts/test.mjs]

Plain English: tests now include checks for the contract and migration behavior before any later features.

Technical detail: two new test groups assert that legacy payloads get migration markers and remain usable, and invalid task rows are filtered instead of crashing.

```javascript
runTest('storage contract injects schema version and migration metadata for legacy payloads', () => {
  const legacyPayload = {
    version: '1.0.0',
    projects: [
      { id: 'inbox', name: 'Inbox', color: '#3b82f6', archived: false }
    ],
    tasks: [
      { id: 'legacy-task', title: 'Legacy', projectId: 'inbox', dueAt: '2026-01-01T00:00:00.000Z', durationMinutes: 10 }
    ]
  };

  const result = validatePersistedPayload(legacyPayload);

  assert.equal(result.ok, true);
  assert.equal(result.value.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(result.value.migration.hasMigration, true);
  assert.equal(result.value.migration.fromVersion, 1);
  assert.equal(result.value.migration.toVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(Array.isArray(result.value.projects), true);
  assert.equal(result.value.projects.length >= 1, true);
  assert.equal(result.value.tasks.length, 1);
});
```

Technical detail: tests act as regression guardrails so schema migration behavior does not regress later when new fields are added.

## How Data is Flowing Across This Step

Plain English: data now follows a predictable path at launch and save time.

Technical detail:

```text
[localStorage JSON] --parse--> [storage.loadStoredData]
  --contract--> [normalizePersistedPayload]
    --app state: UI bootstrap]--display--> [screen]

[user actions] --update state--> [main.tsx]
  --saveStoredData--> [storage.saveStoredData]
    --contract--> [normalizePersistedPayload + revision marker]
      --write--> [localStorage JSON]
```

## Why This Enables Your Next Steps

- You can add new fields to tasks/projects with migration behavior instead of broad breakage.
- Tests tell you quickly if shape assumptions changed.
- Saved data can be upgraded safely instead of replaced.
- Later entitlement and entitlement refresh logic can trust that basic storage shape is sound.

## Common Patterns Introduced

### Pattern: Normalize at Boundary, Not on Every Use

What it's for: centralize defense in one place.

Use this for all external-facing data: local storage, network payloads, and future sync API responses.

### Pattern: Keep Legacy Compatibility Explicit

What it's for: avoid silent upgrades.

Every migration should leave evidence (`migration` block) that describes what was corrected.

### Pattern: Make Unknown Fields Non-Fatal by Default

What it's for: keep app usable.

Invalid optional fields should be corrected or dropped where safe, not make app crash.

## Edge Cases & Gotchas

1. **No schemaVersion in old data**
   In plain English: old data still loads, but now with a recorded migration step.
   Technical cause: legacy payload shape did not include schema metadata.
   How to avoid: always normalize legacy payloads and set `fromVersion`/`toVersion`.

2. **Invalid task entries**
   In plain English: empty rows won't poison the entire app.
   Technical cause: task title is required for render/filter/action semantics.
   How to avoid: normalize tasks and drop invalid rows before app state uses them.

3. **Unknown recurrence pattern**
   In plain English: weird values fall back to `none` instead of breaking.
   Technical cause: user-defined or corrupt payload may carry unsupported values.
   How to avoid: whitelist accepted values and normalize to defaults.

4. **Out-of-range durations**
   In plain English: absurd values are corrected to a usable bucket.
   Technical cause: corrupted duration values can break scheduling math.
   How to avoid: clamp durations to safe min/max.

## How It Connects to Other Concepts

- **Storage integrity**: this directly feeds reliability and anti-clone protections because it gives you a strict definition of what data is valid.
- **Scheduling**: later Step 5 can assume `startAt`, `dueAt`, and `durationMinutes` are in expected forms.
- **Entitlement**: a clean payload reduces false errors when entitlement checks happen on startup.
- **CI**: test coverage becomes easier because each rule is deterministic and can be unit-tested independently.

## Going Deeper

### Versioned schema migrations

Think of every breaking shape change as an internal migration contract. Don’t migrate in UI code, migrate in dedicated helpers so each change is testable.

### Persistence attack surface control

Contracts are one layer, not the only layer. Later you will add signature checks, tamper logging, and server authority checks.

### Backward compatibility policy

Decide clear policy per step: preserve old values, drop impossible values, or block launch with explicit message.

## Quick Reference

### Key Terms

| Term | Plain English meaning | Technical meaning |
|---|---|---|
| Contract | Fixed rules for what counts as valid app data | `normalizePersistedPayload` + `validatePersistedPayload` |
| Schema version | Version label for stored format | `schemaVersion` field |
| Migration metadata | A short history of automatic upgrades applied | `migration` object in payload |
| Revision | Save marker for a write event | `revision` + `lastSavedAt` |
| Fallback payload | Safe default data if load fails | `APP_DATA_DEFAULT` |

### Essential Patterns

```javascript
const legacyPayload = localStorage.getItem(key);
const payload = JSON.parse(legacyPayload);
const normalized = normalizePersistedPayload(payload);
const safeState = normalized;
```

## What Changed in This Step

- Added `apps/desktop/src/contracts.js` with normalized schema parsing and migration metadata.
- Updated `apps/desktop/src/storage.js` to load and save via contract normalizer.
- Updated `scripts/test.mjs` with contract-focused migration and validation tests.

## Updates

- 2026-04-17: Step 1 started and implemented to introduce persisted payload contracts and migration metadata for schema `1 -> 2`, with test coverage in `scripts/test.mjs`.
- 2026-04-17: Step 2 added deterministic fixture payloads and rewired the test harness to assert fixture-based summary/conflict behavior.
*Generated: 2026-04-17 | Project: Motion Clone | Files: `apps/desktop/src/contracts.js`, `apps/desktop/src/storage.js`, `scripts/test.mjs`*


## What Changed in Step 3

### [apps/desktop/src/taskService.js]

This now owns all task domain operations formerly in `state.js`.
- `TASK_STATUSES` constant and state mutation/query helpers (`normalizeTask`, `upsertTask`, `resolveTaskAction`, etc.).
- Filtering/summaries/conflict generation now run from one cohesive file so they can be tested and evolved independently.

### [apps/desktop/src/projectService.js]

This now owns project defaults/normalization and project lookup helpers.
- Project seed fallback and dedupe.
- `getProjectById`, `decorateTaskWithProject` for UI composition.

### [apps/desktop/src/state.js]

Now a thin orchestrator:
- Re-exports both services.
- Keeps `buildSeedData` as the single place composing normalized projects + tasks when needed.

### [apps/desktop/src/main.tsx]

UI imports are now moved toward service-level helpers for project enrichment.
- Uses `getProjectById` to set draft project names.
- Uses `decorateTaskWithProject` when rendering tasks.

### Outcome

- Existing behavior is unchanged from a user perspective.
- The core is now testable as separate service modules.
- Next step can safely add scheduling/sync features without moving UI-related wiring again.

- 2026-04-17: Step 3 implemented the service split for kernel/domain logic (`taskService`, `projectService`) and made `state.js` orchestration-only.

## What Changed in Step 7

- Hardened entitlement contract checks:
  - `apps/desktop/src/entitlement.js` now validates snapshot shape (user/plan/flags/token/expiry), keeps `validation` metadata, and exposes `requireEntitlement`/`canMutateTasks`.
  - Added fallback behavior for missing snapshots so app still boots in safe free-mode defaults.
- Added runtime gating intent:
  - `apps/desktop/src/main.tsx` now checks task mutation allowance before write actions (add/complete/delete) and disables those controls in read-only state.
  - Entitlement summary line now reflects AI/calendar/mutation mode.

- 2026-04-17: Step 7 implemented the entitlement hardening contract and tests for default/expired/tampered token behavior (`scripts/test.mjs`).

## What Changed in Step 8

- Added startup/runtime guard behavior:
  - `apps/desktop/src/main.tsx` now updates entitlement state before each render and shows explicit read-only reason text in the editor area when mutation is blocked.
  - Action buttons are conditionally disabled based on entitlement.
  - Removed redundant refresh call in `run()` so guard evaluation flows through the existing render pipeline once.
- 2026-04-17: Step 8 implemented runtime entitlement guardrails and graceful mutation fallback (`read-only` UX path).

