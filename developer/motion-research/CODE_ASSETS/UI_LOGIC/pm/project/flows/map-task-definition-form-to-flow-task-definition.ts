import { isFlowVariableKey } from '@motion/shared/flows'

import {
  type FlowTemplateFormTask,
  type TaskDefinitionFormFields,
} from './form-fields'

export function mapTaskDefinitionFormToFlowTaskDefinition(
  values: TaskDefinitionFormFields
): FlowTemplateFormTask {
  const assigneeFields = isFlowVariableKey(values.assigneeUserId)
    ? {
        assigneeUserId: null,
        assigneeVariableKey: values.assigneeUserId,
      }
    : {
        assigneeUserId: values.assigneeUserId,
        assigneeVariableKey: null,
      }

  return {
    ...assigneeFields,
    id: values.id!,
    name: values.name,
    description: values.description,
    statusId: values.statusId,
    priorityLevel: values.priorityLevel,
    duration: values.duration,
    minimumDuration: values.minimumDuration,
    labelIds: values.labelIds,
    blockedByTaskIds: values.blockedByTaskIds,
    isAutoScheduled: values.isAutoScheduled,
    customFieldValuesFieldArray: values.customFieldValuesFieldArray,
    deadlineType: values.deadlineType,
    scheduleMeetingWithinDays: values.scheduleMeetingWithinDays,
    uploadedFileIds: values.uploadedFiles.map((file) => file.id),
    startRelativeInterval: values.startRelativeInterval,
    dueRelativeInterval: values.dueRelativeInterval,
  }
}
