import { applyClientTransform, resolveClientRequest } from './apiClient.js';
import { getCurrentUser, getFeaturePermissions } from './bootstrapClient.js';
import { normalizeCalendarOverlay } from './calendarService.js';
import { normalizeSavedViews } from './shellService.js';
import { normalizeOutbox } from './syncContract.js';
import {
  createPowerSyncUploadRequest,
  normalizePowerSyncUploadResponse
} from './syncClient.js';
import { normalizeTask } from './taskService.js';

const BACKEND_STATUSES = new Set(['unconfigured', 'idle', 'connecting', 'online', 'error']);
const FALLBACK_PROJECT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
const DEFAULT_INBOX_STATE = Object.freeze({
  inboxes: [
    {
      id: 'inbox_personal',
      label: 'Inbox',
      kind: 'personal',
      sourceIds: ['rabbit-notifications']
    }
  ],
  activeInboxId: 'inbox_personal',
  items: []
});

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }

  return parsed.toISOString();
}

function nowIso(now = Date.now()) {
  return new Date(now).toISOString();
}

function addDays(now = Date.now(), days = 14) {
  return new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
}

function normalizeBaseUrl(value) {
  const candidate = sanitizeText(value);
  if (!candidate) {
    return null;
  }

  const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)
    ? candidate
    : /^(localhost|127(?:\.\d{1,3}){3})(:\d+)?(\/|$)/i.test(candidate)
      ? `http://${candidate}`
      : `https://${candidate}`;

  try {
    const parsed = new URL(normalized);
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function normalizeBackendStatus(value, hasConfig) {
  const candidate = sanitizeText(value).toLowerCase();
  if (BACKEND_STATUSES.has(candidate)) {
    return candidate;
  }
  return hasConfig ? 'idle' : 'unconfigured';
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

function extractObjectValues(value = {}) {
  return isPlainObject(value) ? Object.values(value) : [];
}

function readPathValue(root, path = []) {
  let current = root;
  for (const segment of path) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function readFirstText(root, paths = [], fallback = '') {
  for (const path of paths) {
    const value = readPathValue(root, path);
    const normalized = sanitizeText(value);
    if (normalized) {
      return normalized;
    }
  }
  return fallback;
}

function readFirstDate(root, paths = []) {
  for (const path of paths) {
    const value = normalizeDate(readPathValue(root, path));
    if (value) {
      return value;
    }
  }
  return null;
}

function readFirstBoolean(root, paths = [], fallback = false) {
  for (const path of paths) {
    const value = readPathValue(root, path);
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return fallback;
}

function buildEntitlementList(featureFlags = {}) {
  const entries = ['tasks.basic', 'projects.basic', 'search.basic'];
  if (featureFlags.calendar_read) {
    entries.push('calendar.read');
  }
  if (featureFlags.calendar_write) {
    entries.push('calendar.write');
  }
  if (featureFlags.ai_suggest) {
    entries.push('ai.suggest');
  }
  if (featureFlags.advanced_recurrence) {
    entries.push('recurrence.advanced');
  }
  return [...new Set(entries)];
}

function extractItemsFromIdsAndModels(raw, modelKey) {
  if (!isPlainObject(raw)) {
    return [];
  }

  const ids = Array.isArray(raw.ids) ? raw.ids : [];
  const models = isPlainObject(raw.models?.[modelKey]) ? raw.models[modelKey] : null;
  if (!ids.length || !models) {
    return [];
  }

  return ids
    .map((id) => models[id])
    .filter(Boolean);
}

function resolveTaskRecords(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (!isPlainObject(raw)) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(raw, 'tasks')) {
    return Array.isArray(raw.tasks) ? raw.tasks : [];
  }

  const taskModels = extractItemsFromIdsAndModels(raw, 'tasks');
  if (taskModels.length || (Array.isArray(raw.ids) && isPlainObject(raw.models?.tasks))) {
    return taskModels;
  }

  if (isPlainObject(raw.models?.tasks)) {
    return extractObjectValues(raw.models.tasks);
  }

  if (isPlainObject(raw.task)) {
    return [raw.task];
  }

  if (isPlainObject(raw.data)) {
    return resolveTaskRecords(raw.data);
  }

  return null;
}

function resolveViewRecords(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (!isPlainObject(raw)) {
    return [];
  }

  if (Array.isArray(raw.views)) {
    return raw.views;
  }

  const viewModels = extractItemsFromIdsAndModels(raw, 'views');
  if (viewModels.length) {
    return viewModels;
  }

  if (isPlainObject(raw.models?.views)) {
    return extractObjectValues(raw.models.views);
  }

  if (isPlainObject(raw.data)) {
    return resolveViewRecords(raw.data);
  }

  return [];
}

function resolveInboxItems(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (!isPlainObject(raw)) {
    return [];
  }

  if (Array.isArray(raw.items)) {
    return raw.items;
  }

  if (Array.isArray(raw.notifications)) {
    return raw.notifications;
  }

  if (isPlainObject(raw.data)) {
    return resolveInboxItems(raw.data);
  }

  return [];
}

function resolveCalendarRecords(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (!isPlainObject(raw)) {
    return [];
  }

  if (Array.isArray(raw.calendars)) {
    return raw.calendars;
  }

  if (Array.isArray(raw.calendarList)) {
    return raw.calendarList;
  }

  if (isPlainObject(raw.models?.calendars)) {
    return extractObjectValues(raw.models.calendars);
  }

  if (isPlainObject(raw.data)) {
    return resolveCalendarRecords(raw.data);
  }

  return [];
}

function resolveCalendarEventRecords(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (!isPlainObject(raw)) {
    return [];
  }

  if (Array.isArray(raw.calendarEvents)) {
    return raw.calendarEvents;
  }

  if (Array.isArray(raw.events)) {
    return raw.events;
  }

  if (Array.isArray(raw.importedEvents)) {
    return raw.importedEvents;
  }

  if (isPlainObject(raw.data)) {
    return resolveCalendarEventRecords(raw.data);
  }

  return [];
}

function mergeProjectList(currentProjects = [], tasks = []) {
  const nextById = new Map();

  (Array.isArray(currentProjects) ? currentProjects : []).forEach((project, index) => {
    const id = sanitizeText(project?.id);
    if (!id) {
      return;
    }

    nextById.set(id, {
      id,
      name: sanitizeText(project?.name, id),
      color: sanitizeText(project?.color, FALLBACK_PROJECT_COLORS[index % FALLBACK_PROJECT_COLORS.length]),
      archived: Boolean(project?.archived)
    });
  });

  (Array.isArray(tasks) ? tasks : []).forEach((task, index) => {
    const projectId = sanitizeText(task?.projectId);
    if (!projectId) {
      return;
    }

    const existing = nextById.get(projectId);
    nextById.set(projectId, {
      id: projectId,
      name: sanitizeText(task?.projectName, existing?.name || projectId),
      color: existing?.color || FALLBACK_PROJECT_COLORS[(nextById.size + index) % FALLBACK_PROJECT_COLORS.length],
      archived: Boolean(existing?.archived)
    });
  });

  return [...nextById.values()];
}

function buildPendingTaskState(currentAppData = {}) {
  const pendingById = new Map();
  const deletedIds = new Set();
  const currentTasks = Array.isArray(currentAppData.tasks) ? currentAppData.tasks : [];
  const taskById = new Map(currentTasks.map((task) => [sanitizeText(task?.id), task]));

  normalizeOutbox(currentAppData.outbox).forEach((event) => {
    if (sanitizeText(event?.entityType, 'task') !== 'task') {
      return;
    }

    const entityId = sanitizeText(event?.entityId);
    if (!entityId) {
      return;
    }

    if (sanitizeText(event?.action) === 'delete') {
      deletedIds.add(entityId);
      pendingById.delete(entityId);
      return;
    }

    const currentTask = taskById.get(entityId);
    if (currentTask) {
      pendingById.set(entityId, currentTask);
    }
  });

  return {
    pendingById,
    deletedIds
  };
}

function mergeTasksWithPendingLocal(currentAppData = {}, remoteTasks = []) {
  const normalizedRemote = (Array.isArray(remoteTasks) ? remoteTasks : [])
    .map((task) => normalizeTask(task))
    .filter(Boolean);

  const mergedById = new Map(normalizedRemote.map((task) => [task.id, task]));
  const { pendingById, deletedIds } = buildPendingTaskState(currentAppData);

  deletedIds.forEach((taskId) => mergedById.delete(taskId));
  pendingById.forEach((task, taskId) => {
    mergedById.set(taskId, task);
  });

  return [...mergedById.values()];
}

function mergeCalendarEvents(currentEvents = [], remoteEvents = [], hasRemoteEvents = false) {
  if (!hasRemoteEvents) {
    return Array.isArray(currentEvents) ? currentEvents.slice() : [];
  }

  const remoteById = new Map();
  (Array.isArray(remoteEvents) ? remoteEvents : []).forEach((event) => {
    const id = sanitizeText(event?.id || event?.providerId);
    if (id) {
      remoteById.set(id, cloneValue(event));
    }
  });

  (Array.isArray(currentEvents) ? currentEvents : []).forEach((event) => {
    const id = sanitizeText(event?.id || event?.providerId);
    if (!id) {
      return;
    }

    const shouldPreserveLocal = Boolean(event?.isPendingSync) || id.startsWith('quick_meeting_');
    if (shouldPreserveLocal && !remoteById.has(id)) {
      remoteById.set(id, cloneValue(event));
    }
  });

  return [...remoteById.values()];
}

function normalizeInboxState(raw, fallback = DEFAULT_INBOX_STATE) {
  const input = isPlainObject(raw) ? raw : {};
  const fallbackState = isPlainObject(fallback) ? fallback : DEFAULT_INBOX_STATE;
  const inboxes = (Array.isArray(input.inboxes) ? input.inboxes : fallbackState.inboxes)
    .map((entry) => {
      const id = sanitizeText(entry?.id);
      const label = sanitizeText(entry?.label || entry?.name);
      if (!id || !label) {
        return null;
      }

      return {
        id,
        label,
        kind: sanitizeText(entry?.kind, 'personal'),
        sourceIds: Array.isArray(entry?.sourceIds)
          ? entry.sourceIds.map((value) => sanitizeText(value)).filter(Boolean)
          : []
      };
    })
    .filter(Boolean);
  const defaultInboxId = inboxes[0]?.id || DEFAULT_INBOX_STATE.activeInboxId;
  const items = resolveInboxItems(input)
    .map((item) => {
      const id = sanitizeText(item?.id);
      const type = sanitizeText(item?.type);
      const createdTime = normalizeDate(item?.createdTime || item?.createdAt);
      if (!id || !type || !createdTime) {
        return null;
      }

      return {
        ...cloneValue(item),
        id,
        inboxId: sanitizeText(item?.inboxId, defaultInboxId),
        type,
        read: Boolean(item?.read),
        createdTime
      };
    })
    .filter(Boolean);

  return {
    inboxes: inboxes.length ? inboxes : cloneValue(DEFAULT_INBOX_STATE.inboxes),
    activeInboxId: sanitizeText(input.activeInboxId, defaultInboxId),
    items
  };
}

function readBootstrapActiveViewId(raw) {
  return readFirstText(raw, [
    ['activeViewId'],
    ['pageViewSettings', 'activeViewId'],
    ['settings', 'pageViewSettings', 'activeViewId'],
    ['bootstrap', 'activeViewId']
  ]);
}

function readBootstrapActiveTabId(raw) {
  return readFirstText(raw, [
    ['activeTabId'],
    ['pageViewSettings', 'activeTabId'],
    ['settings', 'pageViewSettings', 'activeTabId'],
    ['bootstrap', 'activeTabId']
  ]);
}

function resolveCalendarPermissionStatus(featurePermissions = {}, currentOverlay = {}) {
  if (readFirstBoolean(featurePermissions, [['calendar_read'], ['calendarRead']], false)) {
    return 'granted';
  }

  if (readFirstText(featurePermissions, [['status']]).toLowerCase() === 'revoked') {
    return 'denied';
  }

  return sanitizeText(currentOverlay?.permissionStatus, 'unknown');
}

function buildEntitlementPayload(currentUser = {}, featurePermissions = {}, previousSnapshot = {}, now = Date.now()) {
  const featureFlags = {
    ai_suggest: readFirstBoolean(featurePermissions, [['ai_suggest'], ['aiSuggest'], ['aiChat']], previousSnapshot?.featureFlags?.ai_suggest || false),
    calendar_read: readFirstBoolean(featurePermissions, [['calendar_read'], ['calendarRead']], previousSnapshot?.featureFlags?.calendar_read || false),
    calendar_write: readFirstBoolean(featurePermissions, [['calendar_write'], ['calendarWrite']], previousSnapshot?.featureFlags?.calendar_write || false),
    advanced_recurrence: readFirstBoolean(featurePermissions, [['advanced_recurrence'], ['advancedRecurrence']], previousSnapshot?.featureFlags?.advanced_recurrence || false),
    tasks_manage: readFirstBoolean(featurePermissions, [['tasks_manage'], ['tasksManage']], previousSnapshot?.featureFlags?.tasks_manage ?? true)
  };
  const issuedAt = readFirstDate(featurePermissions, [['issuedAt'], ['refreshedAt']])
    || readFirstDate(currentUser, [['updatedAt'], ['createdAt']])
    || nowIso(now);
  const expiresAt = readFirstDate(featurePermissions, [['expiresAt'], ['validUntil'], ['subscriptionExpiresAt']])
    || readFirstDate(currentUser, [['subscriptionExpiresAt']])
    || addDays(now, 14);

  return {
    userId: readFirstText(currentUser, [['id'], ['userId']], sanitizeText(previousSnapshot?.userId, 'local-dev')),
    plan: readFirstText(featurePermissions, [['featurePermissionTier'], ['plan'], ['tier']], readFirstText(currentUser, [['plan'], ['tier']], sanitizeText(previousSnapshot?.plan, 'free'))).toLowerCase(),
    featureFlags,
    entitlements: Array.isArray(featurePermissions?.entitlements)
      ? featurePermissions.entitlements.slice()
      : buildEntitlementList(featureFlags),
    source: 'backend-authority',
    token: `rabbit-signature:backend:${now.toString(36)}`,
    issuedAt,
    expiresAt
  };
}

function encodeSearchParams(url, values = {}) {
  if (!isPlainObject(values)) {
    return;
  }

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null && entry !== '') {
          url.searchParams.append(key, String(entry));
        }
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });
}

