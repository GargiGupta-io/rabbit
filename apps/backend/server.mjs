import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { getFixtureState } from '../desktop/src/fixtures.js';
import {
  DEFAULT_CURRENT_USER_EMAIL,
  DEFAULT_CURRENT_USER_ID,
  DEFAULT_CURRENT_USER_NAME
} from '../desktop/src/identityDefaults.js';
import { normalizeTask } from '../desktop/src/taskService.js';

const DEFAULT_PORT = 8787;
const DEFAULT_HOST = '127.0.0.1';
const CORS_HEADERS = Object.freeze({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
});

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)])
    );
  }

  return value;
}

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function normalizeNumber(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readTextEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(days = 14) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function buildCurrentUser() {
  return {
    id: DEFAULT_CURRENT_USER_ID,
    userId: DEFAULT_CURRENT_USER_ID,
    name: DEFAULT_CURRENT_USER_NAME,
    displayName: DEFAULT_CURRENT_USER_NAME,
    email: DEFAULT_CURRENT_USER_EMAIL,
    tier: 'pro',
    plan: 'pro',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    subscriptionExpiresAt: addDays(30)
  };
}

function buildFeaturePermissions() {
  return {
    featurePermissionTier: 'pro',
    plan: 'pro',
    tier: 'pro',
    aiChat: true,
    aiSuggest: true,
    ai_suggest: true,
    calendarRead: true,
    calendar_read: true,
    calendarWrite: true,
    calendar_write: true,
    advancedRecurrence: true,
    advanced_recurrence: true,
    tasksManage: true,
    tasks_manage: true,
    revoked: false,
    status: 'active',
    issuedAt: nowIso(),
    expiresAt: addDays(14)
  };
}

export function createLocalBackendState() {
  const fixture = getFixtureState();
  const activeWorkspaceId = sanitizeText(fixture.workspaces?.[0]?.id, 'ws_private_my_tasks');
  const activeViewId = sanitizeText(fixture.shell?.activeViewId, 'view_my_tasks');
  const activeTabId = sanitizeText(fixture.shell?.activeTabId, 'tab_calendar');
  const pageViewSettings = {
    activeWorkspaceId,
    activeViewId,
    activeTabId
  };

  return {
    currentUser: buildCurrentUser(),
    featurePermissions: buildFeaturePermissions(),
    pageViewSettings,
    taskDefaults: {
      scheduleMode: 'auto',
      durationMinutes: 30
    },
    firebaseProviderTypes: ['GOOGLE'],
    guestTeams: [],
    views: cloneValue(fixture.shell?.savedViews || []),
    inbox: cloneValue(fixture.inbox || { inboxes: [], activeInboxId: 'inbox_personal', items: [] }),
    tasks: cloneValue(fixture.tasks || []),
    calendars: cloneValue(fixture.calendarOverlay?.calendars || []),
    calendarEvents: cloneValue(fixture.calendarOverlay?.importedEvents || []),
    syncCursor: `cursor_${Date.now()}`,
    nextTaskId: (fixture.tasks || []).length + 1
  };
}

export function buildBootstrapResponse(state, args = {}) {
  const requestedWorkspaceId = sanitizeText(args.workspaceId, state.pageViewSettings.activeWorkspaceId);
  const requestedViewId = sanitizeText(args.viewId, state.pageViewSettings.activeViewId);
  const activeViewId = requestedViewId || state.pageViewSettings.activeViewId;
  const activeTabId = sanitizeText(
    args.activeTabId,
    state.pageViewSettings.activeTabId || (activeViewId ? `tab_${activeViewId}` : 'tab_calendar')
  );
  const pageViewSettings = {
    activeWorkspaceId: requestedWorkspaceId || state.pageViewSettings.activeWorkspaceId,
    activeViewId,
    activeTabId
  };

  return {
    activeViewId,
    activeTabId,
    pageViewSettings,
    settings: {
      pageViewSettings
    },
    bootstrap: {
      activeViewId,
      activeTabId
    }
  };
}

function countUnreadInboxItems(state) {
  return (Array.isArray(state.inbox?.items) ? state.inbox.items : []).filter((item) => !item.read).length;
}

function createJsonHeaders(extra = {}) {
  return {
    ...CORS_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    ...extra
  };
}

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, createJsonHeaders());
  response.end(JSON.stringify(payload, null, 2));
}

function writeEmpty(response, statusCode = 204) {
  response.writeHead(statusCode, CORS_HEADERS);
  response.end();
}

function writeNotFound(response, pathname) {
  writeJson(response, 404, {
    error: 'Not found',
    pathname
  });
}

