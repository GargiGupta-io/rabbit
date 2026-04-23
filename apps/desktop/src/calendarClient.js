import {
  KEEP_PREVIOUS_DATA,
  createMotionKey,
  defineMutation,
  defineQuery,
  sortStringList
} from './apiClient.js';

function buildProviderIdParams(providerIds = []) {
  const params = new URLSearchParams();
  sortStringList(providerIds).forEach((id) => params.append('providerIds[]', id));
  return params.toString();
}

export const queryKeys = {
  root: createMotionKey('calendars'),
  uncachedCalendarList: createMotionKey('uncached_calendar_list'),
  calendarEventsRoot: createMotionKey('calendar-events'),
  searchEvents: (searchQuery) => createMotionKey(queryKeys.calendarEventsRoot, searchQuery || ''),
  teammateEvents: (userIds = []) => createMotionKey(queryKeys.calendarEventsRoot, 'teammates', sortStringList(userIds)),
  calendarEventsByProviderIds: (providerIds = []) => createMotionKey(queryKeys.calendarEventsRoot, 'calendars', sortStringList(providerIds)),
  scheduleAssistant: (args = {}) => [...createMotionKey(queryKeys.calendarEventsRoot, 'scheduleAssistant'), args]
};

export const getCalendars = defineQuery({
  method: 'GET',
  uri: '/v2/calendars',
  key: () => queryKeys.root
});

export const updatePrimaryCalendar = defineMutation({
  method: 'PATCH',
  uri: (args = {}) => `/v2/calendars/${args.id || ''}/primary`,
  invalidate: [queryKeys.root]
});

export const updateCalendars = defineMutation({
  method: 'PATCH',
  uri: '/v2/calendars',
  body: (args = {}) => args
});

export const fetchUncachedCalendarList = defineQuery({
  method: 'POST',
  uri: '/calendar_list',
  key: () => queryKeys.uncachedCalendarList,
  body: (args = {}) => args
});

export const searchCalendarEvents = defineQuery({
  key: (args = {}) => queryKeys.searchEvents(args.query),
  uri: (args = {}) => ({
    pathname: '/v2/calendar_events/search',
    search: args
  }),
  transform: (data = {}) => data.calendarEvents || []
});

export const getTeammateEvents = defineQuery({
  method: 'POST',
  uri: '/v2/calendar_events/teammates',
  body: (args = {}) => args,
  key: (args = {}) => queryKeys.teammateEvents(args.userIds)
});

export const getCalendarEvents = defineQuery({
  method: 'GET',
  uri: (args = {}) => `/v2/calendar_events/gantt?${buildProviderIdParams(args.providerIds)}`,
  key: (args = {}) => queryKeys.calendarEventsByProviderIds(args.providerIds)
});

export const getSchedulingAssistantEvents = defineQuery({
  method: 'POST',
  uri: '/v3/calendar-events/scheduling-assistant',
  body: (args = {}) => args,
  key: (args = {}) => queryKeys.scheduleAssistant(args),
  queryOptions: {
    placeholderData: KEEP_PREVIOUS_DATA
  }
});

export const getSchedulingAssistantEventsV4 = defineQuery({
  method: 'POST',
  uri: '/v4/calendar-events/scheduling-assistant',
  body: (args = {}) => args,
  key: (args = {}) => queryKeys.scheduleAssistant(args),
  queryOptions: {
    placeholderData: KEEP_PREVIOUS_DATA
  }
});
