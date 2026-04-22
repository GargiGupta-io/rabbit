import { createMockEntitlementTransport, normalizeAuthorityRefreshResponse } from './entitlementClient.js';

export const ENTITLEMENT_STORAGE_KEY = 'motion_clone_phase2_entitlement_snapshot';
export const ENTITLEMENT_REFRESH_STALE_MS = 12 * 60 * 60 * 1000;

const MIN_TOKEN_PREFIX = 'rabbit-signature';
const PLAN_LEVELS = ['free', 'pro', 'team'];
const AUTHORITY_STATES = new Set(['cached', 'fresh', 'stale', 'offline', 'revoked']);

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseDate(value) {
  if (!isNonEmptyText(value)) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }
  return parsed;
}

function nowIso(now = Date.now()) {
  return new Date(now).toISOString();
}

function normalizeBool(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeFeatureFlags(flags = {}) {
  return {
    ai_suggest: normalizeBool(flags.ai_suggest, false),
    calendar_read: normalizeBool(flags.calendar_read, false),
    calendar_write: normalizeBool(flags.calendar_write, false),
    advanced_recurrence: normalizeBool(flags.advanced_recurrence, false),
    tasks_manage: normalizeBool(flags.tasks_manage, true)
  };
}

function uniqueEntitlements(values = []) {
  const seen = new Set();
  return values
    .filter((value) => isNonEmptyText(value))
    .map((value) => value.trim())
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
}

function buildBaseline(now = Date.now()) {
  const baselineExpiresAt = new Date(now + 14 * 24 * 60 * 60 * 1000);
  const checkedAt = nowIso(now);
  return {
    userId: 'local-dev',
    plan: 'free',
    featureFlags: {
      ai_suggest: false,
      calendar_read: true,
      calendar_write: false,
      advanced_recurrence: false,
      tasks_manage: true
    },
    entitlements: ['tasks.basic', 'projects.basic', 'search.basic'],
    source: 'local-default',
    token: `${MIN_TOKEN_PREFIX}:${now.toString(36)}`,
    issuedAt: checkedAt,
    expiresAt: baselineExpiresAt.toISOString(),
    authority: {
      status: 'cached',
      source: 'local-default',
      checkedAt,
      lastAttemptAt: null,
      lastSuccessfulAt: null,
      staleAfterMs: ENTITLEMENT_REFRESH_STALE_MS,
      reason: 'Using the local entitlement baseline until authority refresh runs.',
      revokedAt: null
    }
  };
}

function readStoredEntitlementSnapshot() {
  if (!isPlainObject(globalThis)) {
    return null;
  }
  const storage = globalThis.localStorage;
  if (!storage || typeof storage.getItem !== 'function') {
    return null;
  }

  const raw = storage.getItem(ENTITLEMENT_STORAGE_KEY);
  if (!isNonEmptyText(raw)) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredEntitlementSnapshot(value) {
  if (!isPlainObject(globalThis)) {
    return;
  }
  const storage = globalThis.localStorage;
  if (!storage || typeof storage.setItem !== 'function') {
    return;
  }

  try {
    storage.setItem(ENTITLEMENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    return;
  }
}

function checkPlan(plan) {
  if (!isNonEmptyText(plan)) {
    return false;
  }
  return PLAN_LEVELS.includes(plan.trim().toLowerCase());
}

function normalizeAuthorityState(rawAuthority = {}, options = {}) {
  const now = Number.isFinite(options.now) ? Number(options.now) : Date.now();
  const fallback = isPlainObject(options.fallback) ? options.fallback : buildBaseline(now).authority;
  const authority = isPlainObject(rawAuthority) ? rawAuthority : {};
  const source = isNonEmptyText(authority.source)
    ? authority.source.trim()
    : isNonEmptyText(options.source)
      ? options.source.trim()
      : fallback.source;
  const checkedAt = (parseDate(authority.checkedAt) || parseDate(fallback.checkedAt) || new Date(now)).toISOString();
  const lastAttemptAt = parseDate(authority.lastAttemptAt)?.toISOString() || null;
  const lastSuccessfulAt = parseDate(authority.lastSuccessfulAt)?.toISOString() || null;
  const staleAfterMs = Number.isFinite(authority.staleAfterMs)
    ? Math.max(60 * 1000, Number(authority.staleAfterMs))
    : ENTITLEMENT_REFRESH_STALE_MS;
  const revokedAt = parseDate(authority.revokedAt)?.toISOString() || null;
  const requestedStatus = isNonEmptyText(authority.status) ? authority.status.trim().toLowerCase() : null;

  let status = AUTHORITY_STATES.has(requestedStatus)
    ? requestedStatus
    : lastSuccessfulAt
      ? 'fresh'
      : 'cached';

  if (revokedAt) {
    status = 'revoked';
  }

  if (status !== 'revoked' && lastSuccessfulAt) {
    const ageMs = now - new Date(lastSuccessfulAt).valueOf();
    if (ageMs > staleAfterMs && status !== 'offline') {
      status = 'stale';
    }
  }

  let reason = isNonEmptyText(authority.reason) ? authority.reason.trim() : null;
  if (!reason) {
    if (status === 'fresh') {
      reason = 'Entitlement was confirmed by the authority recently.';
    } else if (status === 'stale') {
      reason = 'Entitlement refresh is older than the freshness window.';
    } else if (status === 'offline') {
      reason = 'Authority refresh is offline, so the app is using the last safe snapshot.';
    } else if (status === 'revoked') {
      reason = 'Access was revoked by the authority.';
    } else {
      reason = 'Using cached entitlement data until the first authority refresh runs.';
    }
  }

  return {
    status,
    source,
    checkedAt,
    lastAttemptAt,
    lastSuccessfulAt,
    staleAfterMs,
    reason,
    revokedAt
  };
}

export function validateEntitlementPayload(raw = {}, now = Date.now()) {
  const baseline = buildBaseline(now);
  const payload = isPlainObject(raw) ? raw : {};
  const hasPayloadData = payload && typeof payload === 'object' && Object.keys(payload).length > 0;

  const errors = [];
  if (!hasPayloadData) {
    const normalized = {
      ...baseline
    };
    return {
      ok: true,
      isExpired: false,
      errors: [],
      reason: null,
      normalized,
      source: baseline.source
    };
  }

  const userId = isNonEmptyText(payload.userId) ? payload.userId.trim() : '';
  if (!userId) {
    errors.push('userId is required');
  }

  const plan = isNonEmptyText(payload.plan) ? payload.plan.trim().toLowerCase() : '';
  if (!checkPlan(plan)) {
    errors.push('plan is invalid');
  }

  const token = isNonEmptyText(payload.token) ? payload.token.trim() : '';
  if (!token.startsWith(MIN_TOKEN_PREFIX)) {
    errors.push('token signature looks invalid');
  }

  const issuedAtValue = isNonEmptyText(payload.issuedAt) ? parseDate(payload.issuedAt) : null;
  if (!issuedAtValue) {
    errors.push('issuedAt is required');
  }

  const expiresAtValue = isNonEmptyText(payload.expiresAt) ? parseDate(payload.expiresAt) : null;
  if (!expiresAtValue) {
    errors.push('expiresAt is required');
  }

  const nowDate = new Date(now);
  const isExpired = Boolean(expiresAtValue && expiresAtValue.valueOf() <= nowDate.valueOf());
  if (isExpired) {
    errors.push('entitlement expired');
  }

  const featureFlags = normalizeFeatureFlags(payload.featureFlags);
  const entitlements = uniqueEntitlements(Array.isArray(payload.entitlements) ? payload.entitlements : baseline.entitlements);

  const normalized = {
    userId: userId || baseline.userId,
    plan: plan || baseline.plan,
    featureFlags,
    entitlements: entitlements.length > 0 ? entitlements : baseline.entitlements,
    source: isNonEmptyText(payload.source) ? payload.source.trim() : baseline.source,
    token: token || baseline.token,
    issuedAt: (issuedAtValue || parseDate(payload.issuedAt) || nowDate).toISOString(),
    expiresAt: (expiresAtValue || new Date(now + 14 * 24 * 60 * 60 * 1000)).toISOString()
  };

  return {
    ok: errors.length === 0,
    isExpired,
    errors,
    reason: errors.length ? errors.join('; ') : null,
    normalized,
    source: payload.source || baseline.source
  };
}

function applyRevocationGuardrails(snapshot = {}, authority = {}) {
  if (authority.status !== 'revoked') {
    return snapshot;
  }

  return {
    ...snapshot,
    featureFlags: normalizeFeatureFlags({
      ...snapshot.featureFlags,
      ai_suggest: false,
      calendar_read: false,
      calendar_write: false,
      advanced_recurrence: false,
      tasks_manage: false
    }),
    entitlements: [],
    revokedAt: authority.revokedAt || nowIso()
  };
}

function finalizeSnapshot(rawSnapshot = {}, options = {}) {
  const now = Number.isFinite(options.now) ? Number(options.now) : Date.now();
  const baseline = buildBaseline(now);
  const validation = validateEntitlementPayload(rawSnapshot, now);
  const authority = normalizeAuthorityState(rawSnapshot.authority, {
    now,
    source: validation.normalized.source || baseline.source,
    fallback: baseline.authority
  });

  let snapshot = {
    ...baseline,
    ...validation.normalized,
    authority
  };

  snapshot = applyRevocationGuardrails(snapshot, authority);
  snapshot.validation = {
    ok: validation.ok && authority.status !== 'revoked',
    isExpired: validation.isExpired,
    reason: authority.status === 'revoked'
      ? authority.reason || 'entitlement revoked'
      : validation.reason,
    checkedAt: authority.checkedAt
  };

  if (options.allowPersistence !== false) {
    writeStoredEntitlementSnapshot(snapshot);
  }

  return snapshot;
}

function getSnapshotForFeatureCheck(now = Date.now(), providedSnapshot = null) {
  return providedSnapshot && isPlainObject(providedSnapshot)
    ? finalizeSnapshot(providedSnapshot, { now, allowPersistence: false })
    : getEntitlementSnapshot({ now, allowPersistence: false });
}

function isSnapshotValid(snapshot) {
  return Boolean(snapshot.validation?.ok) && !snapshot.validation?.isExpired && snapshot.authority?.status !== 'revoked';
}

function isFeatureAllowedFromSnapshot(snapshot, feature) {
  if (!isSnapshotValid(snapshot)) {
    return false;
  }
  return Boolean(snapshot.featureFlags?.[feature]);
}

export function getEntitlementSnapshot(options = {}) {
  const now = Number.isFinite(options.now) ? Number(options.now) : Date.now();
  const rawSnapshot = isPlainObject(options.rawSnapshot)
    ? options.rawSnapshot
    : readStoredEntitlementSnapshot() || {};

  return finalizeSnapshot(rawSnapshot, {
    now,
    allowPersistence: options.allowPersistence !== false
  });
}

export function getEntitlementStateSummary(input = {}) {
  const now = Number.isFinite(input.now) ? Number(input.now) : Date.now();
  const snapshot = input && input.validation
    ? finalizeSnapshot(input, { now, allowPersistence: false })
    : getEntitlementSnapshot({
        ...input,
        now,
        allowPersistence: false
      });
  const authority = snapshot.authority || buildBaseline(now).authority;

  return {
    plan: snapshot.plan,
    userId: snapshot.userId,
    source: authority.source,
    authorityStatus: authority.status,
    reason: authority.reason || snapshot.validation?.reason || null,
    checkedAt: authority.checkedAt || snapshot.validation?.checkedAt || null,
    lastAttemptAt: authority.lastAttemptAt,
    lastSuccessfulAt: authority.lastSuccessfulAt,
    staleAfterMs: authority.staleAfterMs,
    canMutate: isFeatureAllowedFromSnapshot(snapshot, 'tasks_manage'),
    aiEnabled: isFeatureAllowedFromSnapshot(snapshot, 'ai_suggest'),
    calendarReadEnabled: isFeatureAllowedFromSnapshot(snapshot, 'calendar_read'),
    isFresh: authority.status === 'fresh',
    isCached: authority.status === 'cached',
    isStale: authority.status === 'stale',
    isOffline: authority.status === 'offline',
    isRevoked: authority.status === 'revoked',
    validationOk: Boolean(snapshot.validation?.ok),
    isExpired: Boolean(snapshot.validation?.isExpired)
  };
}

export async function refreshEntitlementSnapshot(options = {}) {
  const now = Number.isFinite(options.now) ? Number(options.now) : Date.now();
  const allowPersistence = options.allowPersistence !== false;
  const transport = typeof options.transport === 'function'
    ? options.transport
    : createMockEntitlementTransport({ source: options.source });
  const scenario = isNonEmptyText(options.scenario) ? options.scenario.trim().toLowerCase() : 'active';
  const previousSnapshot = getEntitlementSnapshot({ now, allowPersistence: false });

  try {
    const authorityResponse = await transport({
      scenario,
      now,
      previousSnapshot,
      signal: options.signal
    });
    const normalized = normalizeAuthorityRefreshResponse(authorityResponse, { now });

    if (!normalized.ok) {
      return finalizeSnapshot(
        {
          ...previousSnapshot,
          authority: {
            ...previousSnapshot.authority,
            status: previousSnapshot.authority?.lastSuccessfulAt ? 'stale' : 'cached',
            source: normalized.source,
            checkedAt: normalized.checkedAt,
            lastAttemptAt: normalized.lastAttemptAt,
            lastSuccessfulAt: previousSnapshot.authority?.lastSuccessfulAt || null,
            staleAfterMs: previousSnapshot.authority?.staleAfterMs || ENTITLEMENT_REFRESH_STALE_MS,
            reason: normalized.reason,
            revokedAt: null
          }
        },
        { now, allowPersistence }
      );
    }

    if (normalized.status === 'revoked') {
      return finalizeSnapshot(
        {
          ...previousSnapshot,
          authority: {
            ...previousSnapshot.authority,
            status: 'revoked',
            source: normalized.source,
            checkedAt: normalized.checkedAt,
            lastAttemptAt: normalized.lastAttemptAt,
            lastSuccessfulAt: previousSnapshot.authority?.lastSuccessfulAt || null,
            staleAfterMs: previousSnapshot.authority?.staleAfterMs || ENTITLEMENT_REFRESH_STALE_MS,
            reason: normalized.reason,
            revokedAt: normalized.revokedAt
          }
        },
        { now, allowPersistence }
      );
    }

    return finalizeSnapshot(
      {
        ...previousSnapshot,
        ...normalized.payload,
        source: normalized.source,
        authority: {
          ...previousSnapshot.authority,
          status: 'fresh',
          source: normalized.source,
          checkedAt: normalized.checkedAt,
          lastAttemptAt: normalized.lastAttemptAt,
          lastSuccessfulAt: normalized.lastSuccessfulAt,
          staleAfterMs: previousSnapshot.authority?.staleAfterMs || ENTITLEMENT_REFRESH_STALE_MS,
          reason: 'Entitlement was refreshed from the authority successfully.',
          revokedAt: null
        }
      },
      { now, allowPersistence }
    );
  } catch (error) {
    const message = error instanceof Error && isNonEmptyText(error.message)
      ? error.message
      : 'Authority refresh failed.';
    const source = isNonEmptyText(error?.source) ? error.source.trim() : 'authority';

    return finalizeSnapshot(
      {
        ...previousSnapshot,
        authority: {
          ...previousSnapshot.authority,
          status: 'offline',
          source,
          checkedAt: nowIso(now),
          lastAttemptAt: nowIso(now),
          lastSuccessfulAt: previousSnapshot.authority?.lastSuccessfulAt || null,
          staleAfterMs: previousSnapshot.authority?.staleAfterMs || ENTITLEMENT_REFRESH_STALE_MS,
          reason: message,
          revokedAt: null
        }
      },
      { now, allowPersistence }
    );
  }
}

export function resolveFeatureGate(feature, now = Date.now()) {
  const snapshot = getSnapshotForFeatureCheck(now);
  return isFeatureAllowedFromSnapshot(snapshot, feature);
}

export function canAccessRoute(route, now = Date.now()) {
  const map = {
    '/ai': 'ai_suggest',
    '/calendar': 'calendar_read',
    '/recurrence': 'advanced_recurrence'
  };

  const feature = map[route];
  if (!feature) {
    return true;
  }

  return resolveFeatureGate(feature, now);
}

export function requireEntitlement(feature, now = Date.now(), snapshot = null) {
  const resolvedSnapshot = getSnapshotForFeatureCheck(now, snapshot);
  const allowed = isFeatureAllowedFromSnapshot(resolvedSnapshot, feature);
  let reason = null;

  if (resolvedSnapshot.authority?.status === 'revoked') {
    reason = resolvedSnapshot.authority?.reason || 'entitlement revoked';
  } else if (!resolvedSnapshot.validation?.ok) {
    reason = resolvedSnapshot.validation?.reason || 'invalid entitlement snapshot';
  } else if (resolvedSnapshot.validation?.isExpired) {
    reason = 'entitlement expired';
  }

  return {
    allowed,
    reason,
    plan: resolvedSnapshot.plan,
    userId: resolvedSnapshot.userId,
    feature,
    refreshState: resolvedSnapshot.authority?.status || 'cached'
  };
}

export function canMutateTasks(now = Date.now()) {
  return requireEntitlement('tasks_manage', now).allowed;
}
