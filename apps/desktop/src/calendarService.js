const ALLOWED_PERMISSION_STATUSES = new Set(['unknown', 'prompt', 'granted', 'denied', 'unavailable']);
const ALLOWED_EVENT_STATUSES = new Set(['busy', 'free', 'tentative']);
const ALLOWED_PROVIDER_TYPES = new Set(['GOOGLE', 'MICROSOFT', 'APPLE', 'LOCAL']);
const ALLOWED_CALENDAR_TYPES = new Set(['DEFAULT', 'FREQUENTLY_MET']);
const ALLOWED_ACCESS_ROLES = new Set(['EDITOR', 'OWNER', 'VIEWER']);
const ALLOWED_CALENDAR_STATUSES = new Set(['OK', 'NOT_FOUND', 'AUTH_ERROR', 'UNKNOWN_ERROR']);
const ALLOWED_CONFERENCE_TYPES = new Set([
  'none',
  'zoom',
  'hangoutsMeet',
  'meet',
  'teamsForBusiness',
  'phone',
  'customLocation',
  'eventHangout',
  'eventNamedHangout',
  'unknown',
  'skypeForBusiness',
  'skypeForConsumer'
]);
const ALLOWED_ATTENDEE_STATUSES = new Set(['needsAction', 'declined', 'tentative', 'accepted']);
const ALLOWED_EVENT_TYPES = new Set([
  'UNKNOWN',
  'BOOKING',
  'EXTERNAL_EVENT',
  'NORMAL',
  'RECURRING_EVENT',
  'TASK'
]);
const ALLOWED_VISIBILITY = new Set(['CONFIDENTIAL', 'DEFAULT', 'PUBLIC', 'PRIVATE']);

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

function normalizeNullableBoolean(value) {
  if (value === null || value === undefined) {
    return null;
  }
  return Boolean(value);
}

function normalizeNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePermissionStatus(value) {
  const candidate = sanitizeText(value, 'unknown').toLowerCase();
  return ALLOWED_PERMISSION_STATUSES.has(candidate) ? candidate : 'unknown';
}

function normalizeEventStatus(value) {
  const candidate = sanitizeText(value, 'busy').toLowerCase();
  return ALLOWED_EVENT_STATUSES.has(candidate) ? candidate : 'busy';
}

function normalizeProviderType(value, fallback = 'LOCAL') {
  const candidate = sanitizeText(value, fallback).toUpperCase().replace('-', '_');
  return ALLOWED_PROVIDER_TYPES.has(candidate) ? candidate : fallback;
}

function deriveProvider(value, providerType = 'LOCAL', fallback = 'local-fixture') {
  const candidate = sanitizeText(value).toLowerCase();
  if (candidate) {
    return candidate;
  }

  if (providerType === 'GOOGLE') {
    return 'google';
  }

  if (providerType === 'MICROSOFT') {
    return 'microsoft';
  }

  if (providerType === 'APPLE') {
    return 'apple';
  }

  return fallback;
}

function normalizeCalendarType(value) {
  const candidate = sanitizeText(value, 'DEFAULT').toUpperCase();
  return ALLOWED_CALENDAR_TYPES.has(candidate) ? candidate : 'DEFAULT';
}

function normalizeAccessRole(value) {
  const candidate = sanitizeText(value, 'VIEWER').toUpperCase();
  return ALLOWED_ACCESS_ROLES.has(candidate) ? candidate : 'VIEWER';
}

function normalizeCalendarStatus(value) {
  const candidate = sanitizeText(value, 'OK').toUpperCase();
  return ALLOWED_CALENDAR_STATUSES.has(candidate) ? candidate : 'OK';
}

function normalizeConferenceType(value) {
  const candidate = sanitizeText(value);
  if (!candidate) {
    return null;
  }

  return ALLOWED_CONFERENCE_TYPES.has(candidate) ? candidate : 'unknown';
}

function normalizeConferenceTypes(values = []) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  return values
    .map((value) => normalizeConferenceType(value))
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
}

function normalizeAttendeeStatus(value) {
  const candidate = sanitizeText(value);
  return ALLOWED_ATTENDEE_STATUSES.has(candidate) ? candidate : undefined;
}

function normalizeEventType(value) {
  const candidate = sanitizeText(value, 'UNKNOWN').toUpperCase();
  return ALLOWED_EVENT_TYPES.has(candidate) ? candidate : 'UNKNOWN';
}

function normalizeVisibility(value) {
  const candidate = sanitizeText(value, 'DEFAULT').toUpperCase();
  return ALLOWED_VISIBILITY.has(candidate) ? candidate : 'DEFAULT';
}

