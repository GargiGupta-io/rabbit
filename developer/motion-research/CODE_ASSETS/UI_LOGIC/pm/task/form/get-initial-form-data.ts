import {
  type LabelSchema,
  type PriorityLevel,
  type ProjectSchema,
  type RecurringTaskSchema,
  type ScheduleCollection,
  type StatusSchema,
  type TaskSchema,
  type UserSettingsSchema,
  type WorkspaceSchema,
} from '@motion/rpc-types'
import {
  type DeadlineType,
  findDefaultStatus,
  isAutoScheduledStatus,
  isCompletedStatus,
} from '@motion/shared/common'
import { DEFAULT_DURATION, NO_CHUNK_DURATION } from '@motion/shared/pm'
import { stripNull } from '@motion/utils/object'

import { getFixedTimeTaskInfo } from './date-helpers'
import { type TaskFormFields } from './form-fields'
import { getDuplicatedOrExistingTaskFields } from './get-duplicated-task-data'
import { getTaskDefaultDates } from './get-task-default-dates'
import { type TaskUrlSearchParams } from './task-url-params'

import {
  type AllAvailableCustomFieldSchema,
  type CustomFieldFieldArrayValue,
  mapCustomFieldToFieldArrayWithValue,
} from '../../custom-fields'
import { isValidPriority } from '../../priorities'
import { isValidStageDefinitionId } from '../../project/flows/utils'
import { DEFAULT_SCHEDULE_ID } from '../fields'

export type TaskModalLocationState = {
  chunkId?: TaskSchema['id']
  fixedTask?: boolean
  reminderTask?: boolean
}

export type GetInitialFormDataOptions = {
  workspaceId: WorkspaceSchema['id']
  searchParams?: TaskUrlSearchParams & { templateId?: string; template?: 'new' } // flow template modal
  state?: TaskModalLocationState
  task?: TaskSchema | RecurringTaskSchema | null
  parentTask?: TaskSchema | RecurringTaskSchema | null

  currentUserId: string
  project?: ProjectSchema | null
  workspaceStatuses: StatusSchema[]
  workspaceCustomFields: AllAvailableCustomFieldSchema[]
  workspaceLabels: LabelSchema[]
  schedules: ScheduleCollection
  scheduledStart?: string | null
  scheduledEnd?: string | null
  taskTitle?: string
  userDefinedTaskDefaults?: UserSettingsSchema['taskDefaultSettings']
}

