import { isAutoScheduledStatus, isCompletedStatus } from '@motion/shared/common'
import { SHORT_TASK_DURATION } from '@motion/shared/pm'
import {
  type NormalTaskSchema,
  type StatusSchema,
  type TaskType,
} from '@motion/zod/client'

type TaskAutoScheduleArgs = Pick<NormalTaskSchema, 'isAutoScheduled'> &
  Partial<
    Pick<NormalTaskSchema, 'completedTime' | 'duration' | 'completedDuration'>
  > & {
    type?: TaskType
    status?: Pick<StatusSchema, 'autoScheduleSetting' | 'type'>
  }

export const isAutoScheduledToggleEnabled = ({
  type,
  completedTime,
  status,
  isAutoScheduled,
  completedDuration,
  duration,
}: TaskAutoScheduleArgs): {
  disabled: boolean
  tooltipText?: string
} => {
  if (!(status && isAutoScheduledStatus(status)) && !isAutoScheduled) {
    return {
      disabled: true,
      tooltipText: 'Auto-schedule for this status is disabled in Settings',
    }
  }

  if (type === 'RECURRING_INSTANCE') {
    return {
      disabled: true,
      tooltipText:
        'Edit the parent to toggle auto-scheduling for all instances',
    }
  }

  if (!!completedTime || (status && isCompletedStatus(status))) {
    return {
      disabled: true,
      tooltipText: "Completed tasks can't be auto-scheduled",
    }
  }

  if (
    completedDuration != null &&
    duration != null &&
    duration > SHORT_TASK_DURATION &&
    completedDuration >= duration
  ) {
    return {
      disabled: true,
      tooltipText:
        "Tasks with completed duration equal to their total duration can't be auto-scheduled",
    }
  }

  return { disabled: false }
}
