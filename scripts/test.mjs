import assert from 'node:assert/strict';
import { applyTaskMutation, createTaskId, getSyncStateSummary, getTaskFilters, getTaskStateSummary, upsertTask, resolveTaskAction, normalizeTask } from '../apps/desktop/src/state.js';
import { generatePlanSlice, buildPlanWindow, rankConflicts } from '../apps/desktop/src/scheduler.js';
import { ENTITLEMENT_REFRESH_STALE_MS, ENTITLEMENT_STORAGE_KEY, getEntitlementSnapshot, getEntitlementStateSummary, refreshEntitlementSnapshot, requireEntitlement } from '../apps/desktop/src/entitlement.js';
import { validatePersistedPayload, CURRENT_SCHEMA_VERSION } from '../apps/desktop/src/contracts.js';
import { loadStoredData, saveStoredData } from '../apps/desktop/src/storage.js';
import { createTaskSyncEvent, normalizeOutbox } from '../apps/desktop/src/syncContract.js';
import { buildCalendarBusyBlocks, normalizeCalendarOverlay } from '../apps/desktop/src/calendarService.js';
import { createMockEntitlementTransport, normalizeAuthorityRefreshResponse } from '../apps/desktop/src/entitlementClient.js';
import {
  FIXTURE_CALENDAR_EVENTS_RAW,
  FIXTURE_CALENDAR_OVERLAY,
  FIXTURE_NOW,
  FIXTURE_SHELL_STATE,
  FIXTURE_TASKS_RAW,
  getFixtureState
} from '../apps/desktop/src/fixtures.js';

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

async function runAsyncTest(name, fn) {
  try {
    await fn();
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
  const restore = () => {
    if (previous) {
      globalThis.localStorage = previous;
    } else {
      delete globalThis.localStorage;
    }
  };
  globalThis.localStorage = storage;
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.finally(restore);
    }
    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
}

runTest('fixture set is deterministic and parseable', () => {
  const normalized = getFixtureState();
  assert.equal(normalized.projects.length, 3);
  assert.equal(normalized.tasks.length, 5);
  assert.equal(normalized.tasks.every((task) => typeof task.title === 'string'), true);
});