export function getInitialFormData(
  options: GetInitialFormDataOptions
): TaskFormFields {
  const {
    task,
    searchParams = {},
    parentTask,
    project,
    workspaceId,
    workspaceCustomFields,
    workspaceStatuses,
    scheduledStart,
    scheduledEnd,
  } = options

  if (task?.type === 'CHUNK') {
    throw new Error('Cannot open a chunk in the task modal')
  }

  if (workspaceId == null) {
    throw new Error('Workspace id not defined')
  }

  const { stageDefinitionId } = getStageInfo(
    project,
    searchParams.forStage ?? null
  )

  const { startDate, dueDate } = getTaskDates(options, task, stageDefinitionId)

  const usingTaskData = task != null

  // If we're not editing an existing task (or duplicating), return new task form data
  if (!usingTaskData) {
    return getNewTaskFormData({
      ...options,
      startDate,
      dueDate,
      stageDefinitionId,
    })
  }

  // Handle existing task data
  const isDuplicatingTask = searchParams.forTaskId != null && task != null
  const isInstance = task.type === 'RECURRING_INSTANCE'

  const {
    isFixedTimeTask,
    fixedTimeTaskDuration,
    fixedTimeTaskMinimumDuration,
    scheduledStart: finalScheduledStart,
    scheduledEnd: finalScheduledEnd,
  } = getFixedTimeTaskInfo(scheduledStart, scheduledEnd)

  const { status, isAutoScheduled: isAutoScheduledFromStatus } = getTaskStatus(
    task.statusId,
    workspaceStatuses,
    isFixedTimeTask
  )

  // Handle task duplication if needed
  const {
    id,
    name,
    description,
    status: finalStatus,
    isAutoScheduled: finalAutoScheduled,
    duration,
    minimumDuration,
    completedTime,
    completedDuration,
  } = getDuplicatedOrExistingTaskFields({
    isDuplicatingTask,
    task,
    isInstance,
    parentTask,
    workspaceId,
    searchParams,
    taskTitle: options.taskTitle,
    status,
    isAutoScheduledFromStatus,
    workspaceStatuses,
  })

  // Return the final task data
  return {
    id,
    type: task.type,
    workspaceId,
    projectId: project?.id ?? null,
    stageDefinitionId:
      'stageDefinitionId' in task ? task.stageDefinitionId : null,
    statusId: finalStatus?.id ?? '',
    assigneeUserId: task.assigneeUserId,
    isAutoScheduled: finalAutoScheduled,
    labelIds: 'labelIds' in task ? task.labelIds : [],
    blockingTaskIds: 'blockingTaskIds' in task ? task.blockingTaskIds : [],
    blockedByTaskIds: 'blockedByTaskIds' in task ? task.blockedByTaskIds : [],
    priorityLevel: task.priorityLevel,
    name,
    description,
    duration: isFixedTimeTask ? fixedTimeTaskDuration : duration,
    completedDuration,
    minimumDuration: isFixedTimeTask
      ? fixedTimeTaskMinimumDuration
      : minimumDuration,
    startDate,
    dueDate,
    deadlineType: task.deadlineType,
    scheduleId: task.scheduleId,
    ignoreWarnOnPastDue:
      'ignoreWarnOnPastDue' in task ? task.ignoreWarnOnPastDue : false,
    customFieldValuesFieldArray: workspaceCustomFields.map((field) =>
      mapCustomFieldToFieldArrayWithValue(
        field,
        'customFieldValues' in task ? task.customFieldValues : {}
      )
    ),
    completedTime,
    days: 'days' in task ? task.days : ['MO', 'TU', 'WE', 'TH', 'FR'],
    frequency: 'frequency' in task ? task.frequency : 'DAILY',
    recurrenceMeta: 'recurrenceMeta' in task ? task.recurrenceMeta : '',
    idealTime: 'idealTime' in task ? task.idealTime : null,
    timeStart: getTimeStart(task, parentTask),
    timeEnd: getTimeEnd(task, parentTask),
    isFixedTimeTask,
    scheduledStart: finalScheduledStart,
    scheduledEnd: finalScheduledEnd,
    isUnvisitedStage:
      'isUnvisitedStage' in task ? task.isUnvisitedStage : false,
    meetingTaskId: task.type === 'NORMAL' ? task.meetingTaskId : null,
    scheduleMeetingWithinDays:
      task.type === 'NORMAL' ? task.scheduleMeetingWithinDays : null,
    uploadedFiles: [],
  }
}

