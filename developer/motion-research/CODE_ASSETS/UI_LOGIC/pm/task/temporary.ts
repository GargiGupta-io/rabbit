import { createNoneId } from '@motion/shared/identifiers'
import { DEFAULT_DURATION } from '@motion/shared/pm'
import {
  type NormalTaskSchema,
  type RecurringTaskSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import {
  getTaskDefaultDueDate,
  getTaskInitialStartDate,
} from './form/date-helpers'

export type CreateTemporaryNormalTaskProps = Pick<
  NormalTaskSchema,
  'workspaceId' | 'projectId' | 'statusId'
> & {
  id?: NormalTaskSchema['id']
  isAutoScheduled: NormalTaskSchema['isAutoScheduled']
  assigneeUserId: NormalTaskSchema['assigneeUserId']
  createdByUserId: NormalTaskSchema['createdByUserId']
  priorityLevel?: NormalTaskSchema['priorityLevel']
  startDate?: NormalTaskSchema['startDate']
  dueDate?: NormalTaskSchema['dueDate']
  labelIds?: NormalTaskSchema['labelIds']
  customFieldValues?: NormalTaskSchema['customFieldValues'] | null
  name?: NormalTaskSchema['name']
  stageDefinitionId?: NormalTaskSchema['stageDefinitionId']
  scheduledStart?: NormalTaskSchema['scheduledStart']
  duration?: NormalTaskSchema['duration']
}

export const createTemporaryNormalTask = ({
  id,
  isAutoScheduled,
  assigneeUserId,
  createdByUserId,
  workspaceId,
  projectId,
  statusId,
  startDate,
  dueDate,
  priorityLevel,
  labelIds,
  customFieldValues,
  name = '',
  stageDefinitionId = null,
  scheduledStart,
  duration,
}: CreateTemporaryNormalTaskProps): NormalTaskSchema => {
  const defaultStartDate = getTaskInitialStartDate()
  return {
    id: id ?? createNoneId(workspaceId),
    type: 'NORMAL',
    assigneeUserId,
    workspaceId,
    projectId,
    statusId,
    name,
    description: '',
    startDate: startDate ?? defaultStartDate,
    startOn: startDate ?? defaultStartDate,
    dueDate: dueDate ?? getTaskDefaultDueDate(),
    deadlineType: 'SOFT',
    duration: duration ?? DEFAULT_DURATION,
    minimumDuration: null,
    isAutoScheduled,
    priorityLevel: priorityLevel ?? 'MEDIUM',
    scheduleId: 'work',
    scheduledStart: scheduledStart ?? null,
    scheduledEnd: null,
    labelIds: labelIds ?? [],
    createdByUserId,
    completedDuration: 0,
    completedTime: null,
    createdTime: DateTime.utc().toISO(),
    updatedTime: null,
    archivedTime: null,
    rank: null,
    isBusy: false,
    isFixedTimeTask: false,
    isUnfit: false,
    needsReschedule: false,
    scheduleOverridden: false,
    snoozeUntil: null,
    manuallyStarted: false,
    isFutureSchedulable: false,
    ignoreWarnOnPastDue: false,
    chunkIds: [],
    blockingTaskIds: [],
    blockedByTaskIds: [],
    customFieldValues: customFieldValues ?? {},
    scheduledStatus: null,
    estimatedCompletionTime: null,
    stageDefinitionId,
    taskDefinitionId: null,
    isSyncingWithDefinition: false,
    isUnvisitedStage: false,
    scheduleMeetingWithinDays: null,
    meetingTaskId: null,
    meetingEventId: null,
  } satisfies NormalTaskSchema
}

export const createTemporaryTask = ({
  type = 'NORMAL',
  ...args
}: CreateTemporaryNormalTaskProps & {
  type?: NormalTaskSchema['type'] | RecurringTaskSchema['type']
}): NormalTaskSchema | RecurringTaskSchema => {
  if (type === 'NORMAL') {
    return createTemporaryNormalTask(args)
  }

  return createTemporaryRecurringTask({
    assigneeUserId: args.assigneeUserId,
    workspaceId: args.workspaceId,
    statusId: args.statusId,
    labelIds: args.labelIds ?? [],
    name: args.name ?? '',
    createdByUserId: args.createdByUserId,
    isAutoScheduled: args.isAutoScheduled,
  })
}

type CreateTemporaryRecurringTaskProps = Pick<
  RecurringTaskSchema,
  | 'isAutoScheduled'
  | 'assigneeUserId'
  | 'createdByUserId'
  | 'workspaceId'
  | 'statusId'
  | 'labelIds'
  | 'name'
>

const createTemporaryRecurringTask = ({
  isAutoScheduled,
  assigneeUserId,
  createdByUserId,
  workspaceId,
  statusId,
  labelIds,
  name,
}: CreateTemporaryRecurringTaskProps) => {
  return {
    id: createNoneId(workspaceId),
    type: 'RECURRING_TASK',
    assigneeUserId,
    workspaceId,
    statusId,
    name,
    description: '',
    deadlineType: 'SOFT',
    duration: DEFAULT_DURATION,
    minimumDuration: null,
    isAutoScheduled,
    priorityLevel: 'MEDIUM',
    scheduleId: 'work',
    labelIds,
    createdByUserId,
    ignoreWarnOnPastDue: false,
    days: [],
    excludedDates: null,
    frequency: 'WEEKLY',
    idealTime: null,
    recurrenceMeta: null,
    needsUpdate: false,
    startingOn: '',
    timeEnd: '',
    timeStart: '',
  } satisfies RecurringTaskSchema
}
