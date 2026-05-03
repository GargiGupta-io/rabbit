import {
  formatDateTime,
  formatToReadableWeekDayMonth,
} from '@motion/utils/dates'
import { type RecurringTaskSchema, type TaskSchema } from '@motion/zod/client'

import { getScheduledDate } from './task'
import {
  calculateScheduledType,
  type ScheduledType,
} from './task-scheduled-end'
import { isRecurringTaskParent } from './task-utils'

export const getAutoscheduleInfo = (
  task: TaskSchema | RecurringTaskSchema | undefined,
  isAutoScheduled: boolean,
  isCompleted: boolean
) => {
  const scheduledDate = getScheduledDate(task)
  const formattedScheduledDate = scheduledDate
    ? formatToReadableWeekDayMonth(scheduledDate)
    : 'None'
  const formattedScheduledDateTime = scheduledDate
    ? formatDateTime(scheduledDate)
    : 'None'

  if (isRecurringTaskParent(task)) {
    return {
      formattedScheduledDate,
      formattedScheduledDateTime,
      type: (isAutoScheduled
        ? 'recurringScheduled'
        : 'notScheduled') as ScheduledType,
      labelVariant: isAutoScheduled ? ('on' as const) : ('off' as const),
    }
  }

  const scheduledType = calculateScheduledType(task, {
    isAutoScheduled,
    isCompleted,
    scheduledDate,
  })

  let labelVariant: 'on' | 'off' | 'error' = 'off'
  if (['pastDue', 'unfit'].includes(scheduledType)) {
    labelVariant = 'error'
  } else if (['beforeDue', 'pending', 'asap'].includes(scheduledType)) {
    labelVariant = 'on'
  }

  return {
    formattedScheduledDate,
    formattedScheduledDateTime,
    type: scheduledType,
    labelVariant,
  }
}

// Mostly taken from motion-extension/src/components/ProjectManagement/components/Common/PMTaskScheduledEnd/PMTaskScheduledEnd.tsx
export type ScheduleInfo = {
  type: ScheduledType
  text: string
  shortText: string
  bgClassName?: string
  tooltip?: string
}

export const scheduleTypeToInfo = {
  completed: {
    type: 'completed',
    text: '',
    shortText: 'Done',
  },
  notScheduled: {
    type: 'notScheduled',
    text: '',
    shortText: 'None',
  },
  recurringScheduled: {
    type: 'recurringScheduled',
    text: '',
    shortText: '',
  },
  pending: {
    type: 'pending',
    text: '(Pending)',
    shortText: 'Pending',
    tooltip: "This task hasn't been scheduled yet",
  },
  asap: {
    type: 'asap',
    text: 'on {{ date }}',
    shortText: '{{ date }}',
    tooltip: 'This task has no deadline. Should be done ASAP.',
  },
  pastDue: {
    type: 'pastDue',
    text: 'on {{ date }}',
    shortText: '{{ date }}',
    bgClassName: 'bg-semantic-error-bg-disabled',
    tooltip:
      'This task will not meet deadline ({{ deadline }}). It is auto-scheduled to be completed on {{ datetime }}.',
  },
  beforeDue: {
    type: 'beforeDue',
    text: 'on {{ date }}',
    shortText: '{{ date }}',
    bgClassName: 'bg-semantic-purple-bg-disabled',
    tooltip:
      'This task will meet deadline. It is auto-scheduled to be completed on {{ date }}.',
  },
  reminder: {
    type: 'reminder',
    text: 'on {{ date }}',
    shortText: '{{ date }}',
    tooltip:
      'This task is a short task/reminder. It is set to be completed on {{ date }}.',
  },
  stale: {
    type: 'stale',
    text: '(Stale)',
    shortText: 'Stale',
    tooltip:
      'This task is stale and not being autoscheduled. To fix it, please change the deadline of the task and re-save it',
  },
  unfit: {
    type: 'unfit',
    text: '(Could not fit)',
    shortText: `Can't fit`,
    bgClassName: 'bg-semantic-error-bg-disabled',
    tooltip: 'Could not fit task',
  },
  unfitInstance: {
    type: 'unfitInstance',
    text: '(Could not fit)',
    shortText: `Can't fit`,
    bgClassName: 'bg-semantic-error-bg-disabled',
    tooltip:
      'This recurring instance does not fit before the next instance is eligible to be scheduled',
  },
  unfitPastDue: {
    type: 'unfitPastDue',
    text: '(Could not fit)',
    shortText: "Can't fit",
    tooltip:
      'This task does not fit within the next {{ autoScheduleRange }} days and will not meet deadline.',
  },
  unfitSchedulable: {
    type: 'unfitSchedulable',
    text: '(To be scheduled)',
    shortText: 'Future',
    tooltip:
      'Motion only schedules tasks for the next {{ autoScheduleRange }} days. Once this task can be fit within the next {{ autoScheduleRange }} day period, it will be auto-scheduled.',
  },
} as const satisfies Record<ScheduledType, ScheduleInfo>

export const scheduleTypeToStandAloneTemplateStr: Record<
  ScheduledType,
  string
> = {
  completed: 'Completed on: {{date}}',
  notScheduled: 'Not scheduled',
  recurringScheduled: 'Scheduled',
  pending: 'Pending',
  asap: 'Scheduled on: {{date}}',
  pastDue: 'Scheduled on: {{date}}',
  beforeDue: 'Scheduled on: {{date}}',
  reminder: 'Scheduled on: {{date}}',
  stale: 'Stale',
  unfit: 'Could not fit',
  unfitInstance: 'Could not fit',
  unfitPastDue: 'Could not fit',
  unfitSchedulable: 'To be scheduled',
}

export const StageAutoScheduleTooltipContent = {
  autoScheduled:
    'Turn off auto-scheduling for all assigned tasks in this stage that have an auto-schedule enabled status',
  notAutoScheduled:
    'Turn on auto-scheduling for all assigned tasks in this stage that have an auto-schedule enabled status',
} as const

export const ProjectAutoScheduleTooltipContent = {
  autoScheduled:
    'Turn off auto-scheduling for all assigned tasks in this project that have an auto-schedule enabled status',
  notAutoScheduled:
    'Turn on auto-scheduling for all assigned tasks in this project that have an auto-schedule enabled status',
} as const

export const StageOrProjectAutoScheduleDisabledMessage =
  'Cannot autoschedule tasks because all tasks are Unassigned or in an auto-schedule disabled status'

export const StageAutoScheduleDisabledMessage =
  'Cannot autoschedule tasks because all tasks are Unassigned'
