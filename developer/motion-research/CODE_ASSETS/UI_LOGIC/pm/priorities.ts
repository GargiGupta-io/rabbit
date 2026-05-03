import {
  type RecurringTaskSchema,
  type TaskSchema,
  type TaskType,
} from '@motion/rpc-types'
import {
  priorityLevels,
  type PriorityLevelType,
  recurringTaskPriorityLevels,
} from '@motion/rpc-types/legacy'

import { isRecurringTaskParent } from './task-utils'

export const priorityLabels = new Map<PriorityLevelType, string>([
  ['ASAP', 'ASAP'],
  ['HIGH', 'High'],
  ['MEDIUM', 'Medium'],
  ['LOW', 'Low'],
])

export function getPrioritiesForTask(
  task: TaskSchema | RecurringTaskSchema | { type: TaskType }
) {
  if (isRecurringTaskParent(task)) {
    return recurringTaskPriorityLevels
  }

  return priorityLevels
}

export function isValidPriority(priority: any): priority is PriorityLevelType {
  return priorityLabels.has(priority)
}
