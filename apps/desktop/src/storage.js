import { CURRENT_SCHEMA_VERSION, APP_DATA_DEFAULT, normalizePersistedPayload } from './contracts.js';
import { createQueryKey, resolveClientRequest } from './apiClient.js';
import {
  fetchBootstrap,
  getCurrentUser,
  getFeaturePermissions,
  getMySettings,
  getPageViewSettings
} from './bootstrapClient.js';
import { fetchUncachedCalendarList } from './calendarClient.js';
import {
  DEFAULT_CURRENT_USER_EMAIL,
  DEFAULT_CURRENT_USER_ID,
  DEFAULT_CURRENT_USER_NAME
} from './identityDefaults.js';
import { buildProjectDomainSeedData, getWorkspaceById } from './projectService.js';
import { createStableDeviceId, getCurrentSyncSessionId, normalizeSyncState } from './syncContract.js';
import { getViews } from './viewsClient.js';

const STORAGE_KEY = 'rabbit_phase1_app_data';
const LEGACY_STORAGE_KEYS = ['motion_clone_phase1_app_data'];
const DEVICE_ID_KEY = `${STORAGE_KEY}:device_id`;
const LEGACY_DEVICE_ID_KEYS = LEGACY_STORAGE_KEYS.map((key) => `${key}:device_id`);
const DEFAULT_APP_VERSION = '1.0.0';
const DEFAULT_SYNC_STATUS = 'local';
const DEFAULT_USER_ID = DEFAULT_CURRENT_USER_ID;
const DEFAULT_USER_NAME = DEFAULT_CURRENT_USER_NAME;
const DEFAULT_ACCOUNT_EMAIL = DEFAULT_CURRENT_USER_EMAIL;

function nowIso() {
  return new Date().toISOString();
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

function hasStorage() {
  return Boolean(typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function');
}

function readStoredValue(keyOrKeys) {
  if (!hasStorage()) {
    return null;
  }
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value != null) {
      return value;
    }
  }
  return null;
}

function writeStoredValue(key, value) {
  if (!hasStorage()) {
    return;
  }
  localStorage.setItem(key, value);
}

function removeStoredValue(keyOrKeys) {
  if (!hasStorage()) {
    return;
  }
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  keys.forEach((key) => localStorage.removeItem(key));
}

function ensureSafeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function hasShellState(payload = {}) {
  return Boolean(
    payload?.shell &&
      typeof payload.shell === 'object' &&
      !Array.isArray(payload.shell) &&
      Array.isArray(payload.shell.tabs) &&
      Array.isArray(payload.shell.savedViews) &&
      Array.isArray(payload.shell.sidebarSections)
  );
}

function hasQueryCacheState(payload = {}) {
  return Boolean(
    payload?.queryCache &&
      typeof payload.queryCache === 'object' &&
      !Array.isArray(payload.queryCache) &&
      Array.isArray(payload.queryCache.queries)
  );
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)])
    );
  }

  return value;
}

function detectTimezone() {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return ensureSafeText(resolved, 'UTC');
  } catch {
    return 'UTC';
  }
}

function serializeQueryKey(key = []) {
  return JSON.stringify(Array.isArray(key) ? key : []);
}

function normalizeQueryEntry(raw = {}, fallback = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const key = Array.isArray(source.key)
    ? cloneValue(source.key)
    : Array.isArray(fallback.key)
      ? cloneValue(fallback.key)
      : [];
  const updatedAt = normalizeDate(source.updatedAt) || normalizeDate(fallback.updatedAt) || nowIso();
  const staleTimeMs = Number.isFinite(source.staleTimeMs)
    ? Math.max(0, Number(source.staleTimeMs))
    : Number.isFinite(fallback.staleTimeMs)
      ? Math.max(0, Number(fallback.staleTimeMs))
      : null;
  const gcTimeMs = Number.isFinite(source.gcTimeMs)
    ? Math.max(0, Number(source.gcTimeMs))
    : Number.isFinite(fallback.gcTimeMs)
      ? Math.max(0, Number(fallback.gcTimeMs))
      : null;
  const dataUpdateCount = Number.isFinite(source.dataUpdateCount)
    ? Math.max(1, Math.floor(Number(source.dataUpdateCount)))
    : Number.isFinite(fallback.dataUpdateCount)
      ? Math.max(1, Math.floor(Number(fallback.dataUpdateCount)))
      : 1;

  return {
    scope: ensureSafeText(source.scope, ensureSafeText(fallback.scope, 'query')),
    key,
    status: ensureSafeText(source.status, ensureSafeText(fallback.status, 'success')),
    fetchStatus: ensureSafeText(source.fetchStatus, ensureSafeText(fallback.fetchStatus, 'idle')),
    updatedAt,
    staleTimeMs,
    gcTimeMs,
    dataUpdateCount,
    data: cloneValue(source.data ?? fallback.data ?? {})
  };
}