runTest('fixture shell state seeds Motion-like tabs, views, and agenda groups', () => {
  const normalized = getFixtureState();
  assert.equal(normalized.shell.theme.mode, 'dark');
  assert.equal(normalized.shell.tabs.length, 3);
  assert.equal(normalized.shell.savedViews.length, 4);
  assert.equal(normalized.shell.activeTabId, 'tab_calendar');
  assert.equal(normalized.shell.activeViewId, 'view_my_tasks');
  assert.equal(normalized.shell.sidebarSections.length, 2);
  assert.equal(normalized.shell.agenda.counts.total, FIXTURE_SHELL_STATE.agenda.counts.total);
  assert.equal(normalized.shell.agenda.counts.total, 6);
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

runTest('task mutations emit normalized sync events for create and complete actions', () => {
  const created = upsertTask([], { title: 'Sync contract baseline', projectId: 'inbox', durationMinutes: 25 });
  assert.equal(created.ok, true);
  assert.equal(created.syncEvent?.action, 'create');
  assert.equal(created.syncEvent?.entityType, 'task');
  assert.equal(created.syncEvent?.entityId, created.tasks[0].id);
  assert.equal(created.syncEvent?.payload?.task?.title, 'Sync contract baseline');

  const completed = resolveTaskAction(created.tasks, created.tasks[0].id, 'complete');
  assert.equal(completed.ok, true);
  assert.equal(completed.syncEvent?.action, 'complete');
  assert.equal(completed.syncEvent?.payload?.previousTask?.status, 'todo');
  assert.equal(completed.syncEvent?.payload?.task?.status, 'done');
});

runTest('sync outbox normalization deduplicates repeated revision entries', () => {
  const previousTask = normalizeTask(FIXTURE_TASKS_RAW[0]);
  const nextTask = normalizeTask({
    ...FIXTURE_TASKS_RAW[0],
    title: 'Draft weekly plan v2',
    updatedAt: '2026-04-17T12:30:00.000Z'
  });

  const event = createTaskSyncEvent({
    action: 'update',
    task: nextTask,
    previousTask,
    revision: 'mut_fixed_revision',
    occurredAt: '2026-04-17T12:30:00.000Z'
  });

  const outbox = normalizeOutbox([event, event, { ...event, id: 'duplicate-by-revision' }], {
    deviceId: 'dev_test'
  });

  assert.equal(outbox.length, 1);
  assert.equal(outbox[0].action, 'update');
  assert.equal(outbox[0].deviceId, 'dev_test');
  assert.equal(outbox[0].payload?.previousTask?.title, previousTask.title);
});

runTest('app state mutation helper appends outbox events and marks sync as pending', () => {
  const created = upsertTask([], { title: 'Queue me for sync', projectId: 'inbox', durationMinutes: 30 });
  const nextState = applyTaskMutation(
    {
      ...getFixtureState(),
      tasks: [],
      outbox: [],
      lastSyncAt: '2026-04-17T12:00:00.000Z',
      syncCursor: 'cursor_before',
      deviceId: 'dev_runtime',
      syncStatus: 'local'
    },
    created
  );

  assert.equal(Array.isArray(nextState.tasks), true);
  assert.equal(nextState.tasks.length, 1);
  assert.equal(nextState.outbox.length, 1);
  assert.equal(nextState.outbox[0]?.action, 'create');
  assert.equal(nextState.syncStatus, 'pending');
  assert.equal(nextState.lastSyncAt, '2026-04-17T12:00:00.000Z');
});

runTest('sync state summary exposes pending local-only runtime status', () => {
  const summary = getSyncStateSummary({
    outbox: [
      createTaskSyncEvent({
        action: 'create',
        task: normalizeTask({
          id: 'queue-summary-1',
          title: 'Queued summary task',
          projectId: 'inbox',
          durationMinutes: 30
        }),
        revision: 'mut_summary_1',
        occurredAt: '2026-04-17T12:15:00.000Z'
      })
    ],
    deviceId: 'dev_summary',
    syncStatus: 'local'
  });

  assert.equal(summary.pendingCount, 1);
  assert.equal(summary.hasPendingChanges, true);
  assert.equal(summary.isDegraded, true);
  assert.equal(summary.syncStatus, 'pending');
});

runTest('calendar overlay normalization keeps deterministic busy blocks and derives all-day end time', () => {
  const overlay = normalizeCalendarOverlay(FIXTURE_CALENDAR_OVERLAY);
  const busyBlocks = buildCalendarBusyBlocks(overlay.importedEvents);

  assert.equal(Array.isArray(overlay.importedEvents), true);
  assert.equal(overlay.importedEvents.length, 3);
  assert.equal(overlay.permissionStatus, 'granted');
  assert.equal(overlay.source.provider, 'google');
  assert.equal(overlay.importedEvents[2]?.allDay, true);
  assert.equal(overlay.importedEvents[2]?.endAt, '2026-04-19T00:00:00.000Z');
  assert.equal(busyBlocks.length, 3);
});

runTest('calendar overlay normalization drops invalid calendar rows safely', () => {
  const overlay = normalizeCalendarOverlay({
    importedEvents: [
      ...FIXTURE_CALENDAR_EVENTS_RAW,
      { id: 'bad_1', title: 'Missing end', startAt: '2026-04-17T18:00:00.000Z' },
      { id: 'bad_2', title: 'Reverse range', startAt: '2026-04-17T20:00:00.000Z', endAt: '2026-04-17T19:00:00.000Z' },
      { title: 'No id', startAt: '2026-04-17T10:00:00.000Z', endAt: '2026-04-17T11:00:00.000Z' }
    ],
    permissionStatus: 'prompt',
    source: {
      provider: 'google',
      calendarIds: ['team-primary', 'team-primary', 'company-shared']
    }
  });

  assert.equal(overlay.importedEvents.length, 3);
  assert.equal(overlay.permissionStatus, 'prompt');
  assert.deepEqual(overlay.source.calendarIds, ['team-primary', 'company-shared']);
});

runTest('task filter supports search and status windows', () => {
  const todaySearch = getTaskFilters(baseTasks, { statusFilter: 'all', query: 'draft' });
  assert.equal(todaySearch.length, 1);
  assert.equal(todaySearch[0].id, 'f1');

  const overdue = getTaskFilters(baseTasks, { statusFilter: 'overdue', now: FIXTURE_NOW });
  assert.equal(overdue.length, 1);
  assert.equal(overdue[0].id, 'f3');

  const todo = getTaskFilters(baseTasks, { statusFilter: 'todo' });
  assert.equal(todo.length, 4);
});

runTest('summary aligns with deterministic fixture timeline', () => {
  const summary = getTaskStateSummary(baseTasks, { now: FIXTURE_NOW });
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

runTest('calendar-aware planning window reports busy blocks, blocked tasks, and available minutes', () => {
  const window = buildPlanWindow(baseTasks, {
    now: FIXTURE_NOW,
    horizonMinutes: 60 * 24 * 7,
    calendarOverlay: FIXTURE_CALENDAR_OVERLAY
  });

  assert.equal(window.busyBlocks.length, 3);
  assert.deepEqual(window.blockedTaskIds, ['f1', 'f4']);
  assert.equal(window.availableMinutes, 8490);
  assert.equal(Boolean(window.overlaps?.f1?.includes('f4')), true);
});

runTest('calendar-aware plan slice preserves task overlap output while layering calendar conflicts', () => {
  const plan = generatePlanSlice(baseTasks, {
    now: FIXTURE_NOW,
    horizonMinutes: 60 * 24 * 7,
    calendarOverlay: FIXTURE_CALENDAR_OVERLAY
  });

  assert.equal(plan.busyBlocks.length, 3);
  assert.equal(plan.blockedTaskIds.includes('f1'), true);
  assert.equal(plan.blockedTaskIds.includes('f4'), true);
  assert.equal(plan.availableMinutes, 8490);
  assert.equal(Boolean(plan.overlaps?.f1?.includes('f4')), true);
});

runTest('feature gate keeps AI disabled by default', () => {
  const entitlement = getEntitlementSnapshot();
  const check = requireEntitlement('ai_suggest');
  assert.equal(entitlement.plan, 'free');
  assert.equal(check.allowed, false);
});

runTest('missing entitlement snapshot remains usable and safe default', () => {
  const storage = createLocalStorageMock();
  withLocalStorage(storage, () => {
    storage.removeItem(ENTITLEMENT_STORAGE_KEY);
    const check = requireEntitlement('tasks_manage');
    assert.equal(check.allowed, true);
    assert.equal(check.plan, 'free');
    assert.equal(check.reason, null);
  });
});

runTest('expired entitlement disables task mutations', () => {
  const storage = createLocalStorageMock();
  const now = new Date('2026-04-17T13:00:00.000Z').valueOf();
  withLocalStorage(storage, () => {
    storage.setItem(
      ENTITLEMENT_STORAGE_KEY,
      JSON.stringify({
        userId: 'user-1',
        plan: 'pro',
        featureFlags: {
          ai_suggest: true,
          calendar_read: true,
          calendar_write: true,
          advanced_recurrence: true,
          tasks_manage: true
        },
        entitlements: ['tasks.basic', 'calendar.read'],
        source: 'test',
        token: 'rabbit-signature:test-token',
        issuedAt: new Date(now - 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now - 60 * 1000).toISOString()
      })
    );

    const snapshot = getEntitlementSnapshot({ now });
    const check = requireEntitlement('tasks_manage', now);

    assert.equal(snapshot.validation?.isExpired, true);
    assert.equal(check.allowed, false);
    assert.equal(check.reason.includes('entitlement expired'), true);
  });
});

runTest('tampered entitlement token blocks premium feature gates', () => {
  const storage = createLocalStorageMock();
  withLocalStorage(storage, () => {
    storage.setItem(
      ENTITLEMENT_STORAGE_KEY,
      JSON.stringify({
        userId: 'user-1',
        plan: 'pro',
        featureFlags: {
          ai_suggest: true,
          calendar_read: true,
          calendar_write: true,
          advanced_recurrence: true,
          tasks_manage: true
        },
        entitlements: ['tasks.basic', 'calendar.read'],
        source: 'test',
        token: 'bad-token',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    );

    const check = requireEntitlement('ai_suggest');
    assert.equal(check.allowed, false);
    assert.equal(check.reason.includes('token signature'), true);
  });
});

runTest('authority response normalization flags revoked and malformed refresh payloads', () => {
  const revoked = normalizeAuthorityRefreshResponse(
    {
      status: 'revoked',
      source: 'mock-authority',
      reason: 'Subscription revoked by authority.'
    },
    { now: new Date('2026-04-17T12:00:00.000Z').valueOf() }
  );
  const malformed = normalizeAuthorityRefreshResponse(
    {
      status: 'active',
      source: 'mock-authority'
    },
    { now: new Date('2026-04-17T12:00:00.000Z').valueOf() }
  );

  assert.equal(revoked.ok, true);
  assert.equal(revoked.status, 'revoked');
  assert.equal(revoked.reason.includes('revoked'), true);
  assert.equal(malformed.ok, false);
  assert.equal(malformed.reason.includes('payload'), true);
});

runTest('stale entitlement summary is derived from authority freshness window', () => {
  const staleNow = new Date('2026-04-18T18:00:00.000Z').valueOf();
  const snapshot = getEntitlementSnapshot({
    now: staleNow,
    allowPersistence: false,
    rawSnapshot: {
      userId: 'user-1',
      plan: 'pro',
      featureFlags: {
        ai_suggest: true,
        calendar_read: true,
        calendar_write: true,
        advanced_recurrence: true,
        tasks_manage: true
      },
      entitlements: ['tasks.basic', 'calendar.read', 'ai.suggest'],
      source: 'mock-authority',
      token: 'rabbit-signature:test-token',
      issuedAt: '2026-04-17T08:00:00.000Z',
      expiresAt: '2026-04-30T08:00:00.000Z',
      authority: {
        status: 'fresh',
        source: 'mock-authority',
        checkedAt: '2026-04-17T08:00:00.000Z',
        lastAttemptAt: '2026-04-17T08:00:00.000Z',
        lastSuccessfulAt: '2026-04-17T08:00:00.000Z',
        staleAfterMs: ENTITLEMENT_REFRESH_STALE_MS
      }
    }
  });
  const summary = getEntitlementStateSummary({
    ...snapshot,
    now: staleNow
  });

  assert.equal(summary.isStale, true);
  assert.equal(summary.authorityStatus, 'stale');
  assert.equal(summary.reason.includes('freshness'), true);
});

await runAsyncTest('authority refresh upgrade path persists a fresh entitlement snapshot', async () => {
  const storage = createLocalStorageMock();
  const now = new Date('2026-04-17T12:00:00.000Z').valueOf();
  await withLocalStorage(storage, async () => {
    const snapshot = await refreshEntitlementSnapshot({
      now,
      transport: createMockEntitlementTransport()
    });
    const check = requireEntitlement('ai_suggest', now, snapshot);
    const saved = JSON.parse(storage.getItem(ENTITLEMENT_STORAGE_KEY));

    assert.equal(snapshot.authority.status, 'fresh');
    assert.equal(snapshot.plan, 'free');
    assert.equal(check.allowed, false);
    assert.equal(saved.authority.status, 'fresh');
    assert.equal(saved.authority.source, 'mock-authority');
  });
});

await runAsyncTest('authority refresh can mock an upgrade and unlock premium flags', async () => {
  const storage = createLocalStorageMock();
  const now = new Date('2026-04-17T12:10:00.000Z').valueOf();
  await withLocalStorage(storage, async () => {
    const snapshot = await refreshEntitlementSnapshot({
      now,
      scenario: 'upgrade',
      transport: createMockEntitlementTransport()
    });
    const summary = getEntitlementStateSummary(snapshot);

    assert.equal(snapshot.authority.status, 'fresh');
    assert.equal(snapshot.plan, 'pro');
    assert.equal(summary.aiEnabled, true);
    assert.equal(summary.calendarReadEnabled, true);
    assert.equal(requireEntitlement('ai_suggest', now, snapshot).allowed, true);
  });
});

await runAsyncTest('offline authority refresh keeps the last safe snapshot and marks it offline', async () => {
  const storage = createLocalStorageMock();
  const onlineNow = new Date('2026-04-17T12:15:00.000Z').valueOf();
  const offlineNow = new Date('2026-04-17T12:30:00.000Z').valueOf();
  await withLocalStorage(storage, async () => {
    await refreshEntitlementSnapshot({
      now: onlineNow,
      scenario: 'upgrade',
      transport: createMockEntitlementTransport()
    });

    const snapshot = await refreshEntitlementSnapshot({
      now: offlineNow,
      scenario: 'offline',
      transport: createMockEntitlementTransport()
    });
    const summary = getEntitlementStateSummary(snapshot);

    assert.equal(summary.isOffline, true);
    assert.equal(summary.authorityStatus, 'offline');
    assert.equal(snapshot.plan, 'pro');
    assert.equal(summary.aiEnabled, true);
    assert.equal(summary.reason.includes('offline'), true);
  });
});

await runAsyncTest('revoked authority refresh forces read-only fallback', async () => {
  const storage = createLocalStorageMock();
  const now = new Date('2026-04-17T13:00:00.000Z').valueOf();
  await withLocalStorage(storage, async () => {
    const snapshot = await refreshEntitlementSnapshot({
      now,
      scenario: 'revoked',
      transport: createMockEntitlementTransport()
    });
    const summary = getEntitlementStateSummary(snapshot);
    const taskCheck = requireEntitlement('tasks_manage', now, snapshot);

    assert.equal(summary.isRevoked, true);
    assert.equal(summary.authorityStatus, 'revoked');
    assert.equal(summary.canMutate, false);
    assert.equal(taskCheck.allowed, false);
    assert.equal(taskCheck.reason.includes('revoked'), true);
  });
});

runTest('task IDs are stable unique shape', () => {
  const first = createTaskId();
  const second = createTaskId();
  assert.equal(first === second, false);
  assert.equal(first.length > 10, true);
});

runTest('storage contract migrates legacy payloads by injecting calendar and shell state', () => {
  const result = validatePersistedPayload({
    version: '0.9.0',
    schemaVersion: 1,
    projects: fixtureState.projects,
    tasks: fixtureState.tasks
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(result.value.migration.hasMigration, true);
  assert.equal(result.value.migration.fromVersion, 1);
  assert.equal(result.value.migration.toVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(Array.isArray(result.value.projects), true);
  assert.equal(result.value.projects.length, 3);
  assert.equal(result.value.tasks.length, 5);
  assert.equal(Array.isArray(result.value.calendarOverlay.importedEvents), true);
  assert.equal(result.value.calendarOverlay.importedEvents.length, 0);
  assert.equal(Array.isArray(result.value.shell.tabs), true);
  assert.equal(Array.isArray(result.value.shell.savedViews), true);
  assert.equal(result.value.shell.activeTabId, 'tab_calendar');
});

runTest('storage contract keeps seeded shell state on current fixture payloads', () => {
  const result = validatePersistedPayload(fixtureState);

  assert.equal(result.ok, true);
  assert.equal(result.value.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(result.value.shell.theme.mode, 'dark');
  assert.equal(result.value.shell.savedViews.length, 4);
  assert.equal(result.value.shell.sidebarSections.length, 2);
  assert.equal(result.value.shell.agenda.counts.total, 6);
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
  assert.equal(Array.isArray(result.value.calendarOverlay.importedEvents), true);
});

runTest('storage load/save path keeps sync metadata, outbox, and revision-safe data shape', () => {
  const storage = createLocalStorageMock();
  withLocalStorage(storage, () => {
    const outboxEvent = createTaskSyncEvent({
      action: 'create',
      task: normalizeTask({
        id: 'sync-fixture-1',
        title: 'Persist sync event',
        projectId: 'inbox',
        dueAt: '2026-04-17T12:05:00.000Z',
        durationMinutes: 30
      }),
      revision: 'mut_fixture_create',
      occurredAt: '2026-04-17T12:05:00.000Z'
    });

    const payload = {
      schemaVersion: 1,
      version: '0.9.0',
      projects: getFixtureState().projects,
      tasks: getFixtureState().tasks,
      calendarOverlay: getFixtureState().calendarOverlay,
      shell: getFixtureState().shell,
      outbox: [outboxEvent, outboxEvent],
      lastSyncAt: '2026-04-17T12:00:00.000Z',
      syncCursor: 'cursor_step15',
      syncStatus: 'synced',
      metadata: { source: 'desktop', syncState: 'local' }
    };

    const savedSnapshot = saveStoredData(payload);
    const raw = storage.getItem('motion_clone_phase1_app_data');
    assert.equal(typeof raw, 'string');

    const saved = JSON.parse(raw);
    assert.equal(saved.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(typeof saved.metadata, 'object');
    assert.equal(saved.metadata.app, 'rabbit');
    assert.equal(saved.metadata.source, 'desktop');
    assert.equal(saved.metadata.syncState, 'pending');
    assert.equal(saved.metadata.shellState, 'present');
    assert.equal(Array.isArray(saved.outbox), true);
    assert.equal(saved.outbox.length, 1);
    assert.equal(saved.syncCursor, 'cursor_step15');
    assert.equal(saved.syncStatus, 'pending');
    assert.equal(typeof saved.deviceId, 'string');
    assert.equal(saved.calendarOverlay.permissionStatus, 'granted');
    assert.equal(saved.calendarOverlay.importedEvents.length, 3);
    assert.equal(saved.shell.theme.mode, 'dark');
    assert.equal(saved.shell.tabs.length, 3);
    assert.equal(saved.shell.savedViews.length, 4);
    assert.equal(savedSnapshot.syncStatus, 'pending');
    assert.equal(savedSnapshot.outbox.length, 1);
    assert.equal(savedSnapshot.calendarOverlay.source.provider, 'google');
    assert.equal(savedSnapshot.shell.activeViewId, 'view_my_tasks');

    const loaded = loadStoredData();
    assert.equal(Array.isArray(loaded.tasks), true);
    assert.equal(loaded.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(Array.isArray(loaded.outbox), true);
    assert.equal(loaded.outbox.length, 1);
    assert.equal(loaded.outbox[0]?.entityType, 'task');
    assert.equal(loaded.syncCursor, 'cursor_step15');
    assert.equal(loaded.syncStatus, 'pending');
    assert.equal(loaded.deviceId, saved.deviceId);
    assert.equal(loaded.calendarOverlay.permissionStatus, 'granted');
    assert.equal(loaded.calendarOverlay.importedEvents.length, 3);
    assert.equal(loaded.calendarOverlay.importedEvents[0]?.provider, 'google');
    assert.equal(Array.isArray(loaded.shell.tabs), true);
    assert.equal(loaded.shell.tabs.length, 3);
    assert.equal(loaded.shell.savedViews.length, 4);
    assert.equal(loaded.shell.agenda.counts.total, 6);
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

console.log(`PASS: Phase 3 acceptance test suite completed (${baseTasks.length} fixture tasks)`);
