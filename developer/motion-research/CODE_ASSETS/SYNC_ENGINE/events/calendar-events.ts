import z from 'zod/v4'

import { AllModelsSchema } from '../models/all'
import { CalendarEventSchema } from '../models/calendar-events'
import { createModelSyncEvent, createSyncEvent } from '../utils/create-events'

export const CalendarEventCreated = createModelSyncEvent(
  'calendar-event.created',
  1,
  ['calendarEvents']
)
export const CalendarEventUpdated = createModelSyncEvent(
  'calendar-event.updated',
  1,
  ['calendarEvents']
)
export const CalendarEventDeleted = createSyncEvent(
  'calendar-event.deleted',
  1,
  z.object({
    models: AllModelsSchema.pick({ calendarEvents: true }).default({
      calendarEvents: {},
    }),
    partials: z
      .object({
        calendarEvents: z.record(
          z.string(),
          CalendarEventSchema.partial().required({ id: true })
        ),
      })
      .default({ calendarEvents: {} }),
  })
)

export const CalendarSyncExecuteEvent = createSyncEvent(
  'calendar-sync.execute',
  1,
  z.object({
    models: AllModelsSchema.pick({ calendarEvents: true }).default({
      calendarEvents: {},
    }),
    partials: z
      .object({
        calendarEvents: z.record(
          z.string(),
          CalendarEventSchema.partial().required({ id: true })
        ),
      })
      .default({ calendarEvents: {} }),
  })
)
