import { VariableType } from './variables'

import { COLOR, DeadlineType, PriorityLevel } from '../common'
import { CustomFieldValuesSchema } from '../custom-fields'

// Using arrays here so that we can reuse these values in zod schemas.

export const RelativeIntervalReferenceTypes = [
  'STAGE_START',
  'STAGE_DUE',
  'MEETING_TASK',
] as const

export type RelativeIntervalReferenceType =
  (typeof RelativeIntervalReferenceTypes)[number]

export const RelativeIntervalUnits = [
  'DAYS',
  'BUSINESS_DAYS',
  'WEEKS',
  'MONTHS',
] as const

export type RelativeIntervalUnit = (typeof RelativeIntervalUnits)[number]

export type RelativeIntervalDuration = {
  unit: RelativeIntervalUnit
  value: number
}

export type TaskDefinitionRelativeInterval = {
  referenceType: RelativeIntervalReferenceType
  referenceId?: string | null
  duration: RelativeIntervalDuration
}

export function getDefaultRelativeInterval(
  referenceType: 'STAGE_START' | 'STAGE_DUE',
  duration: RelativeIntervalDuration = {
    unit: 'DAYS' as const,
    value: 0,
  }
): TaskDefinitionRelativeInterval {
  return {
    referenceType,
    referenceId: null,
    duration,
  }
}

export type TaskDefinition = {
  id: string
  name: string
  statusId: string
  assigneeUserId: string | null
  assigneeVariableKey: string | null
  duration: number | null
  minimumDuration: number | null
  priorityLevel: PriorityLevel
  isAutoScheduled: boolean
  blockedByTaskIds: string[]
  description: string
  labelIds: string[]
  customFieldValues?: Record<string, CustomFieldValuesSchema>
  scheduleMeetingWithinDays: number | null
  deadlineType?: DeadlineType
  uploadedFileIds?: string[]
  startRelativeInterval: TaskDefinitionRelativeInterval
  dueRelativeInterval: TaskDefinitionRelativeInterval
}

export type StageDefinition = {
  id: string
  name: string
  color: COLOR
  duration: RelativeIntervalDuration
  tasks: TaskDefinition[]
  workspaceId: string
  variables: VariableDefinition[]
}

export type VariableDefinition = {
  id: string
  name: string
  key: string
  type: VariableType
  color: COLOR
  used?: boolean
}

export type ProjectDefinitionStageDefinition = {
  id: string
  rank: string
  stageDefinitionId: string
  projectDefinitionId: string
}

export type ProjectDefinition = {
  id: string
  workspaceId: string
  name: string
  color: COLOR
  description: string
  definitionDescription?: string
  createdByUserId: string
  managerId: string | null
  priorityLevel: PriorityLevel
  labelIds: string[]
  stageDefinitionReferences: ProjectDefinitionStageDefinition[]
  stages: StageDefinition[]
  variables: VariableDefinition[]
  uploadedFileIds?: string[]
  customFieldValues?: Record<string, CustomFieldValuesSchema>
  folderId?: string | null
}

export type UpsertTaskDefinition = Omit<
  TaskDefinition,
  | 'id'
  | 'scheduleMeetingWithinDays'
  | 'startRelativeInterval'
  | 'dueRelativeInterval'
  | 'used'
  // TODO: Remove when FE is always sending a blocked by array.
  | 'blockedByTaskIds'
> & {
  id?: string
  scheduleMeetingWithinDays?: number | null
  startRelativeInterval?: TaskDefinition['startRelativeInterval']
  dueRelativeInterval?: TaskDefinition['dueRelativeInterval']
  // TODO: Remove when FE is always sending a blocked by array.
  blockedByTaskIds?: TaskDefinition['blockedByTaskIds']
}

// TODO(flows-m5) remove when no longer used
export type UpsertStageDefinition = Omit<
  StageDefinition,
  'id' | 'tasks' | 'variables' | 'workspaceId'
> & {
  id?: string
  tasks: UpsertTaskDefinition[]
  variables?: UpsertVariableDefinition[]
}

export type CreateStageDefinition = Omit<
  StageDefinition,
  'id' | 'tasks' | 'variables' | 'rank'
> & {
  tasks: UpsertTaskDefinition[]
  variables?: UpsertVariableDefinition[]
}

export type UpdateStageDefinition = CreateStageDefinition & { id: string }

export type UpsertProjectDefinitionStageDefinition = {
  id?: string
  stageDefinitionId: string
}

export type UpsertVariableDefinition = Omit<VariableDefinition, 'id'> & {
  id?: string
}

export type CreateProjectDefinition = {
  workspaceId: string
  name: string
  definitionDescription?: string
  description: string
  color?: COLOR
  managerId: string | null
  priorityLevel: PriorityLevel
  labelIds: string[]
  stageDefinitionReferences?: UpsertProjectDefinitionStageDefinition[]
  // TODO(flows-m5) remove
  stages: UpsertStageDefinition[]
  variables: UpsertVariableDefinition[]
  customFieldValues?: Record<string, CustomFieldValuesSchema>
  uploadedFileIds?: string[]
  folderId?: string | null
}

export type UpdateProjectDefinition = CreateProjectDefinition & { id: string }

export const ReconciliationStatus = {
  PENDING: 'PENDING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const

export type ReconciliationStatus =
  (typeof ReconciliationStatus)[keyof typeof ReconciliationStatus]