function createQueryEntry(definition, args, data, options = {}) {
  const request = resolveClientRequest(definition, args);
  const previous = options.previous || {};

  return normalizeQueryEntry(previous, {
    scope: options.scope,
    key: Array.isArray(request.key) ? request.key : [],
    status: 'success',
    fetchStatus: 'idle',
    updatedAt: options.updatedAt,
    staleTimeMs: Number.isFinite(request.queryOptions?.staleTime) ? request.queryOptions.staleTime : null,
    gcTimeMs: Number.isFinite(request.queryOptions?.gcTime) ? request.queryOptions.gcTime : null,
    dataUpdateCount: 1,
    data
  });
}

function createCustomQueryEntry(key, data, options = {}) {
  return normalizeQueryEntry(options.previous || {}, {
    scope: options.scope,
    key: Array.isArray(key) ? key : [],
    status: 'success',
    fetchStatus: 'idle',
    updatedAt: options.updatedAt,
    staleTimeMs: Number.isFinite(options.staleTimeMs) ? options.staleTimeMs : null,
    gcTimeMs: Number.isFinite(options.gcTimeMs) ? options.gcTimeMs : null,
    dataUpdateCount: 1,
    data
  });
}

function indexQueryEntries(queryCache = {}) {
  const index = new Map();
  const queries = Array.isArray(queryCache?.queries) ? queryCache.queries : [];
  queries.forEach((entry) => {
    const normalized = normalizeQueryEntry(entry);
    index.set(serializeQueryKey(normalized.key), normalized);
  });
  return index;
}

function collectProviderTypes(calendarOverlay = {}) {
  const calendars = Array.isArray(calendarOverlay?.calendars) ? calendarOverlay.calendars : [];
  const providerTypes = Array.from(
    new Set(
      calendars
        .map((calendar) => ensureSafeText(calendar.providerType).toUpperCase())
        .filter(Boolean)
    )
  );
  return providerTypes.length ? providerTypes : ['GOOGLE'];
}

function inferActiveWorkspaceId(projectDomain = {}, payload = {}) {
  const shell = payload?.shell || {};
  const tasks = Array.isArray(payload?.tasks) ? payload.tasks : [];
  const activeViewId = ensureSafeText(shell.activeViewId, '');
  const activeView = Array.isArray(shell.savedViews)
    ? shell.savedViews.find((view) => view?.id === activeViewId)
    : null;
  const workspaceIds = new Set(
    tasks
      .filter((task) => activeView?.definition?.itemType !== 'projects' || task.projectId)
      .map((task) => ensureSafeText(task.workspaceId))
      .filter(Boolean)
  );

  if (workspaceIds.size === 1) {
    return Array.from(workspaceIds)[0];
  }

  return ensureSafeText(
    activeView?.workspaceId,
    ensureSafeText(projectDomain.workspaces?.[0]?.id, 'ws_private_my_tasks')
  );
}

function buildViewsCacheData(shell = {}) {
  const savedViews = Array.isArray(shell.savedViews) ? shell.savedViews : [];
  return {
    ids: savedViews.map((view) => view.id).filter(Boolean),
    models: {
      views: Object.fromEntries(
        savedViews
          .filter((view) => ensureSafeText(view.id))
          .map((view) => [
            view.id,
            {
              ...cloneValue(view),
              title: ensureSafeText(view.name, ensureSafeText(view.title, view.id))
            }
          ])
      )
    }
  };
}

function buildWorkspaceCacheData(projectDomain = {}) {
  const workspaces = Array.isArray(projectDomain.workspaces) ? projectDomain.workspaces : [];
  return {
    ids: workspaces.map((workspace) => workspace.id).filter(Boolean),
    models: {
      workspaces: Object.fromEntries(
        workspaces
          .filter((workspace) => ensureSafeText(workspace.id))
          .map((workspace) => [workspace.id, cloneValue(workspace)])
      )
    }
  };
}