function createBackendFetchError(message, details = {}) {
  const error = new Error(message);
  error.status = details.status || 0;
  error.url = details.url || null;
  error.method = details.method || null;
  error.responseBody = details.responseBody ?? null;
  error.code = details.code || null;
  return error;
}

async function parseBackendResponseBody(response) {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = sanitizeText(response.headers?.get?.('content-type')).toLowerCase();

  if (contentType.includes('application/json') && typeof response.json === 'function') {
    try {
      return await response.json();
    } catch {
      // Fall through to text parsing below.
    }
  }

  if (typeof response.text === 'function') {
    const text = await response.text();
    const normalizedText = sanitizeText(text);
    if (!normalizedText) {
      return null;
    }

    try {
      return JSON.parse(normalizedText);
    } catch {
      return normalizedText;
    }
  }

  if (typeof response.json === 'function') {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  return null;
}

async function executeResolvedBackendRequest(definition, request, args = {}, options = {}) {
  const backend = normalizeBackendState(options.backend);
  if (!backend.baseUrl) {
    throw createBackendFetchError('Rabbit backend is not configured.', {
      code: 'BACKEND_UNCONFIGURED'
    });
  }

  const fetchImpl = typeof options.fetchImpl === 'function'
    ? options.fetchImpl
    : globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    throw createBackendFetchError('Global fetch is unavailable for the Rabbit backend runtime.', {
      code: 'FETCH_UNAVAILABLE'
    });
  }

  const method = sanitizeText(request?.method, 'GET').toUpperCase();
  const url = buildBackendUrl(backend, request?.uri || '/');
  const headers = {
    Accept: 'application/json',
    ...(backend.authToken ? { Authorization: `Bearer ${backend.authToken}` } : {}),
    ...(isPlainObject(options.headers) ? options.headers : {})
  };
  const shouldSendJsonBody = method !== 'GET' && method !== 'HEAD' && request?.body !== undefined;

  if (shouldSendJsonBody) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetchImpl(url, {
      method,
      headers,
      body: shouldSendJsonBody ? JSON.stringify(request.body) : undefined,
      signal: options.signal
    });
  } catch (error) {
    throw createBackendFetchError(
      error instanceof Error ? error.message : 'Backend request failed.',
      {
        code: 'FETCH_FAILED',
        url,
        method
      }
    );
  }

  const rawData = await parseBackendResponseBody(response);
  if (!response.ok) {
    const message = isPlainObject(rawData)
      ? sanitizeText(rawData.message || rawData.error, `Backend request failed with status ${response.status}.`)
      : sanitizeText(rawData, `Backend request failed with status ${response.status}.`);
    throw createBackendFetchError(message, {
      status: response.status,
      responseBody: rawData,
      url,
      method
    });
  }

  return {
    data: definition ? applyClientTransform(definition, rawData, args) : rawData,
    rawData,
    request,
    status: response.status,
    url
  };
}