export function getNewTaskFormData({
  workspaceId,
  workspaceStatuses,
  workspaceCustomFields,
  workspaceLabels,
  currentUserId,
  searchParams,
  project,
  scheduledStart,
  scheduledEnd,
  taskTitle,
  startDate,
  dueDate,
  stageDefinitionId,
  schedules,
  userDefinedTaskDefaults,
}: GetInitialFormDataOptions & {
  startDate: string | null
  dueDate: string | null
  stageDefinitionId: string | null
}): TaskFormFields {
  const baseData = getDefaultTaskValues(currentUserId, userDefinedTaskDefaults)

  // Handle fixed time task info
  const {
    isFixedTimeTask,
    fixedTimeTaskDuration,
    fixedTimeTaskMinimumDuration,
    scheduledStart: finalScheduledStart,
    scheduledEnd: finalScheduledEnd,
  } = getFixedTimeTaskInfo(
    scheduledStart,
    scheduledEnd,
    baseData.duration,
    baseData.minimumDuration
  )

  const validBaseData = validateBaseData(baseData, {
    workspaceStatuses,
    workspaceLabels,
    workspaceCustomFields,
    schedules,
    searchParams,
    isFixedTimeTask,
    currentUserId,
  })

  // Build final form data with search params taking precedence
  const formData: TaskFormFields = {
    id: undefined,
    workspaceId: workspaceId,
    projectId: project?.id ?? null,
    stageDefinitionId,
    statusId: validBaseData.statusId,
    assigneeUserId: validBaseData.assigneeUserId,
    priorityLevel: validBaseData.priorityLevel,
    labelIds: validBaseData.labelIds,
    isAutoScheduled: validBaseData.isAutoScheduled,
    blockingTaskIds: [],
    blockedByTaskIds: [],
    name: taskTitle ?? '',
    description: '',
    // Use fixed time duration if available, otherwise use default/base duration
    duration: isFixedTimeTask ? fixedTimeTaskDuration : validBaseData.duration,
    minimumDuration: isFixedTimeTask
      ? fixedTimeTaskMinimumDuration
      : validBaseData.minimumDuration,
    completedDuration: 0,
    startDate,
    dueDate,
    deadlineType: validBaseData.deadlineType,
    scheduleId: validBaseData.scheduleId,
    ignoreWarnOnPastDue: validBaseData.ignoreWarnOnPastDue,
    customFieldValuesFieldArray: validBaseData.customFieldValuesFieldArray,
    completedTime: null,
    days: ['MO', 'TU', 'WE', 'TH', 'FR'],
    frequency: 'DAILY',
    recurrenceMeta: '',
    idealTime: null,
    timeStart: '8:00 am',
    timeEnd: '5:00 pm',
    isFixedTimeTask,
    scheduledStart: finalScheduledStart,
    scheduledEnd: finalScheduledEnd,
    isUnvisitedStage: false,
    meetingTaskId: null,
    scheduleMeetingWithinDays: null,
    type: 'NORMAL',
    uploadedFiles: [],
  }

  return formData
}

function getTaskStatus(
  statusId: string | undefined,
  workspaceStatuses: StatusSchema[],
  isFixedTimeTask: boolean
) {
  const status =
    workspaceStatuses.find((s) => s.id === statusId) ??
    findDefaultStatus(workspaceStatuses)
  const isAutoScheduled =
    isFixedTimeTask ||
    (status
      ? isAutoScheduledStatus(status) && !isCompletedStatus(status)
      : false)

  return { status, isAutoScheduled }
}

function getTimeStart(
  task: TaskSchema | RecurringTaskSchema,
  parentTask: TaskSchema | RecurringTaskSchema | null | undefined
): string {
  return parentTask != null && 'timeStart' in parentTask
    ? parentTask.timeStart
    : 'timeStart' in task
      ? task.timeStart
      : '8:00 am'
}

function getTimeEnd(
  task: TaskSchema | RecurringTaskSchema,
  parentTask: TaskSchema | RecurringTaskSchema | null | undefined
): string {
  return parentTask != null && 'timeEnd' in parentTask
    ? parentTask.timeEnd
    : 'timeEnd' in task
      ? task.timeEnd
      : '5:00 pm'
}

function getStageInfo(
  project: ProjectSchema | null | undefined,
  forStage: string | null
) {
  const isValidStageParam =
    project != null ? isValidStageDefinitionId(forStage, project) : false
  const stageDefinitionId = isValidStageParam
    ? forStage
    : (project?.activeStageDefinitionId ?? null)

  return { stageDefinitionId }
}

function getTaskDates(
  options: GetInitialFormDataOptions,
  task: TaskSchema | RecurringTaskSchema | undefined | null,
  stageDefinitionId: string | null
) {
  const { searchParams = {}, project, userDefinedTaskDefaults } = options
  const { forStartDate: forStartDateParam, forDueDate: forDueDateParam } =
    searchParams

  const initialDueDate = forDueDateParam
  const initialStartDate = forStartDateParam

  return getTaskDefaultDates({
    project,
    stageDefinitionId,
    task,
    startOverride: initialStartDate,
    dueDateOverride: initialDueDate,
    userDefinedTaskDefaults,
  })
}