function buildCalendarListCacheData(calendarOverlay = {}) {
  const calendars = Array.isArray(calendarOverlay.calendars) ? calendarOverlay.calendars : [];
  return {
    calendarList: {
      ids: calendars.map((calendar) => calendar.id).filter(Boolean),
      models: {
        calendars: Object.fromEntries(
          calendars
            .filter((calendar) => ensureSafeText(calendar.id))
            .map((calendar) => [calendar.id, cloneValue(calendar)])
        )
      }
    },
    permissionStatus: ensureSafeText(calendarOverlay.permissionStatus, 'unknown'),
    refreshedAt: normalizeDate(calendarOverlay.refreshedAt)
  };
}

function buildSettingsCacheData(payload = {}, projectDomain = {}) {
  const shell = payload?.shell || {};
  const activeWorkspaceId = inferActiveWorkspaceId(projectDomain, payload);
  const activeWorkspace = getWorkspaceById(projectDomain.workspaces, activeWorkspaceId);
  const firstConferenceType = Array.isArray(payload?.calendarOverlay?.importedEvents)
    ? payload.calendarOverlay.importedEvents.find((event) => ensureSafeText(event.conferenceType))
    : null;
  const firstScheduledTask = Array.isArray(payload?.tasks)
    ? payload.tasks.find((task) => ensureSafeText(task.scheduleId))
    : null;

  return {
    autoSchedule: {
      defaultMode: 'auto',
      preserveFixedTimeTasks: true,
      defaultScheduleId: ensureSafeText(firstScheduledTask?.scheduleId, null)
    },
    conference: {
      defaultConferenceType: ensureSafeText(firstConferenceType?.conferenceType, 'meet')
    },
    taskDefaults: {
      defaultDurationMinutes: 30,
      defaultMinimumDuration: 15,
      defaultPriorityLevel: 'MEDIUM',
      defaultDeadlineType: 'SOFT',
      defaultWorkspaceId: activeWorkspaceId
    },
    calendarDisplay: {
      selectedView: '3-day',
      showTasksInCalendar: true,
      showProjectedEntities: true
    },
    sidebarDisplay: {
      density: ensureSafeText(shell.theme?.density, 'comfortable'),
      accent: ensureSafeText(shell.theme?.accent, 'rabbit')
    },
    notetaker: {
      enableBotForAllMeetings: false,
      sendRecapToAllAttendees: false
    },
    timezones: {
      defaultTimezone: detectTimezone(),
      latestClientTimezoneDetected: detectTimezone()
    },
    onboarding: {
      isOnboardingComplete: true,
      dismissedCtas: ['DISMISSED_DESKTOP_APP_DOWNLOAD_PROMPT', 'NOTETAKER_ONBOARDING_ALERT']
    },
    workspaces: {
      defaultWorkspaceId: activeWorkspaceId,
      focusedWorkspaceId: activeWorkspaceId,
      focusedWorkspaceName: ensureSafeText(activeWorkspace?.name, 'My Tasks (Private)')
    }
  };
}

function buildPageViewSettingsData(payload = {}, projectDomain = {}) {
  const shell = payload?.shell || {};
  const activeWorkspaceId = inferActiveWorkspaceId(projectDomain, payload);
  return {
    activeTabId: ensureSafeText(shell.activeTabId, 'tab_calendar'),
    activeViewId: ensureSafeText(shell.activeViewId, 'view_my_tasks'),
    activeWorkspaceId,
    themeMode: ensureSafeText(shell.theme?.mode, 'dark'),
    density: ensureSafeText(shell.theme?.density, 'comfortable'),
    leftSidebarExpanded: true,
    rightRailExpanded: true
  };
}

function buildCurrentUserCacheData(payload = {}, settings = {}, pageViewSettings = {}) {
  const accountEmail = ensureSafeText(
    payload?.calendarOverlay?.source?.accountEmail,
    ensureSafeText(payload?.calendarOverlay?.importedEvents?.[0]?.email, DEFAULT_ACCOUNT_EMAIL)
  );
  const userId = ensureSafeText(payload?.calendarOverlay?.source?.userId, DEFAULT_USER_ID);

  return {
    id: userId,
    email: accountEmail,
    fullName: DEFAULT_USER_NAME,
    onboardingComplete: Boolean(settings.onboarding?.isOnboardingComplete),
    activeWorkspaceId: ensureSafeText(pageViewSettings.activeWorkspaceId, null),
    themeMode: ensureSafeText(pageViewSettings.themeMode, 'dark')
  };
}

