import { DEFAULT_DURATION } from '@motion/shared/pm'
import { parseDate } from '@motion/utils/dates'
import { stripUndefined } from '@motion/utils/object'
import {
  type DaysOfWeekSchema,
  type NormalTaskSchema,
  type TasksV2NormalUpdateSchema,
  type TasksV2RecurringInstanceUpdateSchema,
  type TasksV2RecurringTaskUpdateSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { type TaskFormFields } from './form-fields'

import { reduceCustomFieldsValuesFieldArrayToRecord } from '../../project'

export function convertFormFieldsForUpdate<T extends { value?: any }>(
  fields: TaskFormFields,
  dirtyKeys: (keyof TaskFormFields)[],
  dirtyCustomFieldsArray: T[]
):
  | Omit<TasksV2NormalUpdateSchema, 'type'>
  | Omit<TasksV2RecurringInstanceUpdateSchema, 'type'>
  | Omit<TasksV2RecurringTaskUpdateSchema, 'type'> {
  function mayBeInclude<
    K extends keyof TaskFormFields,
    V extends TaskFormFields[K],
  >(field: K, overriddenValue?: V): TaskFormFields[K] | undefined {
    const value = overriddenValue ?? fields[field]
    const shouldInclude = dirtyKeys == null || dirtyKeys.includes(field)
    return shouldInclude ? value : undefined
  }

  function getDirtyCustomFieldValues():
    | NormalTaskSchema['customFieldValues']
    | undefined {
    const shouldInclude = mayBeInclude('customFieldValuesFieldArray')

    if (!shouldInclude) {
      return
    }

    const dirtyCustomFields = dirtyCustomFieldsArray
      ?.map((maybeDirtyField, i) => {
        if (!maybeDirtyField) {
          return
        }

        if (!maybeDirtyField.value) {
          return
        }

        return fields.customFieldValuesFieldArray[i]
      })
      .filter(Boolean)

    if (!dirtyCustomFields) {
      return
    }

    return reduceCustomFieldsValuesFieldArrayToRecord(dirtyCustomFields)
  }

  const startDate =
    fields.priorityLevel === 'ASAP'
      ? DateTime.now().toISODate()
      : fields.startDate

  if (fields.type === 'NORMAL') {
    return stripUndefined({
      workspaceId: mayBeInclude('workspaceId'),
      projectId: mayBeInclude('projectId'),
      assigneeUserId: mayBeInclude('assigneeUserId'),
      statusId: mayBeInclude('statusId'),
      labelIds: mayBeInclude('labelIds'),
      priorityLevel: mayBeInclude('priorityLevel'),
      completedDuration: mayBeInclude('completedDuration'),
      duration: mayBeInclude('duration'),
      minimumDuration: mayBeInclude('minimumDuration'),
      name: mayBeInclude('name'),
      description: mayBeInclude('description'),
      startDate: mayBeInclude('startDate'),
      dueDate: mayBeInclude('dueDate'),
      deadlineType: mayBeInclude('deadlineType'),
      scheduleId: mayBeInclude('scheduleId'),
      isAutoScheduled: mayBeInclude('isAutoScheduled'),
      ignoreWarnOnPastDue: mayBeInclude('ignoreWarnOnPastDue'),
      customFieldValues: getDirtyCustomFieldValues(),
      stageDefinitionId: mayBeInclude('stageDefinitionId'),
    }) satisfies Omit<TasksV2NormalUpdateSchema, 'type'>
  }

  if (fields.type === 'RECURRING_INSTANCE') {
    return stripUndefined({
      statusId: mayBeInclude('statusId'),
      dueDate: mayBeInclude('dueDate'),
      duration: mayBeInclude('duration'),
      completedDuration: mayBeInclude('completedDuration'),
      ignoreWarnOnPastDue: mayBeInclude('ignoreWarnOnPastDue'),
    }) satisfies Omit<TasksV2RecurringInstanceUpdateSchema, 'type'>
  }

  if (fields.type === 'RECURRING_TASK') {
    return stripUndefined({
      workspaceId: mayBeInclude('workspaceId'),
      assigneeUserId:
        mayBeInclude('assigneeUserId', fields.assigneeUserId ?? 'unknown') ??
        undefined,
      statusId: mayBeInclude('statusId'),
      labelIds: mayBeInclude('labelIds'),
      priorityLevel: mayBeInclude(
        'priorityLevel',
        fields.priorityLevel === 'HIGH' ? 'HIGH' : 'MEDIUM'
      ) as 'HIGH' | 'MEDIUM' | undefined,
      duration:
        mayBeInclude('duration', fields.duration ?? DEFAULT_DURATION) ??
        undefined,
      minimumDuration: mayBeInclude('minimumDuration'),
      name: mayBeInclude('name'),
      description: mayBeInclude('description'),
      startingOn:
        mayBeInclude(
          'startDate',
          startDate ? parseDate(startDate).toISO() : undefined
        ) ?? undefined,
      deadlineType: mayBeInclude(
        'deadlineType',
        fields.deadlineType === 'HARD' ? 'HARD' : 'SOFT'
      ) as 'HARD' | 'SOFT' | undefined,
      frequency: mayBeInclude('frequency'),
      recurrenceMeta:
        mayBeInclude('recurrenceMeta', fields.recurrenceMeta ?? undefined) ??
        undefined,
      days: (mayBeInclude('days', fields.days as DaysOfWeekSchema[]) ??
        undefined) as DaysOfWeekSchema[] | undefined,
      scheduleId: mayBeInclude('scheduleId') ?? undefined,
      idealTime: mayBeInclude('idealTime'),
      timeStart: mayBeInclude('timeStart'),
      timeEnd: mayBeInclude('timeEnd'),
      isAutoScheduled: mayBeInclude('isAutoScheduled'),
      ignoreWarnOnPastDue: mayBeInclude('ignoreWarnOnPastDue'),
    }) satisfies Omit<TasksV2RecurringTaskUpdateSchema, 'type'>
  }

  throw new Error('Unsupported task type', {
    cause: {
      taskType: fields.type,
    },
  })
}
