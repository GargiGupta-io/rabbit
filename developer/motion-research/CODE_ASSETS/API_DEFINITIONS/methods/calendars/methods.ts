import { defineApi, defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

type GetAllRoute = RouteTypes<'CalendarsV2Controller_getAll'>
export const getCalendars = defineApi<
  GetAllRoute['request'],
  GetAllRoute['response']
>().using({
  uri: `/v2/calendars`,
  method: 'GET',
  key: queryKeys.root,
})

export const updatePrimary = defineMutation<
  RouteTypes<'CalendarsV2Controller_setAsPrimary'>['request'],
  RouteTypes<'CalendarsV2Controller_setAsPrimary'>['response']
>().using({
  uri: (args) => `/v2/calendars/${args.id}/primary`,
  method: 'PATCH',
  invalidate: [queryKeys.root],
})

type UpdateMultipleRoute = RouteTypes<'CalendarsV2Controller_updateMultiple'>
export const updateMultiple = defineMutation<
  UpdateMultipleRoute['request'],
  UpdateMultipleRoute['response']
>().using({
  uri: '/v2/calendars',
  method: 'PATCH',
  body: (args) => args,
})

/*
 * Fetches all calendars across all providers that are not cached in the store.
 */
export const fetchUncachedCalendarList = defineApi<
  RouteTypes<'CalendarListController_updateCalendarList'>['request'],
  void
>().using({
  uri: `/calendar_list`,
  method: 'POST',
  key: queryKeys.calendar_list,
})