function buildFeaturePermissionsData(payload = {}, settings = {}) {
  const permissionStatus = ensureSafeText(payload?.calendarOverlay?.permissionStatus, 'unknown');
  const calendarEnabled = permissionStatus === 'granted';
  return {
    tasksManage: true,
    calendarRead: calendarEnabled,
    calendarWrite: calendarEnabled,
    advancedRecurrence: true,
    aiChat: true,
    bookingLinks: true,
    notetaker: true,
    featurePermissionTier: calendarEnabled ? 'pro' : 'free',
    defaultWorkspaceId: ensureSafeText(settings.workspaces?.defaultWorkspaceId, null)
  };
}

function buildBootstrapCacheData(payload = {}, settings = {}, pageViewSettings = {}, currentUser = {}) {
  const syncStatus = normalizeSyncState(payload, { deviceId: payload?.deviceId });
  const savedViews = Array.isArray(payload?.shell?.savedViews) ? payload.shell.savedViews : [];
  return {
    userId: ensureSafeText(currentUser.id, DEFAULT_USER_ID),
    activeViewId: ensureSafeText(pageViewSettings.activeViewId, 'view_my_tasks'),
    activeTabId: ensureSafeText(pageViewSettings.activeTabId, 'tab_calendar'),
    activeWorkspaceId: ensureSafeText(pageViewSettings.activeWorkspaceId, settings.workspaces?.defaultWorkspaceId),
    onboardingComplete: Boolean(settings.onboarding?.isOnboardingComplete),
    pendingSyncCount: Array.isArray(syncStatus.outbox) ? syncStatus.outbox.length : 0,
    savedViewIds: savedViews.map((view) => view.id).filter(Boolean),
    calendarPermissionStatus: ensureSafeText(payload?.calendarOverlay?.permissionStatus, 'unknown')
  };
}

export function normalizeQueryCacheState(raw = {}, payload = {}) {
  const now = nowIso();
  const projectDomain = buildProjectDomainSeedData({
    workspaces: payload?.workspaces,
    projectDefinitions: payload?.projectDefinitions,
    projects: payload?.projects
  });
  const previousEntries = indexQueryEntries(raw);
  const settingsData = buildSettingsCacheData(payload, projectDomain);
  const pageViewSettingsData = buildPageViewSettingsData(payload, projectDomain);
  const currentUserData = buildCurrentUserCacheData(payload, settingsData, pageViewSettingsData);
  const featurePermissionsData = buildFeaturePermissionsData(payload, settingsData);
  const bootstrapData = buildBootstrapCacheData(payload, settingsData, pageViewSettingsData, currentUserData);
  const providerTypes = collectProviderTypes(payload?.calendarOverlay);
  const calendarArgs = providerTypes.length ? { providerTypes } : {};
  const queryEntries = [
    createQueryEntry(fetchBootstrap, {
      workspaceId: pageViewSettingsData.activeWorkspaceId,
      viewId: pageViewSettingsData.activeViewId
    }, bootstrapData, {
      scope: 'bootstrap',
      previous: previousEntries.get(serializeQueryKey(resolveClientRequest(fetchBootstrap, {
        workspaceId: pageViewSettingsData.activeWorkspaceId,
        viewId: pageViewSettingsData.activeViewId
      }).key)),
      updatedAt: now
    }),
    createQueryEntry(getCurrentUser, {}, currentUserData, {
      scope: 'currentUser',
      previous: previousEntries.get(serializeQueryKey(resolveClientRequest(getCurrentUser, {}).key)),
      updatedAt: now
    }),
    createQueryEntry(getMySettings, {}, settingsData, {
      scope: 'settings',
      previous: previousEntries.get(serializeQueryKey(resolveClientRequest(getMySettings, {}).key)),
      updatedAt: now
    }),
    createQueryEntry(getPageViewSettings, {}, pageViewSettingsData, {
      scope: 'pageViewSettings',
      previous: previousEntries.get(serializeQueryKey(resolveClientRequest(getPageViewSettings, {}).key)),
      updatedAt: now
    }),
    createQueryEntry(getFeaturePermissions, {}, featurePermissionsData, {
      scope: 'featurePermissions',
      previous: previousEntries.get(serializeQueryKey(resolveClientRequest(getFeaturePermissions, {}).key)),
      updatedAt: now
    }),
    createQueryEntry(getViews, {}, buildViewsCacheData(payload?.shell || {}), {
      scope: 'views',
      previous: previousEntries.get(serializeQueryKey(resolveClientRequest(getViews, {}).key)),
      updatedAt: now
    }),
    createQueryEntry(fetchUncachedCalendarList, calendarArgs, buildCalendarListCacheData(payload?.calendarOverlay || {}), {
      scope: 'uncachedCalendarList',
      previous: previousEntries.get(serializeQueryKey(resolveClientRequest(fetchUncachedCalendarList, calendarArgs).key)),
      updatedAt: now
    }),
    createCustomQueryEntry(
      createQueryKey('v2', 'workspaces', {
        includeArchived: false,
        activeWorkspaceId: pageViewSettingsData.activeWorkspaceId
      }),
      buildWorkspaceCacheData(projectDomain),
      {
        scope: 'workspaces',
        previous: previousEntries.get(serializeQueryKey(createQueryKey('v2', 'workspaces', {
          includeArchived: false,
          activeWorkspaceId: pageViewSettingsData.activeWorkspaceId
        }))),
        updatedAt: now,
        staleTimeMs: 60 * 60 * 1000
      }
    )
  ];

  return {
    persistence: ensureSafeText(raw?.persistence, 'indexeddb-like'),
    hydratedAt: normalizeDate(raw?.hydratedAt) || now,
    queries: queryEntries
  };
}