function normalizeCalendarIds(values = []) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  return values
    .map((value) => sanitizeText(typeof value === 'string' ? value : value?.id))
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
}

function normalizeCalendar(raw = {}, options = {}) {
  if (!isPlainObject(raw)) {
    return null;
  }

  const providerType = normalizeProviderType(
    raw.providerType || raw.provider || options.providerType,
    normalizeProviderType(options.providerType)
  );
  const provider = deriveProvider(raw.provider, providerType, sanitizeText(options.provider, 'local-fixture'));
  const id = sanitizeText(raw.id || raw.calendarUniqueId || raw.providerId);
  const title = sanitizeText(raw.title || raw.name);

  if (!id || !title) {
    return null;
  }

  const type = normalizeCalendarType(raw.type);
  const isFrequentlyMet = Boolean(raw.isInFrequentlyMet || type === 'FREQUENTLY_MET');
  const isInMyCalendars =
    raw.isInMyCalendars === undefined
      ? !isFrequentlyMet
      : Boolean(raw.isInMyCalendars);

  return {
    id,
    providerId: sanitizeText(raw.providerId || raw.externalId, id),
    userId: sanitizeText(raw.userId || options.userId) || null,
    emailAccountId: sanitizeText(raw.emailAccountId || raw.accountId || options.accountId) || null,
    type,
    accessRole: normalizeAccessRole(raw.accessRole || raw.role),
    allowedConferenceTypes: normalizeConferenceTypes(raw.allowedConferenceTypes || raw.conferenceTypes),
    colorId: sanitizeText(raw.colorId || raw.color, '#5b6cfa'),
    isEnabled: raw.isEnabled === undefined ? raw.disabled !== true : Boolean(raw.isEnabled),
    isInMyCalendars,
    isInFrequentlyMet: isFrequentlyMet,
    isPrimary: Boolean(raw.isPrimary),
    provider,
    providerType,
    title,
    status: normalizeCalendarStatus(raw.status)
  };
}

function normalizeOrganizer(raw = {}) {
  if (!isPlainObject(raw)) {
    return null;
  }

  const email = sanitizeText(raw.email);
  const displayName = sanitizeText(raw.displayName || raw.name);

  if (!email && !displayName) {
    return null;
  }

  return {
    displayName: displayName || undefined,
    email: email || undefined
  };
}

function normalizeAttendee(raw = {}) {
  if (!isPlainObject(raw)) {
    return null;
  }

  const email = sanitizeText(raw.email);
  if (!email) {
    return null;
  }

  const displayName = sanitizeText(raw.displayName || raw.name);

  return {
    displayName: displayName || undefined,
    email,
    isOptional: Boolean(raw.isOptional),
    isOrganizer: Boolean(raw.isOrganizer),
    status: normalizeAttendeeStatus(raw.status)
  };
}

function normalizeAttendees(values = []) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  return values
    .map((value) => normalizeAttendee(value))
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value.email)) {
        return false;
      }
      seen.add(value.email);
      return true;
    });
}