export type BaseTaskData = {
  assigneeUserId: string
  priorityLevel: PriorityLevel
  duration: number
  minimumDuration: number | null
  deadlineType: DeadlineType
  scheduleId: string
  ignoreWarnOnPastDue: boolean
  statusId: string
  labelIds: string[]
  customFieldValues: Record<string, CustomFieldFieldArrayValue>
  isAutoScheduled?: boolean
}

function getDefaultTaskValues(
  currentUserId: string,
  userDefinedTaskDefaults?: UserSettingsSchema['taskDefaultSettings']
): BaseTaskData {
  const fallbackValues = {
    assigneeUserId: currentUserId,
    priorityLevel: 'MEDIUM' as const,
    duration: DEFAULT_DURATION,
    minimumDuration: NO_CHUNK_DURATION,
    deadlineType: 'SOFT' as const,
    scheduleId: DEFAULT_SCHEDULE_ID,
    ignoreWarnOnPastDue: false,
    statusId: '',
    labelIds: [] as string[],
    customFieldValues: {},
  } as const

  const globalDefaults = userDefinedTaskDefaults?.global ?? {}

  return {
    ...fallbackValues,
    ...stripNull(globalDefaults),
  }
}

export function validateBaseData(
  baseData: BaseTaskData,
  options: {
    workspaceStatuses: StatusSchema[]
    workspaceLabels: LabelSchema[]
    workspaceCustomFields: AllAvailableCustomFieldSchema[]
    schedules: ScheduleCollection | undefined
    searchParams?: TaskUrlSearchParams
    isFixedTimeTask: boolean
    currentUserId: string
  }
) {
  const {
    workspaceStatuses,
    workspaceLabels,
    workspaceCustomFields,
    schedules,
    searchParams = {},
    isFixedTimeTask,
    currentUserId,
  } = options
  const {
    forStatus: forStatusParam,
    forLabel: forLabelParam,
    forPriority: forPriorityParam,
    forAssignee: forAssigneeParam,
    forCustomField: forCustomFieldParam,
  } = searchParams

  if (forPriorityParam != null && !isValidPriority(forPriorityParam)) {
    throw new Error('Priority unknown', {
      cause: { forPriorityParam },
    })
  }

  // Get status, respecting search params over defaults
  const statusId = forStatusParam ?? baseData.statusId
  const status =
    workspaceStatuses.find((s) => s.id === statusId) ??
    findDefaultStatus(workspaceStatuses)

  const isAutoScheduled =
    isFixedTimeTask ||
    ('isAutoScheduled' in baseData
      ? (baseData.isAutoScheduled as boolean)
      : status
        ? isAutoScheduledStatus(status) && !isCompletedStatus(status)
        : false)

  const labelIds =
    forLabelParam != null
      ? [forLabelParam]
      : baseData.labelIds.filter((id) =>
          workspaceLabels.find((l) => l.id === id)
        )

  const isScheduleValid =
    schedules != null ? schedules[baseData.scheduleId] != null : false

  // Handle custom fields, respecting search params over defaults
  const customFieldValuesFieldArray = workspaceCustomFields.map((field) =>
    mapCustomFieldToFieldArrayWithValue(
      field,
      forCustomFieldParam ?? baseData.customFieldValues
    )
  )

  return {
    ...baseData,
    // Search params take precedence over defaults
    assigneeUserId:
      forAssigneeParam === 'unassigned'
        ? null
        : (forAssigneeParam ??
          // If we're creating a fixed time task, always use the current user as the assignee
          (isFixedTimeTask ? currentUserId : baseData.assigneeUserId)),
    priorityLevel: (forPriorityParam ??
      baseData.priorityLevel) as PriorityLevel,
    statusId: status?.id ?? '',
    labelIds,
    scheduleId: isScheduleValid ? baseData.scheduleId : DEFAULT_SCHEDULE_ID,
    customFieldValuesFieldArray,
    isAutoScheduled,
  }
}
