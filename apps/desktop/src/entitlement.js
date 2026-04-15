const LICENSE_STATE = {
  userId: 'local-dev',
  plan: 'free',
  featureFlags: {
    ai_suggest: false,
    calendar_read: true,
    calendar_write: false,
    advanced_recurrence: false
  },
  entitlements: ['tasks.basic', 'projects.basic', 'search.basic']
};

export function getEntitlementSnapshot() {
  return LICENSE_STATE;
}

export function resolveFeatureGate(feature) {
  return Boolean(LICENSE_STATE.featureFlags[feature]);
}

export function canAccessRoute(route) {
  const map = {
    '/ai': 'ai_suggest',
    '/calendar': 'calendar_read',
    '/recurrence': 'advanced_recurrence'
  };

  const flag = map[route];
  if (!flag) return true;
  return resolveFeatureGate(flag);
}

export function requireEntitlement(feature) {
  return {
    allowed: resolveFeatureGate(feature),
    plan: LICENSE_STATE.plan
  };
}
