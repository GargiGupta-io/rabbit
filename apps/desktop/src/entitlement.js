export const ENTITLEMENT_STORAGE_KEY = 'motion_clone_phase2_entitlement_snapshot';
const MIN_TOKEN_PREFIX = 'rabbit-signature';

const PLAN_LEVELS = ['free', 'pro', 'team'];

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
  const set = new Set();
  return values
    .filter((value) => isNonEmptyText(value))
    .map((value) => value.trim())
    .filter((value) => {
      if (set.has(value)) {
        return false;
      }
      set.add(value);
      return true;
    });
}

function nowIso(now = Date.now()) {
  return new Date(now).toISOString();
}

function buildBaseline(now = Date.now()) {
  const baselineExpiresAt = new Date(now + 14 * 24 * 60 * 60 * 1000);
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
    issuedAt: nowIso(now),
    expiresAt: baselineExpiresAt.toISOString()
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

function validateEntitlementPayload(raw = {}, now = Date.now()) {
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

export function getEntitlementSnapshot(options = {}) {
  const now = Number.isFinite(options.now) ? Number(options.now) : Date.now();
  const allowPersistence = options.allowPersistence !== false;

  const raw = readStoredEntitlementSnapshot() || {};
  const result = validateEntitlementPayload(raw, now);

  const snapshot = {
    ...buildBaseline(now),
    ...result.normalized
  };
  snapshot.validation = {
    ok: result.ok,
    isExpired: result.isExpired,
    reason: result.reason,
    checkedAt: nowIso(now)
  };

  if (allowPersistence) {
    writeStoredEntitlementSnapshot(snapshot);
  }

  return snapshot;
}

export function resolveFeatureGate(feature, now = Date.now()) {
  const snapshot = getEntitlementSnapshot({ now, allowPersistence: false });
  if (!snapshot.validation?.ok || snapshot.validation?.isExpired) {
    return false;
  }
  return Boolean(snapshot.featureFlags?.[feature]);
}

export function canAccessRoute(route, now = Date.now()) {
  const map = {
    '/ai': 'ai_suggest',
    '/calendar': 'calendar_read',
    '/recurrence': 'advanced_recurrence'
  };

  const feature = map[route];
  if (!feature) return true;
  return resolveFeatureGate(feature, now);
}

export function requireEntitlement(feature, now = Date.now()) {
  const snapshot = getEntitlementSnapshot({ now, allowPersistence: false });
  const allowed = resolveFeatureGate(feature, now);
  const reason = !snapshot.validation?.ok
    ? snapshot.validation?.reason || 'invalid entitlement snapshot'
    : snapshot.validation?.isExpired
      ? 'entitlement expired'
      : null;

  return {
    allowed,
    reason,
    plan: snapshot.plan,
    userId: snapshot.userId,
    feature
  };
}

export function canMutateTasks(now = Date.now()) {
  return requireEntitlement('tasks_manage', now).allowed;
}

export { validateEntitlementPayload };