export function createDefaultBackendState() {
  return normalizeBackendState({});
}

export function normalizeBackendState(raw = {}) {
  const input = isPlainObject(raw) ? raw : {};
  const baseUrl = normalizeBaseUrl(input.baseUrl || input.url);
  const hasConfig = Boolean(baseUrl);

  return {
    baseUrl,
    authToken: sanitizeText(input.authToken || input.token) || null,
    status: normalizeBackendStatus(input.status, hasConfig),
    lastError: sanitizeText(input.lastError) || null,
    lastRequestAt: normalizeDate(input.lastRequestAt),
    lastConnectedAt: normalizeDate(input.lastConnectedAt),
    lastBootstrapAt: normalizeDate(input.lastBootstrapAt),
    lastDataRefreshAt: normalizeDate(input.lastDataRefreshAt),
    lastPushAt: normalizeDate(input.lastPushAt),
    lastEntitlementRefreshAt: normalizeDate(input.lastEntitlementRefreshAt),
    lastAction: sanitizeText(input.lastAction) || null
  };
}

export function hasBackendConfiguration(raw = {}) {
  return Boolean(normalizeBackendState(raw).baseUrl);
}

export function buildBackendUrl(rawConfig = {}, rawUri = '/') {
  const backend = normalizeBackendState(rawConfig);
  const uri = isPlainObject(rawUri) ? rawUri : { pathname: rawUri };
  const pathname = sanitizeText(uri.pathname, sanitizeText(rawUri, '/'));

  const url = new URL(pathname.startsWith('/') ? pathname : `/${pathname}`, `${backend.baseUrl || 'https://invalid.local'}/`);
  encodeSearchParams(url, uri.search);
  return url.toString();
}

