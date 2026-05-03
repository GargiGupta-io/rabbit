import { templateStr } from '@motion/react-core/strings'
import { type ProjectSchema, type StatusSchema } from '@motion/rpc-types'
import {
  type DeadlineStatus,
  type DeadlineStatusWithReason,
  isCanceledStatus,
  isCompletedStatus,
} from '@motion/shared/common'
import { groupByKey } from '@motion/utils/array'
import {
  daysBetweenDates,
  formatToReadableWeekDayMonth,
} from '@motion/utils/dates'

import { DateTime } from 'luxon'

import {
  getEtaLabel,
  numDaysAndHoursBetweenDates,
  type PluralizeFunction,
} from './general'
import {
  getAheadOfScheduleTooltip,
  getMissedDeadlineTooltip,
  getOnTrackTooltip,
  getScheduledPastDeadlineTooltip,
  type MaybeTooltipReturnObject,
} from './tooltip'

// We allow null here because in the project modal we have a null check for the project
export const normalizeProjectDeadlineStatus = (
  project: ProjectSchema | null
): DeadlineStatus => {
  return project && project.deadlineStatus ? project.deadlineStatus : 'none'
}

export const getProjectEtaTitle = (
  project: ProjectSchema,
  pluralize: PluralizeFunction
) => {
  const deadlineStatus = normalizeProjectDeadlineStatus(project)
  const label = getEtaLabel(deadlineStatus, 'project', project.scheduledStatus)

  if (deadlineStatus === 'ahead-of-schedule') {
    // Append the number of days ahead of schedule
    const scheduledDate =
      project.type === 'NORMAL' && project.estimatedCompletionTime
        ? project.estimatedCompletionTime
        : null

    const daysDiff =
      project.dueDate && scheduledDate
        ? daysBetweenDates(
            DateTime.fromISO(project.dueDate),
            DateTime.fromISO(scheduledDate)
          )
        : 0

    return templateStr('{{label}} {{daysModifier}}', {
      label,
      daysModifier:
        daysDiff > 0
          ? pluralize(daysDiff, 'by 1 day', `by ${daysDiff} days`)
          : '',
    })
  }

  return label
}

export const getProjectEtaReason = (
  project: ProjectSchema,
  pluralize: PluralizeFunction,
  autoScheduleRange: number
) => {
  const deadlineStatus = normalizeProjectDeadlineStatus(project)

  const scheduledDate =
    project.type === 'NORMAL' && project.estimatedCompletionTime
      ? project.estimatedCompletionTime
      : null

  const dateDue = formatToReadableWeekDayMonth(project.dueDate ?? '')

  const { numDaysMissed, numHoursMissed } = numDaysAndHoursBetweenDates(
    project.dueDate,
    scheduledDate
  )

  switch (deadlineStatus) {
    case 'missed-deadline':
      return project.dueDate
        ? templateStr('Due {{dateDue}} ({{daysAgo}})', {
            dateDue,
            daysAgo: DateTime.fromISO(project.dueDate).toRelative(),
          })
        : ''
    case 'scheduled-past-deadline': {
      if (project.scheduledStatus === 'UNFIT_PAST_DUE') {
        return `This is because one or more tasks can't fit within Motion's ${autoScheduleRange} day auto-schedule window`
      }

      const shouldShowHours = numDaysMissed === 0 && numHoursMissed > 0

      return templateStr(
        'Due {{dateDue}}. Scheduled {{numMissed}} {{pluralizedText}} after',
        {
          dateDue,
          numMissed: shouldShowHours ? numHoursMissed : numDaysMissed,
          pluralizedText: shouldShowHours
            ? pluralize(numHoursMissed, 'hour', 'hours')
            : pluralize(numDaysMissed, 'day', 'days'),
        }
      )
    }

    case 'on-track':
      return scheduledDate
        ? templateStr('Due {{dateDue}} {{scheduledText}}', {
            dateDue,
            scheduledText:
              numDaysMissed > 0
                ? templateStr(
                    '({{numDaysMissed}} {{pluralizedText}} after scheduled date)',
                    {
                      numDaysMissed,
                      pluralizedText: pluralize(numDaysMissed, 'day', 'days'),
                    }
                  )
                : '(Scheduled on due date)',
          })
        : ''
    case 'ahead-of-schedule':
      return scheduledDate
        ? templateStr(
            'Due {{dateDue}} (estimated to be completed {{dayScheduled}})',
            {
              dateDue,
              dayScheduled: formatToReadableWeekDayMonth(scheduledDate),
            }
          )
        : ''
    default:
      return ''
  }
}

