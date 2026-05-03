import { defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

type CreateCalendarEvent = RouteTypes<'CalendarEventsV3Controller_createEvent'>
export const createCalendarEvent = defineMutation<
  CreateCalendarEvent['request'],
  CreateCalendarEvent['response']
>().using({
  method: 'POST',
  uri: (args) => `/v3/calendar-events/${args.calendarId}`,
  body: (args) => args,
})

export const deleteCalendarEvent = defineMutation<
  RouteTypes<'CalendarEventsV2Controller_deleteEvent'>['request'] & {
    id: string
  },
  void
>().using({
  method: 'DELETE',
  uri: (args) => {
    const queryParams = new URLSearchParams()
    if (args.recurrenceUpdateType) {
      queryParams.set('recurrenceUpdateType', args.recurrenceUpdateType)
    }
    if (args.timezone) {
      queryParams.set('timezone', args.timezone)
    }

    return `/v2/calendar_events/${args.id}?${queryParams.toString()}`
  },
})

type UpdateCalendarEvent = RouteTypes<'CalendarEventsV3Controller_updateEvent'>
export const updateCalendarEvent = defineMutation<
  UpdateCalendarEvent['request'],
  UpdateCalendarEvent['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v3/calendar-events/${args.id}`,
  body: ({ id, ...args }) => args,
})
