/* c8 ignore start */

import {
  type NormalTaskSchema,
  type ProjectDefinitionSchema,
  type ProjectSchema,
  type UpsertStageSchema,
} from '@motion/rpc-types'
import {
  type TasksV2CreateSchema,
  type TasksV2UpdateSchema,
} from '@motion/zod/client'

import { type CustomFieldFieldArrayValue } from '../custom-fields'

type ProjectFields = Pick<
  ProjectSchema,
  | 'workspaceId'
  | 'statusId'
  | 'startDate'
  | 'dueDate'
  | 'name'
  | 'description'
  | 'labelIds'
  | 'managerId'
  | 'priorityLevel'
  | 'color'
  | 'projectDefinitionId'
  | 'activeStageDefinitionId'
  | 'folderId'
>

export type ProjectFormFields = ProjectFields & {
  id: ProjectSchema['id'] | undefined
  customFieldValuesFieldArray: CustomFieldFieldArrayValue[]

  // These fields are in the form as an easy way to access or read some info
  // TODO tleunen - find out if we can get rid of these within the form fields
  isLoading: boolean
  hasError: boolean
}

type SetupProjectFields = Pick<
  ProjectSchema,
  'workspaceId' | 'name' | 'projectDefinitionId'
> & { projectId?: ProjectSchema['id'] }

export type SetupProjectFormFields = SetupProjectFields & {
  startDate: string
  dueDate: string
  projectDefinition: ProjectDefinitionSchema | null
  stageDueDates: StageArg[]
  roleAssignees: VariableArg[]
  textReplacements: VariableArg[]
  customFieldValuesFieldArray: CustomFieldFieldArrayValue[]
  customFieldSyncInstanceIds: string[]
}

export type V2SetupProjectFormFields = {
  workspaceId: string
  projectDefinition: ProjectDefinitionSchema
  name: string
  description: string
  uploadedFileIds: string[]

  startDate: string
  dueDate: string

  roleAssignees: VariableArg[]
  textReplacements: VariableArg[]

  initialTextVariables: InitialVariableArg[]
  initialPersonVariables: InitialVariableArg[]

  initialStages: UpsertStageSchema[]

  customFieldValuesFieldArray: CustomFieldFieldArrayValue[]
  customFieldSyncInstanceIds: string[]

  step: 'name' | 'roles' | 'textVariables' | 'customFields' | 'stages'

  speculativeProject?: ProjectSchema
  speculativeTasksByStageDefinitionId?: Record<string, NormalTaskSchema[]>
  modifications?: Record<
    string,
    (TasksV2UpdateSchema | TasksV2CreateSchema) & { reason?: string }
  >

  prompt?: string
  nameReason?: string
  mode: 'manual' | 'ai'
}

export type StageArg = {
  stageDefinitionId: string
  dueDate: string
  skipped?: boolean
  canceledTime?: string | null
}

export type VariableArg = {
  variableId: string
  value: string | null
  stageId?: string
  hasInitialValue?: boolean
}

export type InitialVariableArg = {
  name: string
  value: string | null
  reason: string
}
