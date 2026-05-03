import { CustomFieldValuesSchema } from '@motion/shared/custom-fields'

import z from 'zod/v4'

import { BaseSchema } from './base'

import {
  DaysOfWeekSchema,
  DeadlineStatusSchema,
  DeadlineTypeSchema,
  PriorityLevelSchema,
  RecurringTaskFrequencySchema,
  ScheduledStatusSchema,
  TaskNameInputSchema,
} from '../common'
import { IsoDateSchema, IsoDateTimeSchema } from '../common/date-time'

export const TaskType = z.enum([
  'NORMAL',
  'CHUNK',
  'RECURRING_INSTANCE',
  'TEMPLATE',
  'RECURRING_TASK',
])

export const BaseTask = BaseSchema.extend({
  lastInteractedTime: IsoDateTimeSchema.nullish(),
  archivedTime: IsoDateTimeSchema.nullable(),
  assigneeUserId: z.string().nullable(),

  createdByUserId: z.string(),
  deadlineType: DeadlineTypeSchema,
  description: z
    .string()
    .nullable()
    .transform((d) => d ?? ''),
  duration: z.number().nullable(),
  name: z.string(),
  priorityLevel: PriorityLevelSchema,
  projectId: z.string().nullable(),

  statusId: z.string(),
  workspaceId: z.string(),
})

export const SchedulableBaseTaskSchema = BaseTask.extend({
  completedTime: IsoDateTimeSchema.nullable(),
  dueDate: IsoDateSchema.nullable(),
  isAutoScheduled: z.boolean(),
  isBusy: z.boolean(),
  isFixedTimeTask: z.boolean(),
  isUnfit: z.boolean(),

  needsReschedule: z.boolean(),
  scheduleId: z.string().nullable(),
  scheduleOverridden: z.boolean(),

  scheduledStart: IsoDateTimeSchema.nullable(),
  scheduledEnd: IsoDateTimeSchema.nullable(),

  snoozeUntil: IsoDateTimeSchema.nullable(),

  startOn: IsoDateSchema.nullable(),

  manuallyStarted: z.boolean(),
})

export const NormalTaskSchema = SchedulableBaseTaskSchema.extend({
  type: z.literal(TaskType.enum.NORMAL),

  minimumDuration: z.number().nullable(),
  ignoreWarnOnPastDue: z.boolean(),

  scheduledStatus: ScheduledStatusSchema.nullable(),
  estimatedCompletionTime: IsoDateTimeSchema.nullable(),
  deadlineStatus: DeadlineStatusSchema.optional(), // TODO make FE changes to support non-optional

  labelIds: z.string().array(),

  customFieldValues: z
    .record(z.string(), CustomFieldValuesSchema)
    .optional()
    .default({}),

  stageDefinitionId: z.string().nullable(),
  taskDefinitionId: z.string().nullable(),
  isSyncingWithDefinition: z.boolean(),

  scheduleMeetingWithinDays: z.number().nullable(),
  meetingTaskId: z.string().nullable(),
})
export type NormalTaskSchema = z.output<typeof NormalTaskSchema>

export const RecurringInstanceSchema = SchedulableBaseTaskSchema.extend({
  type: z.literal(TaskType.enum.RECURRING_INSTANCE),
  minimumDuration: z.number().nullable(),
  parentRecurringTaskId: z.string(),
  ignoreWarnOnPastDue: z.boolean(),

  scheduledStatus: ScheduledStatusSchema.nullable(),
  estimatedCompletionTime: IsoDateTimeSchema.nullable(),

  deadlineStatus: DeadlineStatusSchema.optional(), // TODO make FE changes to support non-optional

  labelIds: z.string().array(),
})
export type RecurringInstanceSchema = z.output<typeof RecurringInstanceSchema>

export const RecurringTaskSchema = z.object({
  id: z.string(),
  type: z.literal(TaskType.enum.RECURRING_TASK),
  isAutoScheduled: z.boolean(),
  name: TaskNameInputSchema,
  description: z
    .string()
    .nullable()
    .transform((d) => d ?? ''),
  createdByUserId: z.string(),
  workspaceId: z.string(),
  duration: z.number(),
  minimumDuration: z.number().nullable(),
  priorityLevel: PriorityLevelSchema.exclude(['LOW', 'ASAP']),
  deadlineType: DeadlineTypeSchema.exclude(['NONE', 'ASAP']),
  scheduleId: z.string().nullable(),
  startingOn: IsoDateSchema,
  needsUpdate: z.boolean(),
  days: z
    .string()
    .nullable()
    .transform((t) => {
      if (t == null) return null
      const days = t.split(',').filter(Boolean)
      return days.length > 0 ? days : null
    })
    .pipe(DaysOfWeekSchema.array().nullable()),
  frequency: RecurringTaskFrequencySchema,
  recurrenceMeta: z.string().nullable(),
  idealTime: z.string().nullable(),
  timeStart: z.string(),
  timeEnd: z.string(),
  assigneeUserId: z.string().nullable(),
  statusId: z.string(),
  excludedDates: z.string().array().nullable(),
  ignoreWarnOnPastDue: z.boolean(),

  labelIds: z.string().array(),
})
export type RecurringTaskSchema = z.output<typeof RecurringTaskSchema>

// Chunk
export const TaskScheduledEntitySchema = BaseSchema.extend({
  parentTaskId: z.string(),
  completedTime: IsoDateTimeSchema.nullable(),
  duration: z.number().nullable(),
  isFixed: z.boolean(),
  manuallyStarted: z.boolean(),
  needsReschedule: z.boolean(),
  scheduleOverridden: z.boolean(),
  scheduledStart: IsoDateTimeSchema.nullable(),
  scheduledEnd: IsoDateTimeSchema.nullable(),

  assigneeUserId: z.string().nullable(),
})
export type TaskScheduledEntitySchema = z.output<
  typeof TaskScheduledEntitySchema
>

export const TaskSchema = z.discriminatedUnion('type', [
  NormalTaskSchema,
  RecurringInstanceSchema,
])
export type TaskSchema = z.output<typeof TaskSchema>
