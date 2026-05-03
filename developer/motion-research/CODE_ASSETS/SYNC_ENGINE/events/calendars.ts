import z from 'zod/v4'

import { CalendarSchema } from '../models/calendars'
import { createModelSyncEvent, createSyncEvent } from '../utils/create-events'

export const CalendarAdded = createModelSyncEvent('calendar.added', 1, [
  'calendars',
])

export const CalendarRemoved = createSyncEvent(
  'calendar.removed',
  1,
  z.object({
    partials: z.object({
      calendars: z
        .record(z.string(), CalendarSchema.partial().required({ id: true }))
        .default({}),
    }),
  })
)

export const CalendarUpdated = createModelSyncEvent('calendar.updated', 1, [
  'calendars',
])
