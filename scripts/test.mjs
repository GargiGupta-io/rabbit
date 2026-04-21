import assert from 'node:assert/strict';
import { createTaskId, getTaskFilters, getTaskStateSummary, upsertTask, resolveTaskAction, normalizeTask } from '../apps/desktop/src/state.js';
import { generatePlanSlice, buildPlanWindow, rankConflicts } from '../apps/desktop/src/scheduler.js';
import { getEntitlementSnapshot, requireEntitlement } from '../apps/desktop/src/entitlement.js';
import { validatePersistedPayload, CURRENT_SCHEMA_VERSION } from '../apps/desktop/src/contracts.js';
import { loadStoredData, saveStoredData } from '../apps/desktop/src/storage.js';
import { FIXTURE_NOW, FIXTURE_TASKS_RAW, getFixtureState } from '../apps/desktop/src/fixtures.js';

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    console.error(error.message);
    process.exit(1);
  }
}

const baseTasks = FIXTURE_TASKS_RAW.map((task) => normalizeTask(task));
const fixtureState = getFixtureState();

function createLocalStorageMock() {
  const store = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      Object.keys(store).forEach((key) => delete store[key]);
    }
  };
}

function withLocalStorage(storage, fn) {
  const previous = globalThis.localStorage;
  globalThis.localStorage = storage;
  try {
    return fn();
  } finally {
    if (previous) {
      globalThis.localStorage = previous;
    } else {
      delete globalThis.localStorage;
    }
  }
}

runTest('fixture set is deterministic and parseable', () => {
  const normalized = getFixtureState();
  assert.equal(normalized.projects.length, 3);
  assert.equal(normalized.tasks.length, 5);
  assert.equal(normalized.tasks.every((task) => typeof task.title === 'string'), true);
});

runTest('create duplicate task guard rejects duplicate title in same project', () => {
  const dup = upsertTask(baseTasks, { title: 'Draft weekly plan', projectId: 'work' });
  assert.equal(dup.ok, false);
  assert.equal(dup.error.includes('similar'), true);
});

runTest('task action flow marks task done', () => {
  const result = resolveTaskAction(baseTasks, 'f1', 'complete');
  assert.equal(result.ok, true);
  assert.equal(result.tasks[0].id, 'f1');
  assert.equal(result.tasks.find((task) => task.id === 'f1')?.status, 'done');
});

runTest('task filter supports search and status windows', () => {
  const todaySearch = getTaskFilters(baseTasks, { statusFilter: 'all', query: 'draft' });
  assert.equal(todaySearch.length, 1);
  assert.equal(todaySearch[0].id, 'f1');

  const overdue = getTaskFilters(baseTasks, { statusFilter: 'overdue' });
  assert.equal(overdue.length, 1);
  assert.equal(overdue[0].id, 'f3');

  const todo = getTaskFilters(baseTasks, { statusFilter: 'todo' });
  assert.equal(todo.length, 4);
});

runTest('summary aligns with deterministic fixture timeline', () => {
  const summary = getTaskStateSummary(baseTasks);
  assert.equal(summary.today, 3);
  assert.equal(summary.upcoming, 0);
  assert.equal(summary.overdue, 1);
  assert.equal(summary.done, 1);
});

runTest('conflict detector uses deterministic overlapping fixture tasks', () => {
  const plan = generatePlanSlice(baseTasks, { now: FIXTURE_NOW, limitMinutes: 480, horizonMinutes: 60 * 24 * 7 });
  assert.equal(Boolean(plan.overlaps.f1), true);
  assert.equal(plan.overlaps.f1.includes('f4'), true);
  assert.equal(plan.overlaps.f4.includes('f1'), true);
  assert.equal(Array.isArray(plan.rankedOverlaps), true);
});

runTest('planning window and overlap ranking are deterministic', () => {
  const window = buildPlanWindow(baseTasks, { now: FIXTURE_NOW, horizonMinutes: 60 * 24 * 7 });
  const ranked = rankConflicts(window.overlaps);
  assert.equal(Boolean(window.overlaps?.f1?.includes('f4')), true);
  assert.equal(window.visible.length >= 3, true);
  assert.equal(window.today.length >= 2, true);
  assert.equal(ranked.length >= 1, true);
  assert.equal(window.rankedOverlaps[0]?.taskId, 'f1');
  assert.equal(window.rankedOverlaps[0]?.count >= 1, true);
  assert.equal(window.week.length >= 2, true);
});