function detectPlatform() {
  if (typeof navigator !== 'undefined' && navigator?.platform) {
    return ensureSafeText(navigator.platform, 'unknown');
  }

  if (typeof process !== 'undefined' && process?.env?.NODE_PLATFORM) {
    return ensureSafeText(process.env.NODE_PLATFORM, 'unknown');
  }

  if (typeof process !== 'undefined' && process?.platform) {
    return ensureSafeText(process.platform, 'unknown');
  }

  return 'unknown';
}

function getOrCreateDeviceId(preferred = '') {
  const existing = ensureSafeText(readStoredValue([DEVICE_ID_KEY, ...LEGACY_DEVICE_ID_KEYS]), '');
  if (existing) {
    writeStoredValue(DEVICE_ID_KEY, existing);
    return existing;
  }

  const seeded = ensureSafeText(preferred, '');
  if (seeded) {
    writeStoredValue(DEVICE_ID_KEY, seeded);
    return seeded;
  }

  const next = createStableDeviceId();
  writeStoredValue(DEVICE_ID_KEY, next);
  return next;
}

function normalizeStorageMetadata(payload, now, { incomingSchemaVersion, syncStatus, deviceId, source }) {
  return {
    app: 'rabbit',
    appVersion: ensureSafeText(payload.version, DEFAULT_APP_VERSION),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    observedSchemaVersion: Number.isInteger(incomingSchemaVersion) ? incomingSchemaVersion : CURRENT_SCHEMA_VERSION,
    platform: detectPlatform(),
    deviceId,
    syncState: ensureSafeText(syncStatus, DEFAULT_SYNC_STATUS),
    shellState: hasShellState(payload) ? 'present' : 'missing',
    queryCacheState: hasQueryCacheState(payload) ? 'present' : 'missing',
    backendConfigured: Boolean(payload?.backend?.baseUrl),
    backendState: ensureSafeText(payload?.backend?.status, 'unconfigured'),
    inboxItemCount: Array.isArray(payload?.inbox?.items) ? payload.inbox.items.length : 0,
    cachedQueryCount: Array.isArray(payload?.queryCache?.queries) ? payload.queryCache.queries.length : 0,
    source: ensureSafeText(source || payload.source, 'desktop'),
    revision: ensureSafeText(payload.revision, `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`),
    lastLoadedAt: now,
    lastSavedAt: ensureSafeText(payload.lastSavedAt, null),
    migration: payload.migration || null
  };
}

