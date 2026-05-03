import {
  type DaysOfWeekSchema,
  type TasksV2CreateRequest,
  type TasksV2NormalCreateSchema,
  type TasksV2RecurringTaskCreateSchema,
} from '@motion/rpc-types'
import { pick } from '@motion/utils/object'

import { type TaskFormFields } from './form-fields'

import { reduceCustomFieldsValuesFieldArrayToRecord } from '../../project'

export function convertFieldsForCreate(
  fields: TaskFormFields
): TasksV2CreateRequest['data'] {
  if (fields.type === 'NORMAL') {
    return {
      ...pick(fields, [
        'assigneeUserId',
        'blockedByTaskIds',
        'deadlineType',
        'description',
        'dueDate',
        'duration',
        'ignoreWarnOnPastDue',
        'isAutoScheduled',
        'labelIds',
        'minimumDuration',
        'name',
        'priorityLevel',
        'projectId',
        'scheduleId',
        'startDate',
        'statusId',
        'workspaceId',
        'stageDefinitionId',
        'isFixedTimeTask',
        'scheduledStart',
        'scheduledEnd',
      ]),
      customFieldValues: reduceCustomFieldsValuesFieldArrayToRecord(
        fields.customFieldValuesFieldArray.filter(
          (field) => field.value != null
        )
      ),
      uploadedFileIds: fields.uploadedFiles.map((file) => file.id),
      type: fields.type,
    } satisfies TasksV2NormalCreateSchema
  }

  if (fields.type === 'RECURRING_TASK') {
    return {
      ...pick(fields, [
        'frequency',
        'idealTime',
        'ignoreWarnOnPastDue',
        'isAutoScheduled',
        'labelIds',
        'minimumDuration',
        'name',
        'statusId',
        'timeEnd',
        'timeStart',
        'workspaceId',
      ]),
      assigneeUserId: fields.assigneeUserId ?? undefined,
      deadlineType: fields.deadlineType as 'HARD' | 'SOFT',
      description: fields.description ?? undefined,
      recurrenceMeta: fields.recurrenceMeta ?? '',
      days: (fields.days as DaysOfWeekSchema[] | null) ?? undefined,
      duration: fields.duration ?? 0,
      priorityLevel: fields.priorityLevel as 'MEDIUM' | 'HIGH' | undefined,
      scheduleId: fields.scheduleId ?? 'custom',
      startingOn: fields.startDate ?? undefined,
      type: fields.type,
    } satisfies TasksV2RecurringTaskCreateSchema
  }

  throw new Error('Unsupported task type', {
    cause: {
      taskType: fields.type,
    },
  })
}