export const getExtendedProjectDeadlineStatus = (
  project: ProjectSchema | null,
  workspaceStatuses: StatusSchema[] = []
): DeadlineStatusWithReason => {
  if (project === null) return 'none'
  const normalizedProjectDeadlineStatus =
    normalizeProjectDeadlineStatus(project)

  if (normalizedProjectDeadlineStatus !== 'none')
    return normalizedProjectDeadlineStatus

  const workspacesMap = groupByKey(workspaceStatuses, 'id')
  const projectStatus = workspacesMap[project.statusId]?.[0] ?? null
  if (!projectStatus) return 'none'

  if (isCompletedStatus(projectStatus)) return 'completed'
  if (isCanceledStatus(projectStatus)) return 'canceled'

  return 'none'
}

export const getProjectNoEtaReason = (
  project: ProjectSchema,
  workspaceStatuses: StatusSchema[] = []
) => {
  const projectDeadlineStatus = getExtendedProjectDeadlineStatus(
    project,
    workspaceStatuses
  )

  if (
    projectDeadlineStatus !== 'none' &&
    projectDeadlineStatus !== 'canceled' &&
    projectDeadlineStatus !== 'completed'
  )
    return null

  if (projectDeadlineStatus === 'completed') {
    return 'Project complete'
  } else if (projectDeadlineStatus === 'canceled') {
    return 'Project canceled'
  } else if (!project.scheduledStatus) {
    return 'No ETA because there are no auto-scheduled tasks in this project'
  }

  return 'No ETA'
}

/*
  Given a project, return the tooltip title, action, and ETA text
*/
export const getProjectEtaTooltip = (
  project: ProjectSchema,
  workspaceStatuses: StatusSchema[] = [],
  pluralize: PluralizeFunction,
  autoScheduleRange: number
): MaybeTooltipReturnObject => {
  const deadlineStatus = normalizeProjectDeadlineStatus(project)

  if (deadlineStatus === 'none') {
    return {
      title: getProjectNoEtaReason(project, workspaceStatuses) ?? '',
      action: undefined,
      etaText: undefined,
    }
  } else if (deadlineStatus === 'missed-deadline') {
    return getMissedDeadlineTooltip(
      project.dueDate,
      project.estimatedCompletionTime,
      pluralize
    )
  } else if (deadlineStatus === 'scheduled-past-deadline') {
    if (project.scheduledStatus === 'UNFIT_PAST_DUE') {
      return {
        title: "Project ETA can't be estimated",
        action: `This is because one or more tasks can't fit within Motion's ${autoScheduleRange} day auto-schedule window`,
        etaText: "Click to see the tasks that can't fit",
      }
    }

    return getScheduledPastDeadlineTooltip(
      project.dueDate,
      project.estimatedCompletionTime,
      pluralize
    )
  } else if (deadlineStatus === 'on-track') {
    return getOnTrackTooltip(
      project.dueDate,
      project.estimatedCompletionTime,
      pluralize
    )
  } else if (deadlineStatus === 'ahead-of-schedule') {
    return getAheadOfScheduleTooltip(
      project.dueDate,
      project.estimatedCompletionTime,
      pluralize
    )
  }
}
