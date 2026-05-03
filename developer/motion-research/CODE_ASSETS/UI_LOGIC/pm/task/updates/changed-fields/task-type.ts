import { type RecurringTaskSchema } from '@motion/rpc-types'
import { recurringTaskPriorityLevels } from '@motion/rpc-types/legacy'
import { DEFAULT_DURATION, NO_DURATION } from '@motion/shared/pm'

import { isUserNotOnboarded } from '../../../members'
import { shouldWarnIfPastDueForRecurringFrequency } from '../../../task-utils'
import { CUSTOM_SCHEDULE_ID, DEFAULT_SCHEDULE_ID } from '../../fields'
import { getTaskInitialStartDate } from '../../form'
import {
  type RecurringTaskUpdateFields,
  type TaskFormChangedFieldOptions,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

export function getTaskTypeChangedFields(
  task: UpdatableTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'currentUserId' | 'members'>
): TaskUpdateFields
export function getTaskTypeChangedFields(
  task: RecurringTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'currentUserId' | 'members'>
): RecurringTaskUpdateFields
export function getTaskTypeChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'currentUserId' | 'members'>
): TaskUpdateFields | RecurringTaskUpdateFields {
  const { currentUserId, members } = options

  const updates: TaskUpdateFields & RecurringTaskUpdateFields = {}

  if (task.type === 'RECURRING_TASK') {
    // Recurring tasks require a start date
    if (!task.startingOn) {
      updates.startingOn = getTaskInitialStartDate()
    }

    const assignedMember = members.find(
      (member) => member.userId === task.assigneeUserId
    )

    // Recurring tasks require an assignee
    if (
      !task.assigneeUserId ||
      (assignedMember && isUserNotOnboarded(assignedMember.user))
    ) {
      updates.assigneeUserId = currentUserId
    }

    if (task.duration === NO_DURATION) {
      updates.duration = DEFAULT_DURATION
    }

    // Reset the priority to medium if the task doesn't have a valid one
    if (!recurringTaskPriorityLevels.includes(task.priorityLevel)) {
      updates.priorityLevel = 'MEDIUM'
    }

    // Recurring tasks cannot have projects
    // When updating from normal tasks, they might have one
    updates.projectId = null

    const warnIfPastDue = shouldWarnIfPastDueForRecurringFrequency(
      task.frequency
    )
    if (!warnIfPastDue) {
      updates.ignoreWarnOnPastDue = !warnIfPastDue
    }
  }

  if (task.type !== 'RECURRING_TASK') {
    if (task.scheduleId === CUSTOM_SCHEDULE_ID) {
      updates.scheduleId = DEFAULT_SCHEDULE_ID
    }
  }

  return updates
}
