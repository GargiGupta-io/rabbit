import z from 'zod/v4'

import {
  NormalTaskSchema,
  RecurringInstanceSchema,
  TaskScheduledEntitySchema,
} from '../models'
import { AllModelsSchema } from '../models/all'
import { createModelSyncEvent, createSyncEvent } from '../utils/create-events'

export const TaskCreated = createModelSyncEvent('task.created', 1, ['tasks'])
export type TaskCreated = z.output<typeof TaskCreated>

export const TaskUpdated = createModelSyncEvent('task.updated', 1, ['tasks'])
export const TaskDeleted = createSyncEvent(
  'task.deleted',
  1,
  z.object({
    partials: z.object({
      tasks: z
        .record(
          z.string(),
          z.object({
            id: z.string(),
            deletedTime: z.date(),
          })
        )
        .default({}),
    }),
  })
)

export const ChunkCreated = createModelSyncEvent('chunk.created', 1, ['chunks'])
export const ChunkUpdated = createModelSyncEvent('chunk.updated', 1, ['chunks'])
export const ChunkDeleted = createModelSyncEvent('chunk.deleted', 1, ['chunks'])

export const TasksScheduledEvent = createSyncEvent(
  'workspace.tasks-scheduled',
  1,
  z.object({
    models: AllModelsSchema.pick({ tasks: true, chunks: true }).optional(),
    partials: z
      .object({
        chunks: z
          .record(
            z.string(),
            TaskScheduledEntitySchema.partial().required({ id: true })
          )
          .default({}),
        tasks: z
          .record(
            z.string(),
            z.union([
              NormalTaskSchema.partial().required({ id: true }),
              RecurringInstanceSchema.partial().required({ id: true }),
            ])
          )
          .default({}),
      })
      .optional(),
  })
)
