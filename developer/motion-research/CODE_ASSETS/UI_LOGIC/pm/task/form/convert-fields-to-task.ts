import {
  type NormalTaskSchema,
  type RecurringInstanceSchema,
  type RecurringTaskSchema,
} from '@motion/rpc-types'
import { createNoneId } from '@motion/shared/identifiers'
import { pick } from '@motion/utils/object'

import { DateTime } from 'luxon'

import { type TaskFormFields } from './form-fields'

import {
  reduceCustomFieldsValuesFieldArrayToRecord,
  type TaskDefinitionFormFields,
} from '../../project'

export function convertFormFieldsToTask(
  fields: TaskFormFields | TaskDefinitionFormFields
): NormalTaskSchema | RecurringInstanceSchema | RecurringTaskSchema {
  if (fields.type === 'RECURRING_TASK') {
    const task: RecurringTaskSchema = {
      type: 'RECURRING_TASK',
      ...pick(fields, [
        'workspaceId',
        'assigneeUserId',
        'isAutoScheduled',
        'statusId',
        'name',
        'description',
        'minimumDuration',
        'scheduleId',
        'ignoreWarnOnPastDue',
        'labelIds',
        'days',
        'frequency',
        'recurrenceMeta',
        'idealTime',
        'timeStart',
        'timeEnd',
      ]),
      id: fields.id ?? createNoneId(fields.workspaceId),
      deadlineType: fields.deadlineType === 'HARD' ? 'HARD' : 'SOFT',
      needsUpdate: false,
      excludedDates: null,
      createdByUserId: 'unknown',
      // These following fields are expected not to be fully valid
      // because the changed fields logic is reading these wrong values and converting them into valid ones
      // https://github.com/usemotion/motion/blob/main/packages/ui-logic/src/pm/task-updates/changed-fields/task-type.ts#L20
      startingOn: fields.startDate ?? '',
      priorityLevel: fields.priorityLevel as 'MEDIUM' | 'HIGH',
      duration: fields.duration as number,
    }

    return task
  }

  if (fields.type === 'RECURRING_INSTANCE') {
    const task: RecurringInstanceSchema = {
      type: 'RECURRING_INSTANCE',
      ...pick(fields, [
        'workspaceId',
        'assigneeUserId',
        'isAutoScheduled',
        'statusId',
        'name',
        'description',
        'startDate',
        'dueDate',
        'duration',
        'minimumDuration',
        'completedDuration',
        'priorityLevel',
        'deadlineType',
        'scheduleId',
        'ignoreWarnOnPastDue',
        'labelIds',
        'completedTime',
      ]),
      id: fields.id ?? createNoneId(fields.workspaceId),
      parentRecurringTaskId: createNoneId(fields.workspaceId),
      startOn: fields.startDate,
      projectId: null, // remove eventually - https://usemotion.slack.com/archives/CKP2K3JBS/p1717077977926899
      archivedTime: null,
      createdTime: DateTime.now().toISO(),
      updatedTime: null,
      endDate: null,
      createdByUserId: 'unknown',
      rank: null,
      isBusy: false,
      isFixedTimeTask: false,
      isUnfit: false,
      needsReschedule: false,
      manuallyStarted: false,
      isFutureSchedulable: false,
      scheduleOverridden: false,
      snoozeUntil: null,
      scheduledEnd: null,
      scheduledStart: null,
      chunkIds: [],
      scheduledStatus: null,
      estimatedCompletionTime: null,
      isUnvisitedStage: false,
    }
    return task
  }

  const task: NormalTaskSchema = {
    type: 'NORMAL',
    ...pick(fields, [
      'workspaceId',
      'projectId',
      'assigneeUserId',
      'isAutoScheduled',
      'statusId',
      'name',
      'description',
      'startDate',
      'dueDate',
      'duration',
      'minimumDuration',
      'completedDuration',
      'priorityLevel',
      'deadlineType',
      'scheduleId',
      'ignoreWarnOnPastDue',
      'labelIds',
      'completedTime',
      'blockingTaskIds',
      'blockedByTaskIds',
      'stageDefinitionId',
    ]),
    id: fields.id ?? createNoneId(fields.workspaceId),
    customFieldValues: reduceCustomFieldsValuesFieldArrayToRecord(
      fields.customFieldValuesFieldArray
    ),
    startOn: fields.startDate,
    archivedTime: null,
    createdTime: DateTime.now().toISO(),
    updatedTime: null,
    createdByUserId: 'unknown',
    rank: null,
    isBusy: false,
    isFixedTimeTask: false,
    isUnfit: false,
    needsReschedule: false,
    manuallyStarted: false,
    isFutureSchedulable: false,
    scheduleOverridden: false,
    snoozeUntil: null,
    scheduledEnd: null,
    scheduledStart: null,
    chunkIds: [],
    scheduledStatus: null,
    estimatedCompletionTime: null,
    taskDefinitionId: null,
    isUnvisitedStage: false,
    isSyncingWithDefinition: false,
    scheduleMeetingWithinDays: null,
    meetingTaskId: null,
    meetingEventId: null,
  }

  return task
}