function writeUnauthorized(response) {
  writeJson(response, 401, {
    error: 'Unauthorized'
  });
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on('data', (chunk) => {
      chunks.push(chunk);
    });

    request.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        resolve(isPlainObject(parsed) ? parsed : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

function matchesAuthorization(request, requiredToken) {
  if (!requiredToken) {
    return true;
  }

  const header = sanitizeText(request.headers.authorization);
  return header === `Bearer ${requiredToken}`;
}

function findTaskIndex(tasks, id) {
  return tasks.findIndex((task) => sanitizeText(task?.id) === sanitizeText(id));
}

function generateBackendTaskId(state) {
  const nextId = `task_backend_${state.nextTaskId}`;
  state.nextTaskId += 1;
  return nextId;
}

function normalizeUploadOperation(raw) {
  const payload = isPlainObject(raw) ? raw : {};
  return {
    op_id: normalizeNumber(payload.op_id, 0),
    op: sanitizeText(payload.op).toUpperCase(),
    type: sanitizeText(payload.type, 'tasks'),
    id: sanitizeText(payload.id),
    data: isPlainObject(payload.data) ? cloneValue(payload.data) : null,
    old: isPlainObject(payload.old) ? cloneValue(payload.old) : null
  };
}

function createUploadError(operationId, message) {
  return {
    operation: operationId,
    error: message
  };
}

export function handlePowerSyncUpload(state, payload = {}) {
  const operations = Array.isArray(payload.operations) ? payload.operations.map((entry) => normalizeUploadOperation(entry)) : [];
  const errors = [];
  const idMappings = [];

  operations.forEach((operation) => {
    if (operation.type !== 'tasks') {
      errors.push(createUploadError(operation.op_id, `Unsupported table: ${operation.type || 'unknown'}`));
      return;
    }

    if (operation.op !== 'PUT' && operation.op !== 'PATCH' && operation.op !== 'DELETE') {
      errors.push(createUploadError(operation.op_id, `Unsupported operation: ${operation.op || 'unknown'}`));
      return;
    }

    if (!operation.id) {
      errors.push(createUploadError(operation.op_id, 'Missing task id.'));
      return;
    }

    if (operation.op === 'DELETE') {
      const index = findTaskIndex(state.tasks, operation.id);
      if (index >= 0) {
        state.tasks.splice(index, 1);
      }
      return;
    }

    const existingIndex = findTaskIndex(state.tasks, operation.id);
    const existingTask = existingIndex >= 0 ? state.tasks[existingIndex] : null;
    const shouldRemapId = operation.op === 'PUT' && (
      operation.id.startsWith('temp_') ||
      operation.id.startsWith('rabbit_validate_')
    );
    const finalId = shouldRemapId ? generateBackendTaskId(state) : operation.id;
    const normalizedTask = normalizeTask({
      ...(existingTask || {}),
      ...(operation.data || {}),
      id: finalId
    });

    if (!normalizedTask) {
      errors.push(createUploadError(operation.op_id, 'Task payload could not be normalized.'));
      return;
    }

    if (existingIndex >= 0) {
      state.tasks[existingIndex] = normalizedTask;
    } else {
      state.tasks.push(normalizedTask);
    }

    if (shouldRemapId) {
      idMappings.push({
        tempId: operation.id,
        realId: finalId,
        table: 'tasks'
      });
    }
  });

  state.syncCursor = `cursor_${Date.now()}`;

  return {
    success: errors.length === 0,
    idMappings,
    errors,
    syncCursor: state.syncCursor
  };
}

function filterCalendarEventsByProviderIds(events, providerIds = []) {
  if (!providerIds.length) {
    return events.slice();
  }

  const allowed = new Set(providerIds.map((value) => sanitizeText(value)).filter(Boolean));
  return events.filter((event) => {
    const providerId = sanitizeText(event?.providerId || event?.id);
    const calendarId = sanitizeText(event?.calendarId);
    return allowed.has(providerId) || allowed.has(calendarId);
  });
}

function markInboxItemsAsRead(state, body = {}) {
  const items = Array.isArray(state.inbox?.items) ? state.inbox.items : [];

  if (body.type === 'single') {
    const targetId = sanitizeText(body.itemId);
    return items.map((item) => sanitizeText(item.id) === targetId ? { ...item, read: true } : item);
  }

  if (body.type === 'multiple' && Array.isArray(body.itemIds)) {
    const ids = new Set(body.itemIds.map((value) => sanitizeText(value)).filter(Boolean));
    return items.map((item) => ids.has(sanitizeText(item.id)) ? { ...item, read: true } : item);
  }

  return items.map((item) => ({ ...item, read: true }));
}

export function createRequestHandler(state, options = {}) {
  const requiredToken = sanitizeText(options.requiredToken);

  return async function handleRequest(request, response) {
    const method = sanitizeText(request.method, 'GET').toUpperCase();
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (method === 'OPTIONS') {
      writeEmpty(response);
      return;
    }

    if (!matchesAuthorization(request, requiredToken)) {
      writeUnauthorized(response);
      return;
    }

    try {
      if (method === 'GET' && pathname === '/health') {
        writeJson(response, 200, {
          ok: true,
          name: 'rabbit-local-backend',
          now: nowIso()
        });
        return;
      }

      if (method === 'POST' && pathname === '/v2/ui/bootstrap') {
        const body = await readRequestBody(request);
        writeJson(response, 200, buildBootstrapResponse(state, body));
        return;
      }

      if (method === 'GET' && pathname === '/v2/users/me') {
        writeJson(response, 200, state.currentUser);
        return;
      }

      if (method === 'GET' && pathname === '/v2/users/me/feature-permissions') {
        writeJson(response, 200, state.featurePermissions);
        return;
      }

      if (method === 'GET' && pathname === '/v2/users/me/settings') {
        writeJson(response, 200, {
          pageViewSettings: state.pageViewSettings,
          taskDefaults: state.taskDefaults
        });
        return;
      }

      if (method === 'GET' && pathname === '/v2/users/me/settings/page-view') {
        writeJson(response, 200, state.pageViewSettings);
        return;
      }

      if (method === 'GET' && pathname === '/v2/users/me/settings/firebase-provider-types') {
        writeJson(response, 200, state.firebaseProviderTypes);
        return;
      }

      if (method === 'GET' && pathname === '/v2/users/me/guest-teams') {
        writeJson(response, 200, state.guestTeams);
        return;
      }

      if (method === 'GET' && pathname === '/v3/views') {
        writeJson(response, 200, {
          views: state.views
        });
        return;
      }

      if (method === 'GET' && pathname === '/v2/notifications/items') {
        writeJson(response, 200, {
          items: state.inbox.items
        });
        return;
      }

      if (method === 'GET' && pathname === '/v2/notifications/unread-count') {
        const unreadCount = countUnreadInboxItems(state);
        writeJson(response, 200, {
          unreadCount,
          count: unreadCount
        });
        return;
      }

      if (method === 'PATCH' && pathname === '/v2/notifications/mark-status') {
        const body = await readRequestBody(request);
        state.inbox.items = markInboxItemsAsRead(state, body);
        writeJson(response, 200, {
          success: true,
          unreadCount: countUnreadInboxItems(state)
        });
        return;
      }

      if (method === 'POST' && pathname === '/v2/tasks/query') {
        writeJson(response, 200, {
          tasks: state.tasks
        });
        return;
      }

      if (method === 'GET' && pathname === '/v2/tasks/past_due') {
        const now = Date.now();
        const tasks = state.tasks.filter((task) => {
          const dueAt = Date.parse(task?.dueAt || '');
          return Number.isFinite(dueAt) && dueAt < now && sanitizeText(task?.status) !== 'done';
        });
        writeJson(response, 200, {
          tasks
        });
        return;
      }

      const taskMatch = pathname.match(/^\/v2\/tasks\/([^/]+)$/);
      if (method === 'GET' && taskMatch) {
        const taskId = decodeURIComponent(taskMatch[1]);
        const task = state.tasks.find((entry) => sanitizeText(entry?.id) === sanitizeText(taskId));
        if (!task) {
          writeNotFound(response, pathname);
          return;
        }
        writeJson(response, 200, task);
        return;
      }

      if (method === 'GET' && pathname === '/v2/calendars') {
        writeJson(response, 200, {
          calendars: state.calendars
        });
        return;
      }

      if (method === 'POST' && pathname === '/calendar_list') {
        writeJson(response, 200, {
          calendarList: state.calendars
        });
        return;
      }

      if (method === 'GET' && pathname === '/v2/calendar_events/gantt') {
        const providerIds = [
          ...url.searchParams.getAll('providerIds[]'),
          ...url.searchParams.getAll('providerIds')
        ];
        writeJson(response, 200, {
          calendarEvents: filterCalendarEventsByProviderIds(state.calendarEvents, providerIds)
        });
        return;
      }

      if (method === 'POST' && pathname === '/powersync/upload') {
        const body = await readRequestBody(request);
        writeJson(response, 200, handlePowerSyncUpload(state, body));
        return;
      }

      writeNotFound(response, pathname);
    } catch (error) {
      writeJson(response, 500, {
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
}

export function startLocalBackendServer(options = {}) {
  const state = options.state || createLocalBackendState();
  const host = sanitizeText(options.host, readTextEnv('RABBIT_BACKEND_HOST') || DEFAULT_HOST);
  const port = normalizeNumber(options.port, normalizeNumber(readTextEnv('RABBIT_BACKEND_PORT', 'PORT'), DEFAULT_PORT));
  const requiredToken = sanitizeText(options.requiredToken, readTextEnv('RABBIT_BACKEND_TOKEN', 'RABBIT_BACKEND_AUTH_TOKEN'));
  const server = http.createServer(createRequestHandler(state, { requiredToken }));

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, host, () => {
      const address = server.address();
      const boundPort = isPlainObject(address) ? address.port : port;
      const baseUrl = `http://${host}:${boundPort}`;
      resolve({
        server,
        state,
        host,
        port: boundPort,
        baseUrl,
        requiredToken
      });
    });
  });
}

function isDirectExecution() {
  const currentFile = fileURLToPath(import.meta.url);
  const executedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return currentFile === executedFile;
}

if (isDirectExecution()) {
  startLocalBackendServer()
    .then(({ baseUrl, requiredToken }) => {
      console.log(`Rabbit local backend listening at ${baseUrl}`);
      if (requiredToken) {
        console.log('Authorization: bearer token required');
      } else {
        console.log('Authorization: none');
      }
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