export async function executeBackendDefinition(definition, args = {}, options = {}) {
  const request = resolveClientRequest(definition, args);
  return executeResolvedBackendRequest(definition, request, args, options);
}

export async function executeBackendPowerSyncUpload(outbox = [], rawConfig = {}, options = {}) {
  const uploadRequest = createPowerSyncUploadRequest(outbox, options);
  const result = await executeResolvedBackendRequest(
    null,
    {
      method: 'POST',
      uri: '/powersync/upload',
      body: uploadRequest.body
    },
    {},
    {
      ...options,
      backend: rawConfig
    }
  );

  return {
    ...result,
    uploadRequest,
    syncResponse: normalizePowerSyncUploadResponse(result.rawData, uploadRequest)
  };
}

export function createBackendEntitlementTransport(rawConfig = {}, options = {}) {
  return async function backendEntitlementTransport(request = {}) {
    const now = Number.isFinite(request?.now) ? Number(request.now) : Date.now();
    const previousSnapshot = isPlainObject(request?.previousSnapshot) ? request.previousSnapshot : {};
    const [currentUserResult, featurePermissionsResult] = await Promise.all([
      executeBackendDefinition(getCurrentUser, {}, {
        ...options,
        backend: rawConfig,
        signal: request?.signal
      }),
      executeBackendDefinition(getFeaturePermissions, {}, {
        ...options,
        backend: rawConfig,
        signal: request?.signal
      })
    ]);

    const currentUser = isPlainObject(currentUserResult?.data) ? currentUserResult.data : {};
    const featurePermissions = isPlainObject(featurePermissionsResult?.data) ? featurePermissionsResult.data : {};
    const revoked = readFirstBoolean(featurePermissions, [['revoked'], ['accessRevoked']], false)
      || readFirstText(featurePermissions, [['status']]).toLowerCase() === 'revoked';

    if (revoked) {
      return {
        status: 'revoked',
        source: 'backend-authority',
        reason: 'Access revoked by backend authority.',
        revokedAt: nowIso(now)
      };
    }

    return {
      status: 'active',
      source: 'backend-authority',
      payload: buildEntitlementPayload(currentUser, featurePermissions, previousSnapshot, now)
    };
  };
}