export function createEmptyCalendarOverlay() {
  return {
    calendars: [],
    importedEvents: [],
    source: {
      provider: 'local-fixture',
      providerType: 'LOCAL',
      accountId: null,
      accountEmail: null,
      userId: null,
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

  const providerType = normalizeProviderType(
    raw.providerType || options.providerType || raw.provider,
    normalizeProviderType(options.providerType)
  );
  const provider = deriveProvider(raw.provider, providerType, sanitizeText(options.provider, 'local-fixture'));
  const startAt = normalizeDate(raw.startAt || raw.start || raw.startsAt);
  const allDay = Boolean(raw.allDay || raw.isAllDay);
  const computedEndAt =
    normalizeDate(raw.endAt || raw.end || raw.endsAt) || (allDay && startAt ? addDay(startAt) : null);

  if (!startAt || !computedEndAt) {
    return null;
  }

  if (new Date(computedEndAt).valueOf() <= new Date(startAt).valueOf()) {
    return null;
  }

  const id = sanitizeText(raw.id || raw.providerId || raw.externalId);
  if (!id) {
    return null;
  }

  const status = normalizeEventStatus(raw.status);
  const calendarUniqueId = sanitizeText(raw.calendarUniqueId || raw.calendarId || options.calendarId);
  const updatedTime = normalizeDate(raw.lastModifiedAt || raw.updatedAt || raw.updatedTime, nowIso());

  return {
    id,
    providerId: sanitizeText(raw.providerId || raw.externalId, id),
    externalId: sanitizeText(raw.externalId, sanitizeText(raw.providerId, id)),
    title: sanitizeText(raw.title, allDay ? 'All day' : 'Busy block'),
    provider,
    providerType,
    email: sanitizeText(raw.email || raw.accountEmail || options.accountEmail) || null,
    calendarId: calendarUniqueId || sanitizeText(options.calendarId, 'primary'),
    calendarUniqueId: calendarUniqueId || sanitizeText(options.calendarId, 'primary'),
    status,
    availability: status === 'free' ? 'FREE' : 'BUSY',
    startAt,
    endAt: computedEndAt,
    start: startAt,
    end: computedEndAt,
    allDay,
    isAllDay: allDay,
    type: normalizeEventType(raw.type),
    visibility: normalizeVisibility(raw.visibility),
    attendees: normalizeAttendees(raw.attendees),
    areAttendeesHidden: normalizeNullableBoolean(raw.areAttendeesHidden),
    canAttendeesInvite: normalizeNullableBoolean(raw.canAttendeesInvite),
    canAttendeesModify: normalizeNullableBoolean(raw.canAttendeesModify),
    bookingLinkId: sanitizeText(raw.bookingLinkId) || null,
    colorId: sanitizeText(raw.colorId || raw.color) || null,
    conferenceLink: sanitizeText(raw.conferenceLink) || null,
    conferenceType: normalizeConferenceType(raw.conferenceType),
    createdTime: normalizeDate(raw.createdTime || raw.createdAt, startAt),
    iCalUid: sanitizeText(raw.iCalUid || raw.icalUid) || null,
    isCancelled: Boolean(raw.isCancelled),
    isDeleted: Boolean(raw.isDeleted),
    isPendingSync: Boolean(raw.isPendingSync),
    location: sanitizeText(raw.location) || null,
    notes: sanitizeText(raw.notes || raw.description) || null,
    organizer: normalizeOrganizer(raw.organizer),
    recurrence: sanitizeText(raw.recurrence) || null,
    recurringEventId: sanitizeText(raw.recurringEventId) || null,
    teamTaskId: sanitizeText(raw.teamTaskId || raw.taskId) || null,
    meetingTaskId: sanitizeText(raw.meetingTaskId) || null,
    travelTimeAfter: normalizeNumber(raw.travelTimeAfter),
    travelTimeBefore: normalizeNumber(raw.travelTimeBefore),
    url: sanitizeText(raw.url || raw.htmlLink) || null,
    lastModifiedAt: updatedTime,
    updatedTime
  };
}

export function normalizeCalendarOverlay(raw = {}, options = {}) {
  const overlay = isPlainObject(raw) ? raw : {};
  const source = isPlainObject(overlay.source) ? overlay.source : {};
  const providerType = normalizeProviderType(
    source.providerType || overlay.providerType || options.providerType || source.provider || overlay.provider,
    normalizeProviderType(options.providerType)
  );
  const provider = deriveProvider(
    source.provider || overlay.provider,
    providerType,
    sanitizeText(options.provider, 'local-fixture')
  );
  const accountId = sanitizeText(source.accountId || overlay.accountId || options.accountId) || null;
  const accountEmail =
    sanitizeText(source.accountEmail || source.email || overlay.accountEmail || overlay.email || options.accountEmail) || null;
  const userId = sanitizeText(source.userId || overlay.userId || options.userId) || null;
  const calendars = Array.isArray(overlay.calendars || overlay.calendarList)
    ? (overlay.calendars || overlay.calendarList)
        .map((calendar) =>
          normalizeCalendar(calendar, {
            provider,
            providerType,
            accountId,
            userId
          })
        )
        .filter(Boolean)
    : [];
  const defaultCalendarId =
    sanitizeText(source.calendarId || overlay.calendarId) ||
    calendars.find((calendar) => calendar.isPrimary)?.id ||
    calendars[0]?.id ||
    'primary';

  return {
    calendars,
    importedEvents: Array.isArray(overlay.importedEvents || overlay.events)
      ? (overlay.importedEvents || overlay.events)
          .map((event) =>
            normalizeCalendarEvent(event, {
              provider,
              providerType,
              calendarId: defaultCalendarId,
              accountEmail
            })
          )
          .filter(Boolean)
      : [],
    source: {
      provider,
      providerType,
      accountId,
      accountEmail,
      userId,
      calendarIds: normalizeCalendarIds(
        source.calendarIds || (calendars.length ? calendars.map((calendar) => calendar.id) : [defaultCalendarId])
      ),
      syncToken: sanitizeText(source.syncToken || overlay.syncToken) || null
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
    .filter((event) => event.availability !== 'FREE');
}
