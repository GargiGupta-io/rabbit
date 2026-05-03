import {
  type RecurringTaskSchema,
  type StatusSchema,
  type TaskSchema,
} from '@motion/rpc-types'
import {
  findDefaultStatus,
  isAutoScheduledStatus,
  isCompletedStatus,
} from '@motion/shared/common'
import { DEFAULT_DURATION, NO_CHUNK_DURATION } from '@motion/shared/pm'

import { type TaskUrlSearchParams } from './task-url-params'

import { getTaskStaticURL } from '../../static-url'

export type GetDuplicatedOrExistingTaskFieldsParams = {
  isDuplicatingTask: boolean
  task: TaskSchema | RecurringTaskSchema
  isInstance: boolean
  parentTask?: TaskSchema | RecurringTaskSchema | null
  workspaceId: string
  searchParams: TaskUrlSearchParams
  taskTitle?: string
  status: StatusSchema | undefined
  isAutoScheduledFromStatus: boolean
  workspaceStatuses: StatusSchema[]
}

type DuplicatedOrExistingTaskFields = {
  id?: string
  name: string
  description: string
  status: StatusSchema | undefined
  isAutoScheduled: boolean
  completedTime: string | null
  duration: number | null
  minimumDuration: number | null
  completedDuration: number
}

export function getDuplicatedOrExistingTaskFields({
  isDuplicatingTask,
  task,
  isInstance,
  parentTask,
  workspaceId,
  searchParams,
  taskTitle,
  status,
  isAutoScheduledFromStatus,
  workspaceStatuses,
}: GetDuplicatedOrExistingTaskFieldsParams): DuplicatedOrExistingTaskFields {
  return isDuplicatingTask
    ? getDuplicatedTaskData(task, {
        workspaceId,
        forTaskId: searchParams.forTaskId!,
        taskTitle,
        status,
        workspaceStatuses,
      })
    : {
        id: task.id,
        name: taskTitle ?? task.name ?? '',
        description:
          (isInstance ? parentTask?.description : task.description) ?? '',
        status,
        isAutoScheduled:
          'isAutoScheduled' in task
            ? task.isAutoScheduled
            : isAutoScheduledFromStatus,
        completedTime: 'completedTime' in task ? task.completedTime : null,
        duration: 'duration' in task ? task.duration : DEFAULT_DURATION,
        minimumDuration:
          'minimumDuration' in task ? task.minimumDuration : NO_CHUNK_DURATION,
        completedDuration:
          'completedDuration' in task ? task.completedDuration : 0,
      }
}

type GetDuplicatedTaskDataOptions = {
  workspaceId: string
  forTaskId: string
  taskTitle?: string
  status: StatusSchema | undefined
  workspaceStatuses: StatusSchema[]
}

type DuplicatedTaskData = {
  name: string
  description: string
  status: StatusSchema | undefined
  isAutoScheduled: boolean
  completedTime: string | null
  completedDuration: number
  duration: number | null
  minimumDuration: number | null
}

export function getDuplicatedTaskData(
  task: TaskSchema | RecurringTaskSchema,
  options: GetDuplicatedTaskDataOptions
): DuplicatedTaskData {
  const {
    workspaceId,
    forTaskId,
    taskTitle,
    status: originalStatus,
    workspaceStatuses,
  } = options

  let status: StatusSchema | undefined = originalStatus
  let isAutoScheduled = task.isAutoScheduled
  let completedTime = 'completedTime' in task ? task.completedTime : null
  const duration = 'duration' in task ? task.duration : DEFAULT_DURATION
  const minimumDuration =
    'minimumDuration' in task ? task.minimumDuration : NO_CHUNK_DURATION
  let completedDuration =
    'completedDuration' in task ? task.completedDuration : 0

  // Reset completed status for duplicated tasks
  if (status && isCompletedStatus(status)) {
    status = findDefaultStatus(workspaceStatuses)
    isAutoScheduled = status ? isAutoScheduledStatus(status) : false
    completedDuration = 0
    completedTime = null
  }

  let name = taskTitle ?? task.name ?? ''
  if (!taskTitle) {
    name = `${name} (duplicate)`
  }

  const duplicatedFromTaskUrl = getTaskStaticURL({
    workspaceId,
    taskId: forTaskId,
  })
  const description = `${
    task.description ?? ''
  }<p>Duplicated from: <a href="${duplicatedFromTaskUrl}" target="_blank">${
    task.name
  }</a></p>`

  return {
    name,
    description,
    status,
    isAutoScheduled,
    completedTime,
    duration,
    minimumDuration,
    completedDuration,
  }
}
