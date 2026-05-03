/* c8 ignore start */
import {
  type ProjectDefinitionSchema,
  type RelativeIntervalDuration,
  type StageDefinitionSchema,
  type TaskDefinitionRelativeInterval,
  type TaskDefinitionSchema,
  type VariableDefinitionSchema,
} from '@motion/rpc-types'
import { type DeadlineType } from '@motion/rpc-types/legacy'

import { type CustomFieldFieldArrayValue } from '../../custom-fields'
import { type TaskFormFields } from '../../task'

type FlowTemplateFields = Pick<
  ProjectDefinitionSchema,
  | 'workspaceId'
  | 'name'
  | 'description'
  | 'managerId'
  | 'priorityLevel'
  | 'labelIds'
  | 'color'
  | 'folderId'
  | 'definitionDescription'
  | 'stageDefinitionReferences'
>

export type FlowTemplateStage = Omit<StageDefinitionSchema, 'tasks'> & {
  tasks: FlowTemplateFormTask[]
}

export type FlowTemplateFormTask = Omit<
  TaskDefinitionSchema,
  | 'customFieldValues'
  | 'uploadedFileIds'
  | 'deadlineType'
  | 'startRelativeInterval'
  | 'dueRelativeInterval'
> & {
  customFieldValuesFieldArray: CustomFieldFieldArrayValue[]
  uploadedFileIds: string[]
  deadlineType: DeadlineType
  startRelativeInterval: TaskDefinitionFormRelativeInterval
  dueRelativeInterval: TaskDefinitionFormRelativeInterval
}

export type TaskDefinitionFormRelativeInterval = Omit<
  TaskDefinitionRelativeInterval,
  'duration'
> & {
  duration: TaskDefinitionFormRelativeIntervalDuration
}

export type TaskDefinitionFormRelativeIntervalDuration =
  RelativeIntervalDuration & {
    sign: 1 | -1
  }

export type RoleVariable = Omit<VariableDefinitionSchema, 'type'> & {
  type: 'person'
}

export type TextVariable = Omit<VariableDefinitionSchema, 'type'> & {
  type: 'text'
}

export type FlowTemplateFormFields = FlowTemplateFields & {
  id: ProjectDefinitionSchema['id'] | undefined
  stages: FlowTemplateStage[]

  // It is much easier to work with the variables in react-hook-form if we split them up
  roles: RoleVariable[]
  textVariables: TextVariable[]

  variableAbbreviations?: Map<string, string>

  // These fields are in the form as an easy way to access or read some info
  // TODO tleunen - find out if we can get rid of these within the form fields
  isLoading: boolean
  hasError: boolean

  type: 'flow-template' | 'stage'

  modalMode?: 'modal-api' | 'url'

  mode: 'ai-generation' | 'user'
}

export type StageCardType = 'task' | 'event'

export type TaskDefinitionFormFields = Omit<TaskFormFields, 'id'> & {
  id: string
  startRelativeInterval: TaskDefinitionFormRelativeInterval
  dueRelativeInterval: TaskDefinitionFormRelativeInterval
}
