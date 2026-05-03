import {
  type RecurringTaskFrequencySchema,
  type RecurringTaskSchema,
  type TaskSchema,
  type TaskType as V2TaskType,
} from '@motion/rpc-types'
import {
  type Frequency,
  PMItemType,
  type PMTaskType,
  type RecurringTask,
} from '@motion/rpc-types/legacy'
import { byProperty, Compare } from '@motion/utils/array'

import { useMemo } from 'react'

// import specificity needed to break circular dependency

export function isRecurringTaskParent(
  task?: PMTaskType | RecurringTask
): task is RecurringTask
export function isRecurringTaskParent(task?: {
  type: V2TaskType
}): task is RecurringTaskSchema
export function isRecurringTaskParent(
  task?: TaskSchema | RecurringTaskSchema
): task is RecurringTaskSchema
export function isRecurringTaskParent(
  task?: PMTaskType | RecurringTask | TaskSchema | RecurringTaskSchema
): task is RecurringTask | RecurringTaskSchema
export function isRecurringTaskParent(
  task?:
    | PMTaskType
    | RecurringTask
    | TaskSchema
    | RecurringTaskSchema
    | { type: V2TaskType }
): task is RecurringTask | RecurringTaskSchema {
  // legacy types
  if (task && 'itemType' in task) {
    return task?.itemType === PMItemType.recurringTask
  }

  return task?.type === 'RECURRING_TASK'
}

export function shouldWarnIfPastDueForRecurringFrequency(
  recurrence?: Frequency | RecurringTaskFrequencySchema | null
) {
  const frequency = recurrence?.toLowerCase()

  if (frequency === 'daily' || frequency === 'weekly') {
    return false
  }

  return true
}

export function useChunkInfo(
  task?: Pick<PMTaskType, 'id'>,
  parentChunkTask?: Pick<PMTaskType, 'chunks'>
) {
  const chunks = useMemo<PMTaskType[]>(() => {
    if (!parentChunkTask?.chunks) return []
    return [...parentChunkTask.chunks].sort(
      byProperty('scheduledStart', Compare.caseSensitive)
    )
  }, [parentChunkTask?.chunks])
  const chunkIndex = useMemo<number>(
    () => chunks.findIndex((t) => t.id === task?.id),
    [chunks, task?.id]
  )
  const chunkTotal = useMemo<number>(() => chunks.length, [chunks])
  return {
    chunkNumber: chunkIndex + 1,
    chunkTotal,
    chunks,
  }
}

export const getScheduledChunkIds = (task: Pick<PMTaskType, 'chunks'>) =>
  task.chunks
    ?.filter((c) => c.scheduledStart)
    .sort(byProperty('scheduledStart', Compare.caseInsensitive))
    .map((c) => c.id)
