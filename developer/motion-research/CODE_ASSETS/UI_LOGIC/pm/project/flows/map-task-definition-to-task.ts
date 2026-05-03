import type { NormalTaskSchema } from '@motion/rpc-types'

import { type FlowTemplateFormTask } from './form-fields'

import { createTemporaryNormalTask } from '../../task/temporary'
import { reduceCustomFieldsValuesFieldArrayToRecord } from '../updates/utils'

export function mapTaskDefinitionToTask(
  taskDef: FlowTemplateFormTask,
  workspaceId: string,
  stageDefinitionId: string | null
): NormalTaskSchema {
  const { dueDate, startDate, ...defaults } = createTemporaryNormalTask({
    assigneeUserId: taskDef.assigneeUserId ?? taskDef.assigneeVariableKey,
    createdByUserId: '',
    isAutoScheduled: taskDef.isAutoScheduled,
    statusId: taskDef.statusId,
    workspaceId,
    projectId: null,
    stageDefinitionId,
  })

  return {
    ...defaults,
    workspaceId,
    type: 'NORMAL',
    id: taskDef.id,
    name: taskDef.name,
    dueDate: null,
    deadlineType: taskDef.deadlineType ?? 'SOFT',
    startDate: null,
    statusId: taskDef.statusId,
    assigneeUserId: taskDef.assigneeUserId ?? taskDef.assigneeVariableKey,
    duration: taskDef.duration,
    minimumDuration: taskDef.minimumDuration,
    priorityLevel: taskDef.priorityLevel,
    isAutoScheduled: taskDef.isAutoScheduled,
    description: taskDef.description,
    labelIds: taskDef.labelIds,
    blockedByTaskIds: taskDef.blockedByTaskIds,
    customFieldValues: reduceCustomFieldsValuesFieldArrayToRecord(
      taskDef.customFieldValuesFieldArray
    ),
    scheduleMeetingWithinDays: taskDef.scheduleMeetingWithinDays,
  }
}