runTest('feature gate keeps AI disabled by default', () => {
  const entitlement = getEntitlementSnapshot();
  const check = requireEntitlement('ai_suggest');
  assert.equal(entitlement.plan, 'free');
  assert.equal(check.allowed, false);
});

runTest('task IDs are stable unique shape', () => {
  const first = createTaskId();
  const second = createTaskId();
  assert.equal(first === second, false);
  assert.equal(first.length > 10, true);
});

runTest('storage contract migrates deterministic legacy payload', () => {
  const result = validatePersistedPayload(fixtureState);

  assert.equal(result.ok, true);
  assert.equal(result.value.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(result.value.migration.hasMigration, true);
  assert.equal(result.value.migration.fromVersion, 1);
  assert.equal(result.value.migration.toVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(Array.isArray(result.value.projects), true);
  assert.equal(result.value.projects.length, 3);
  assert.equal(result.value.tasks.length, 5);
});

runTest('storage contract removes malformed payload rows while retaining valid fixture-like rows', () => {
  const badPayload = {
    schemaVersion: 1,
    version: '1.0.0',
    projects: [
      { id: 'inbox', name: 'Inbox', color: '#3b82f6', archived: false }
    ],
    tasks: [
      { title: '', projectId: 'inbox' },
      { title: 'Valid task', projectId: 'inbox', status: 'done', dueAt: 'not-a-date' },
      { title: 'Another valid task', projectId: 'unknown-project', durationMinutes: 15 }
    ]
  };

  const result = validatePersistedPayload(badPayload);

  assert.equal(result.ok, true);
  assert.equal(result.value.tasks.length, 2);
  assert.equal(result.value.tasks.some((task) => task.title === 'Valid task'), true);
  assert.equal(result.value.tasks.some((task) => task.title === 'Another valid task'), true);
  assert.equal(result.value.tasks.some((task) => task.projectId === 'inbox'), true);
});

runTest('storage load/save path keeps metadata and revision-safe data shape', () => {
  const storage = createLocalStorageMock();
  withLocalStorage(storage, () => {
    const payload = {
      schemaVersion: 1,
      version: '0.9.0',
      projects: getFixtureState().projects,
      tasks: getFixtureState().tasks,
      metadata: { source: 'desktop', syncState: 'local' }
    };
    saveStoredData(payload);
    const raw = storage.getItem('motion_clone_phase1_app_data');
    assert.equal(typeof raw, 'string');
    const saved = JSON.parse(raw);
    assert.equal(saved.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(typeof saved.metadata, 'object');
    assert.equal(saved.metadata.app, 'rabbit');
    assert.equal(saved.metadata.source, 'desktop');

    const loaded = loadStoredData();
    assert.equal(Array.isArray(loaded.tasks), true);
    assert.equal(loaded.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(Array.isArray(loaded.metadata?.revision) || typeof loaded.metadata?.revision === 'string', true);
  });
});

runTest('storage handles future schema payload by applying an upgrade compatibility shim', () => {
  const storage = createLocalStorageMock();
  withLocalStorage(storage, () => {
    const futurePayload = {
      schemaVersion: CURRENT_SCHEMA_VERSION + 1,
      version: '1.2.0',
      projects: getFixtureState().projects,
      tasks: getFixtureState().tasks
    };
    storage.setItem('motion_clone_phase1_app_data', JSON.stringify(futurePayload));

    const loaded = loadStoredData();
    assert.equal(loaded.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(loaded.migration?.hasMigration, true);
    assert.equal(loaded.migration?.fromVersion, CURRENT_SCHEMA_VERSION + 1);
    assert.equal(Array.isArray(loaded.migration?.steps), true);
    assert.equal(loaded.migration?.steps.length > 0, true);
  });
});

console.log(`PASS: Phase 2 baseline test suite completed (${baseTasks.length} fixture tasks)`);

