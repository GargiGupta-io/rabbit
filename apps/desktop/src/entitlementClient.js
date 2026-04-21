const AUTHORITY_SOURCE = 'mock-authority';

export const ENTITLEMENT_REFRESH_SCENARIOS = [
  { id: 'active', label: 'Confirm active' },
  { id: 'upgrade', label: 'Mock upgrade' },
  { id: 'revoked', label: 'Mock revoke' },
  { id: 'offline', label: 'Mock offline' }
];

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeBool(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeFeatureFlags(flags = {}) {
  return {
    ai_suggest: normalizeBool(flags.ai_suggest, false),
    calendar_read: normalizeBool(flags.calendar_read, true),
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

function nowIso(now = Date.now()) {
  return new Date(now).toISOString();
}

function buildAuthorityPayload(previousSnapshot = {}, now = Date.now(), overrides = {}) {
  const baselineEntitlements = Array.isArray(previousSnapshot.entitlements) && previousSnapshot.entitlements.length
    ? previousSnapshot.entitlements
    : ['tasks.basic', 'projects.basic', 'search.basic'];
  const issuedAt = isNonEmptyText(overrides.issuedAt) ? overrides.issuedAt.trim() : nowIso(now);
  const expiresAt = isNonEmptyText(overrides.expiresAt)
    ? overrides.expiresAt.trim()
    : new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString();

  return {
    userId: isNonEmptyText(overrides.userId)
      ? overrides.userId.trim()
      : isNonEmptyText(previousSnapshot.userId)
        ? previousSnapshot.userId.trim()
        : 'local-dev',
    plan: isNonEmptyText(overrides.plan)
      ? overrides.plan.trim().toLowerCase()
      : isNonEmptyText(previousSnapshot.plan)
        ? previousSnapshot.plan.trim().toLowerCase()
        : 'free',
    featureFlags: normalizeFeatureFlags(
      isPlainObject(overrides.featureFlags)
        ? overrides.featureFlags
        : isPlainObject(previousSnapshot.featureFlags)
          ? previousSnapshot.featureFlags
          : {}
    ),
    entitlements: uniqueEntitlements(
      Array.isArray(overrides.entitlements)
        ? overrides.entitlements
        : baselineEntitlements
    ),
    source: isNonEmptyText(overrides.source) ? overrides.source.trim() : AUTHORITY_SOURCE,
    token: isNonEmptyText(overrides.token)
      ? overrides.token.trim()
      : `rabbit-signature:authority:${now.toString(36)}`,
    issuedAt,
    expiresAt
  };
}

export function normalizeAuthorityRefreshResponse(raw = {}, options = {}) {
  const now = Number.isFinite(options.now) ? Number(options.now) : Date.now();
  const checkedAt = nowIso(now);
  const payload = isPlainObject(raw.payload)
    ? raw.payload
    : isPlainObject(raw.snapshot)
      ? raw.snapshot
      : isPlainObject(raw.entitlement)
        ? raw.entitlement
        : null;
  const status = isNonEmptyText(raw.status)
    ? raw.status.trim().toLowerCase()
    : payload
      ? 'active'
      : 'invalid';
  const source = isNonEmptyText(raw.source) ? raw.source.trim() : AUTHORITY_SOURCE;
  const reason = isNonEmptyText(raw.reason) ? raw.reason.trim() : null;

  if (status === 'revoked') {
    return {
      ok: true,
      status: 'revoked',
      source,
      reason: reason || 'Access revoked by authority.',
      payload,
      checkedAt,
      lastAttemptAt: checkedAt,
      lastSuccessfulAt: null,
      revokedAt: isNonEmptyText(raw.revokedAt) ? raw.revokedAt.trim() : checkedAt
    };
  }

  if (!payload) {
    return {
      ok: false,
      status: 'invalid',
      source,
      reason: reason || 'Authority response did not include an entitlement payload.',
      payload: null,
      checkedAt,
      lastAttemptAt: checkedAt,
      lastSuccessfulAt: null,
      revokedAt: null
    };
  }

  return {
    ok: true,
    status: 'fresh',
    source,
    reason: null,
    payload,
    checkedAt,
    lastAttemptAt: checkedAt,
    lastSuccessfulAt: checkedAt,
    revokedAt: null
  };
}

export function createMockEntitlementTransport(options = {}) {
  const source = isNonEmptyText(options.source) ? options.source.trim() : AUTHORITY_SOURCE;

  return async function mockTransport(request = {}) {
    const scenario = isNonEmptyText(request.scenario) ? request.scenario.trim().toLowerCase() : 'active';
    const now = Number.isFinite(request.now) ? Number(request.now) : Date.now();
    const previousSnapshot = isPlainObject(request.previousSnapshot) ? request.previousSnapshot : {};

    if (scenario === 'offline') {
      const error = new Error('Authority refresh unavailable while offline.');
      error.code = 'OFFLINE';
      error.source = source;
      throw error;
    }

    if (scenario === 'revoked') {
      return {
        status: 'revoked',
        source,
        reason: 'Subscription revoked by authority.',
        revokedAt: nowIso(now)
      };
    }

    if (scenario === 'upgrade') {
      return {
        status: 'active',
        source,
        payload: buildAuthorityPayload(previousSnapshot, now, {
          plan: 'pro',
          featureFlags: {
            ai_suggest: true,
            calendar_read: true,
            calendar_write: true,
            advanced_recurrence: true,
            tasks_manage: true
          },
          entitlements: [
            'tasks.basic',
            'projects.basic',
            'search.basic',
            'calendar.read',
            'calendar.write',
            'ai.suggest'
          ],
          token: `rabbit-signature:authority:pro:${now.toString(36)}`
        })
      };
    }

    return {
      status: 'active',
      source,
      payload: buildAuthorityPayload(previousSnapshot, now, {
        source
      })
    };
  };
}
