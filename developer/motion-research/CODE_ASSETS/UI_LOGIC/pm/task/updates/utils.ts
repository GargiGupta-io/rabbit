import {
  type NormalTaskSchema,
  type RecurringTaskSchema,
} from '@motion/zod/client'

export const changedFieldNames = [
  'type',
  'isAutoScheduled',
  'startDate',
  'dueDate',
  'assigneeUserId',
  'priorityLevel',
  'statusId',
  'duration',
  'completedDuration',
  'workspaceId',
  'frequency',
  'projectId',
] satisfies (keyof NormalTaskSchema | keyof RecurringTaskSchema)[]

export type ChangedFieldName = (typeof changedFieldNames)[number]

export function isChangedFieldName(name: string): name is ChangedFieldName {
  return changedFieldNames.includes(name)
}
