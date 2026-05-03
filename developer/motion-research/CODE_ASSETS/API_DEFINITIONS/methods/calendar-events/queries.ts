import { defineApi } from '@motion/rpc'

import { keepPreviousData } from '@tanstack/react-query'

import { queryKeys } from './keys'

import { type DTO, type RouteTypes } from '../types'

export type CalendarEventSearchResponse = DTO<'CalendarEventSearchResponseDto'>

type CalendarEventSearch = RouteTypes<'CalendarEventsV2Controller_search'>

export const search = defineApi<
  CalendarEventSearch['request'],
  CalendarEventSearch['response']['calendarEvents']
>().using({
  key: (args) => queryKeys.search(args.query),
  uri: (args) => ({
    pathname: '/v2/calendar_events/search',
    search: args,
  }),
  transform: (data: CalendarEventSearch['response']) => data.calendarEvents,
})

export type TeamMateEvents =
  RouteTypes<'CalendarEventsV2Controller_getTeammateOutOfOfficeEvents'>

export const getTeamMateEvents = defineApi<
  TeamMateEvents['request'],
  TeamMateEvents['response']
>().using({
  key: (args) => queryKeys.teammates(args.userIds),
  body: (args) => args,
  method: 'POST',
  uri: '/v2/calendar_events/teammates',
})

export type GetCalendarEvents =
  RouteTypes<'CalendarEventsV2Controller_getByProviderIds'>

export const getCalendarEvents = defineApi<
  { providerIds: string[] },
  GetCalendarEvents['response']
>().using({
  key: (args) => queryKeys.calendars(args.providerIds.sort()),
  uri: (args) => {
    const queryParams = new URLSearchParams(
      args.providerIds.map((id) => ['providerIds[]', id])
    )
    return `/v2/calendar_events/gantt?${queryParams.toString()}`
  },
})

export type GetScheduleAssistantEvents =
  RouteTypes<'CalendarEventsV3Controller_getSchedulingAssistantEvents'>
export const getScheduleAssistantEvents = defineApi<
  GetScheduleAssistantEvents['request'],
  GetScheduleAssistantEvents['response']
>().using({
  key: (args) => queryKeys.scheduleAssistant(args),
  method: 'POST',
  uri: () => '/v3/calendar-events/scheduling-assistant',
  body: (args) => args,
  queryOptions: {
    placeholderData: keepPreviousData,
  },
})

export type GetScheduleAssistantEventsV4 =
  RouteTypes<'CalendarEventsV4Controller_getSchedulingAssistantEvents'>

export const getScheduleAssistantEventsV4 = defineApi<
  GetScheduleAssistantEventsV4['request'],
  GetScheduleAssistantEventsV4['response']
>().using({
  key: (args) => queryKeys.scheduleAssistant(args),
  method: 'POST',
  uri: () => '/v4/calendar-events/scheduling-assistant',
  body: (args) => args,
  queryOptions: {
    placeholderData: keepPreviousData,
  },
})