function attachSyncState(payload, raw = {}, options = {}) {
  const deviceId = getOrCreateDeviceId(raw?.deviceId || raw?.metadata?.deviceId || options.deviceId);
  const sync = normalizeSyncState(raw, {
    deviceId,
    sessionId: getCurrentSyncSessionId()
  });

  return {
    ...payload,
    outbox: sync.outbox,
    lastSyncAt: sync.lastSyncAt,
    syncCursor: sync.syncCursor,
    deviceId: sync.deviceId,
    syncStatus: sync.syncStatus
  };
}

function fallbackPayload() {
  const now = nowIso();
  const normalized = attachSyncState(normalizePersistedPayload(APP_DATA_DEFAULT), {}, {});
  normalized.queryCache = normalizeQueryCacheState({}, normalized);
  normalized.lastLoadedAt = now;
  normalized.metadata = normalizeStorageMetadata(normalized, now, {
    incomingSchemaVersion: normalized.schemaVersion,
    syncStatus: normalized.syncStatus,
    deviceId: normalized.deviceId,
    source: 'desktop'
  });
  return normalized;
}

function withUpgradeGuard(raw) {
  const incomingSchemaVersion = Number(raw?.schemaVersion);
  const isIncomingFuture = Number.isInteger(incomingSchemaVersion) && incomingSchemaVersion > CURRENT_SCHEMA_VERSION;

  const normalizedInput = isIncomingFuture
    ? {
        ...raw,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      }
    : raw;

  const normalized = attachSyncState(normalizePersistedPayload(normalizedInput), raw, {});
  normalized.queryCache = normalizeQueryCacheState(raw?.queryCache, {
    ...normalized,
    workspaces: raw?.workspaces,
    projectDefinitions: raw?.projectDefinitions
  });
  if (isIncomingFuture) {
    normalized.migration.steps.push(`downgraded payload schema v${incomingSchemaVersion} -> v${CURRENT_SCHEMA_VERSION} (compatibility read)`);
    normalized.migration.fromVersion = incomingSchemaVersion;
    normalized.migration.toVersion = CURRENT_SCHEMA_VERSION;
    normalized.migration.hasMigration = true;
  }

  const now = nowIso();
  normalized.lastLoadedAt = now;
  normalized.metadata = {
    ...normalizeStorageMetadata(normalized, now, {
      incomingSchemaVersion,
      syncStatus: normalized.syncStatus,
      deviceId: normalized.deviceId,
      source: raw?.metadata?.source || 'desktop'
    }),
    version: `restore:${normalized.revision}`
  };

  return normalized;
}

export function loadStoredData() {
  const raw = readStoredValue([STORAGE_KEY, ...LEGACY_STORAGE_KEYS]);
  if (!raw) {
    return fallbackPayload();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return fallbackPayload();
    }

    const normalized = withUpgradeGuard(parsed);
  if (!Array.isArray(normalized.projects) || !Array.isArray(normalized.tasks) || !hasShellState(normalized)) {
      return fallbackPayload();
    }

    return normalized;
  } catch {
    return fallbackPayload();
  }
}

export function saveStoredData(data = {}) {
  if (!hasStorage()) {
    const normalized = attachSyncState(normalizePersistedPayload(data), data, {
      deviceId: data?.deviceId
    });
    normalized.queryCache = normalizeQueryCacheState(data?.queryCache, data);
    return normalized;
  }

  const normalized = attachSyncState(normalizePersistedPayload(data), data, {
    deviceId: data?.deviceId
  });
  normalized.queryCache = normalizeQueryCacheState(data?.queryCache, data);
  const now = nowIso();
  normalized.schemaVersion = CURRENT_SCHEMA_VERSION;
  normalized.updatedAt = now;
  normalized.lastSavedAt = now;
  normalized.revision = `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  normalized.lastLoadedAt = now;
  normalized.metadata = {
    ...normalizeStorageMetadata(normalized, now, {
      incomingSchemaVersion: normalized.schemaVersion,
      syncStatus: normalized.syncStatus,
      deviceId: normalized.deviceId,
      source: data?.metadata?.source || 'desktop'
    }),
    source: ensureSafeText(data?.metadata?.source, 'desktop')
  };
  writeStoredValue(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function resetStoredData() {
  removeStoredValue([STORAGE_KEY, ...LEGACY_STORAGE_KEYS]);
  removeStoredValue([DEVICE_ID_KEY, ...LEGACY_DEVICE_ID_KEYS]);
}
