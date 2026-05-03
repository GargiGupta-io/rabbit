import {
  recurringTaskPriorityLevels,
  type TemplateTaskType,
} from '@motion/rpc-types/legacy'
import { NO_DURATION } from '@motion/shared/pm'

import { type TaskFormFields } from './form-fields'

type Options = {
  recurring: boolean
}

export function getTemplateFormData(
  template: TemplateTaskType,
  opts: Partial<Options> = {}
) {
  const options: Options = { recurring: false, ...opts }

  const templateTask = template.task
  const formData: Partial<TaskFormFields> = {}

  const templateAssigneeId = templateTask.assigneeUserId
  if (templateAssigneeId != null) {
    formData.assigneeUserId = templateAssigneeId
  }

  formData.statusId = templateTask.statusId
  formData.labelIds = templateTask.labels.map((l) => l.labelId ?? '')
  formData.duration = templateTask.duration ?? NO_DURATION
  formData.minimumDuration = templateTask.minimumDuration
  formData.name = templateTask.name
  formData.description = templateTask.description
  formData.deadlineType = templateTask.deadlineType
  formData.scheduleId = templateTask.schedule

  if (
    options.recurring &&
    !recurringTaskPriorityLevels.includes(templateTask.priorityLevel)
  ) {
    formData.priorityLevel =
      templateTask.priorityLevel === 'ASAP'
        ? 'HIGH'
        : templateTask.priorityLevel === 'LOW'
          ? 'MEDIUM'
          : templateTask.priorityLevel
  } else {
    formData.priorityLevel = templateTask.priorityLevel
  }

  return formData
}
