const ALLOWED_PERMISSION_STATUSES = new Set(['unknown', 'prompt', 'granted', 'denied', 'unavailable']);
const ALLOWED_EVENT_STATUSES = new Set(['busy', 'free', 'tentative']);

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function nowIso() {
  return new Date().toISOString();
}

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function normalizeDate(value, fallback = null) {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return fallback;
  }

  return parsed.toISOString();
}

function addDay(value) {
  const parsed = new Date(value);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString();
}

function normalizePermissionStatus(value) {
  const candidate = sanitizeText(value, 'unknown').toLowerCase();
  return ALLOWED_PERMISSION_STATUSES.has(candidate) ? candidate : 'unknown';
}

function normalizeEventStatus(value) {
  const candidate = sanitizeText(value, 'busy').toLowerCase();
  return ALLOWED_EVENT_STATUSES.has(candidate) ? candidate : 'busy';
}

function normalizeCalendarIds(values = []) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  return values
    .map((value) => sanitizeText(value))
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
}

export function createEmptyCalendarOverlay() {
  return {
    importedEvents: [],
    source: {
      provider: 'local-fixture',
      accountId: null,
      calendarIds: [],
      syncToken: null
    },
    refreshedAt: null,
    permissionStatus: 'unknown'
  };
}

export function normalizeCalendarEvent(raw = {}, options = {}) {
  if (!isPlainObject(raw)) {
    return null;
  }

  const startAt = normalizeDate(raw.startAt || raw.start || raw.startsAt);
  const allDay = Boolean(raw.allDay);
  const computedEndAt = normalizeDate(raw.endAt || raw.end || raw.endsAt) || (allDay && startAt ? addDay(startAt) : null);

  if (!startAt || !computedEndAt) {
    return null;
  }

  if (new Date(computedEndAt).valueOf() <= new Date(startAt).valueOf()) {
    return null;
  }

  const id = sanitizeText(raw.id || raw.externalId);
  if (!id) {
    return null;
  }

  return {
    id,
    externalId: sanitizeText(raw.externalId, id),
    title: sanitizeText(raw.title, allDay ? 'All day' : 'Busy block'),
    provider: sanitizeText(raw.provider, sanitizeText(options.provider, 'local-fixture')),
    calendarId: sanitizeText(raw.calendarId, sanitizeText(options.calendarId, 'primary')),
    status: normalizeEventStatus(raw.status),
    startAt,
    endAt: computedEndAt,
    allDay,
    location: sanitizeText(raw.location) || null,
    notes: sanitizeText(raw.notes) || null,
    lastModifiedAt: normalizeDate(raw.lastModifiedAt || raw.updatedAt, nowIso())
  };
}

export function normalizeCalendarOverlay(raw = {}, options = {}) {
  const overlay = isPlainObject(raw) ? raw : {};
  const source = isPlainObject(overlay.source) ? overlay.source : {};
  const provider = sanitizeText(source.provider || overlay.provider, sanitizeText(options.provider, 'local-fixture'));
  const calendarId = sanitizeText(source.calendarId || overlay.calendarId, 'primary');

  return {
    importedEvents: Array.isArray(overlay.importedEvents || overlay.events)
      ? (overlay.importedEvents || overlay.events)
          .map((event) => normalizeCalendarEvent(event, { provider, calendarId }))
          .filter(Boolean)
      : [],
    source: {
      provider,
      accountId: sanitizeText(source.accountId) || null,
      calendarIds: normalizeCalendarIds(source.calendarIds || (calendarId ? [calendarId] : [])),
      syncToken: sanitizeText(source.syncToken) || null
    },
    refreshedAt: normalizeDate(overlay.refreshedAt || overlay.lastRefreshedAt),
    permissionStatus: normalizePermissionStatus(overlay.permissionStatus || overlay.readPermissionStatus)
  };
}

export function buildCalendarBusyBlocks(events = []) {
  if (!Array.isArray(events)) {
    return [];
  }

  return events
    .map((event) => normalizeCalendarEvent(event))
    .filter(Boolean)
    .filter((event) => event.status !== 'free');
}
