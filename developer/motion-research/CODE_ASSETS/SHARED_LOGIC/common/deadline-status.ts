import { DateTime } from 'luxon'

import { ScheduledStatus } from './scheduled-status'

export const DeadlineStatuses = [
  'missed-deadline',
  'scheduled-past-deadline',
  'at-risk',
  'on-track',
  'ahead-of-schedule',
  'none',
] as const
export type DeadlineStatus = (typeof DeadlineStatuses)[number]

export const DeadlineStatusNoneReason = [
  'archived',
  'canceled',
  'completed',
  'not-autoscheduled',
  'future-schedulable',
  'no-due-date',
] as const
export type DeadlineStatusNoneReason = (typeof DeadlineStatusNoneReason)[number]

export const DeadlineStatusWithReason = [
  ...DeadlineStatuses,
  ...DeadlineStatusNoneReason,
] as const
export type DeadlineStatusWithReason = (typeof DeadlineStatusWithReason)[number]

type CommonEntity = {
  completedTime: Date | null
  canceledTime?: Date | null
  dueDate: Date | null
  estimatedCompletionTime: Date | null
  startDate?: Date | null
  scheduledStatus?: string | null
}

type ProjectEntity = {
  stages: CommonEntity[]
} & CommonEntity

export const AHEAD_OF_SCHEDULE_THRESHOLD = 0.8

export const resolveStageDeadlineStatus = (
  stage: CommonEntity,
  now: Date
): DeadlineStatus => {
  if (
    stage.completedTime ||
    stage.canceledTime ||
    !stage.dueDate ||
    (!stage.scheduledStatus && !stage.estimatedCompletionTime)
  ) {
    return 'none'
  }

  const endOfDueDate = DateTime.fromJSDate(stage.dueDate)
    .endOf('day')
    .toJSDate()

  if (now > endOfDueDate) {
    return 'missed-deadline'
  }

  if (
    stage.scheduledStatus === ScheduledStatus.UNFIT_PAST_DUE ||
    stage.scheduledStatus === ScheduledStatus.PAST_DUE
  ) {
    return 'scheduled-past-deadline'
  }

  return 'on-track'
}

/*
 * This function takes an entity and returns a DeadlineStatus based on the entity's properties.
 * A related entity is some entity with a relationship to the entity in question (such as stages in a project).
 */
export const resolveProjectDeadlineStatus = (
  project: ProjectEntity,
  now: Date
): DeadlineStatus => {
  if (
    project.completedTime ||
    project.canceledTime ||
    !project.dueDate ||
    !project.scheduledStatus
  ) {
    return 'none'
  }

  // Compare with the end of the due date
  const endOfDueDate = DateTime.fromJSDate(project.dueDate)
    .endOf('day')
    .toJSDate()

  if (now > endOfDueDate) {
    return 'missed-deadline'
  }

  if (
    project.scheduledStatus === ScheduledStatus.UNFIT_PAST_DUE ||
    project.scheduledStatus === ScheduledStatus.PAST_DUE
  ) {
    return 'scheduled-past-deadline'
  }

  if (project.stages.length > 0) {
    if (
      project.stages.some((stage) => {
        const relatedDeadlineStatus = resolveStageDeadlineStatus(stage, now)

        return (
          relatedDeadlineStatus === 'missed-deadline' ||
          relatedDeadlineStatus === 'scheduled-past-deadline'
        )
      })
    ) {
      return 'at-risk'
    }
  }

  if (
    project.estimatedCompletionTime &&
    project.startDate &&
    project.startDate < now
  ) {
    // If the estimated completion time is less than 80% of the due time
    const startToDue = endOfDueDate.getTime() - project.startDate.getTime()
    const startToEstimated =
      project.estimatedCompletionTime.getTime() - project.startDate.getTime()
    if (startToEstimated <= startToDue * AHEAD_OF_SCHEDULE_THRESHOLD) {
      return 'ahead-of-schedule'
    }
  }

  return 'on-track'
}