export function hydrateAppDataFromBackend(currentAppData = {}, remote = {}, options = {}) {
  const resolvedTaskRecords = resolveTaskRecords(remote.tasks);
  const nextTasks = remote.tasks === undefined || resolvedTaskRecords === null
    ? Array.isArray(currentAppData.tasks) ? currentAppData.tasks.slice() : []
    : mergeTasksWithPendingLocal(currentAppData, resolvedTaskRecords);
  const nextProjects = mergeProjectList(currentAppData.projects, nextTasks);
  const remoteViews = resolveViewRecords(remote.views);
  const nextViews = remoteViews.length
    ? normalizeSavedViews(remoteViews)
    : Array.isArray(currentAppData.shell?.savedViews)
      ? currentAppData.shell.savedViews.slice()
      : [];
  const bootstrap = isPlainObject(remote.bootstrap) ? remote.bootstrap : {};
  const activeViewId = readBootstrapActiveViewId(bootstrap);
  const activeTabId = readBootstrapActiveTabId(bootstrap);
  const hasRemoteEvents = remote.calendarEvents !== undefined;
  const currentOverlay = isPlainObject(currentAppData.calendarOverlay) ? currentAppData.calendarOverlay : {};
  const remoteCalendars = resolveCalendarRecords(remote.calendars);
  const remoteCalendarEvents = resolveCalendarEventRecords(remote.calendarEvents);
  const mergedEvents = mergeCalendarEvents(currentOverlay.importedEvents, remoteCalendarEvents, hasRemoteEvents);
  const featurePermissions = isPlainObject(remote.featurePermissions) ? remote.featurePermissions : {};
  const currentUser = isPlainObject(remote.currentUser) ? remote.currentUser : {};
  const nextCalendarOverlay = normalizeCalendarOverlay({
    calendars: remote.calendars === undefined
      ? currentOverlay.calendars
      : remoteCalendars,
    importedEvents: mergedEvents,
    source: {
      ...(isPlainObject(currentOverlay.source) ? currentOverlay.source : {}),
      accountEmail: readFirstText(currentUser, [['email']], sanitizeText(currentOverlay?.source?.accountEmail) || null),
      userId: readFirstText(currentUser, [['id'], ['userId']], sanitizeText(currentOverlay?.source?.userId) || null),
      calendarIds: remoteCalendars.length
        ? remoteCalendars.map((calendar) => sanitizeText(calendar?.id)).filter(Boolean)
        : Array.isArray(currentOverlay?.source?.calendarIds)
          ? currentOverlay.source.calendarIds
          : []
    },
    refreshedAt: nowIso(options.now),
    permissionStatus: resolveCalendarPermissionStatus(featurePermissions, currentOverlay)
  });
  const nextInbox = remote.inbox === undefined
    ? cloneValue(currentAppData.inbox || DEFAULT_INBOX_STATE)
    : normalizeInboxState(remote.inbox, currentAppData.inbox || DEFAULT_INBOX_STATE);
  const savedViewIds = new Set(nextViews.map((view) => sanitizeText(view?.id)).filter(Boolean));
  const nextActiveViewId = savedViewIds.has(activeViewId)
    ? activeViewId
    : sanitizeText(currentAppData.shell?.activeViewId, nextViews[0]?.id || '');

  return {
    ...currentAppData,
    tasks: nextTasks,
    projects: nextProjects,
    calendarOverlay: nextCalendarOverlay,
    inbox: nextInbox,
    shell: {
      ...(isPlainObject(currentAppData.shell) ? currentAppData.shell : {}),
      ...(nextViews.length ? { savedViews: nextViews } : {}),
      ...(nextActiveViewId ? { activeViewId: nextActiveViewId } : {}),
      ...(activeTabId ? { activeTabId } : {})
    }
  };
}
