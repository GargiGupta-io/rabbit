import { type TaskSchema } from '@motion/rpc-types'
import {
  byProperty,
  byValue,
  cascade,
  Compare,
  ordered,
} from '@motion/utils/array'
import { PriorityLevelSchema } from '@motion/zod/client'

export const sortByCreatedTime = byValue<
  Pick<TaskSchema, 'createdTime'>,
  string | null
>((task) => {
  return task.createdTime
}, Compare.string)

export const sortByEstimatedCompletionTime = byValue<TaskSchema, string | null>(
  (task) => {
    if (!('estimatedCompletionTime' in task) || !task.estimatedCompletionTime)
      return null
    return task.estimatedCompletionTime
  },
  Compare.string.with({ null: 'at-end', empty: 'at-end' })
)

export const sortByScheduledEnd = byValue<
  Pick<TaskSchema, 'scheduledEnd'>,
  string | null
>(
  (task) => {
    return task.scheduledEnd
  },
  Compare.string.with({ null: 'at-end', empty: 'at-end' })
)

export const sortByDueDate = byValue<
  Pick<TaskSchema, 'priorityLevel' | 'dueDate'>,
  string | null
>(
  (task) => {
    if (task.priorityLevel === 'ASAP') return 'ASAP'
    return task.dueDate
  },
  ordered<string | null>(
    ['ASAP'],
    Compare.string.with({ null: 'at-end', empty: 'at-end' })
  )
)

export const sortByStartDate = byValue<
  Pick<TaskSchema, 'priorityLevel' | 'startDate'>,
  string | null
>(
  (task) => {
    if (task.priorityLevel === 'ASAP') return 'ASAP'
    return task.startDate
  },
  ordered<string | null>(
    ['ASAP'],
    Compare.string.with({ null: 'at-end', empty: 'at-end' })
  )
)

export const sortByPriority = byProperty<
  Pick<TaskSchema, 'priorityLevel'>,
  'priorityLevel'
>('priorityLevel', ordered(PriorityLevelSchema))

export const defaultTaskSortFn = cascade<TaskSchema>(
  sortByCreatedTime,
  sortByEstimatedCompletionTime
)
