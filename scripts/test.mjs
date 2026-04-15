import assert from 'node:assert/strict';
import { createTaskId, getTaskFilters, getTaskStateSummary, upsertTask, resolveTaskAction, generatePlanSlice, normalizeTask } from '../apps/desktop/src/state.js';
import { getEntitlementSnapshot, requireEntitlement } from '../apps/desktop/src/entitlement.js';
import { validatePersistedPayload, CURRENT_SCHEMA_VERSION } from '../apps/desktop/src/contracts.js';

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

const baseTasks = [
  normalizeTask({
    id: 't1',
    title: 'Write app plan',
    projectId: 'inbox',
    status: 'todo',
    dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    recurrence: { pattern: 'daily' }
  }),
  normalizeTask({
    id: 't2',
    title: 'Fix bug',
    projectId: 'work',
    status: 'todo',
    dueAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    recurrence: { pattern: 'none' }
  })
];

runTest('create duplicate task guard rejects duplicate title in same project', () => {
  const dup = upsertTask(baseTasks, { title: 'Write app plan', projectId: 'inbox' });
  assert.equal(dup.ok, false);
  assert.equal(dup.error.includes('similar'), true);
});

runTest('task action flow marks task done', () => {
  const result = resolveTaskAction(baseTasks, 't1', 'complete');
  assert.equal(result.ok, true);
  assert.equal(result.tasks[0].status, 'done');
});

runTest('task filter supports search', () => {
  const filtered = getTaskFilters(baseTasks, { query: 'write' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 't1');
});

runTest('summary computes overdue and done counts', () => {
  const summary = getTaskStateSummary(baseTasks);
  assert.equal(summary.overdue, 1);
  assert.equal(summary.done, 0);
});

runTest('conflict detector returns overlapping task ids', () => {
  const now = new Date().toISOString();
  const tasks = [
    normalizeTask({ id: 'a', title: 'A', dueAt: now, durationMinutes: 120, status: 'todo' }),
    normalizeTask({ id: 'b', title: 'B', startAt: now, durationMinutes: 120, status: 'todo' })
  ];
  const plan = generatePlanSlice(tasks, { now, limitMinutes: 600, horizonMinutes: 60 });
  const hasConflict = Array.isArray(plan.overlaps.a);
  assert.equal(hasConflict, true);
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

runTest('storage contract rejects invalid task payload rows and keeps valid ones', () => {
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

console.log(`PASS: Phase 1 baseline test suite completed (${baseTasks.length} baseline tasks)`);
