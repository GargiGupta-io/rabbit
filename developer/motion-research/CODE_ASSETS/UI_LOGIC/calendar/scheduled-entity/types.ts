import {
  type CalendarEventSchemaV2,
  type ScheduledBlockingTimeslotSchema,
  type ScheduledEventSchema,
  type ScheduledTaskChunkSchema,
  type ScheduledTaskSchema,
  type TaskSchema,
} from '@motion/zod/client'

// Replicates proxy type for ScheduledEventSchema but only with direct references to the event object
// Without the other relations, etc.
type ExtendedScheduledEvent = ScheduledEventSchema & {
  event?: CalendarEventSchemaV2
}

type ExtendedScheduledTask = ScheduledTaskSchema & {
  task?: TaskSchema
}

type ExtendedScheduledTaskChunk = ScheduledTaskChunkSchema & {
  task?: TaskSchema
}

type ExtendedScheduledBlockingTimeslot = ScheduledBlockingTimeslotSchema

export type ExtendedScheduledEntity =
  | ExtendedScheduledEvent
  | ExtendedScheduledTask
  | ExtendedScheduledTaskChunk
  | ExtendedScheduledBlockingTimeslot
