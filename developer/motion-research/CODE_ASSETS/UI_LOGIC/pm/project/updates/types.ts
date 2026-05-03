import {
  type ProjectSchema,
  type ProjectsV2UpdateRequestSchema,
  type StatusSchema,
  type WorkspaceMemberSchema,
} from '@motion/rpc-types'

import { type ProjectChangedFieldName } from './utils'

import { type AllAvailableCustomFieldSchema } from '../../custom-fields'

export type UpdatableProjectSchema = Omit<ProjectSchema, 'variableInstances'>
export type ProjectUpdateFields = ProjectsV2UpdateRequestSchema

export interface ProjectFormChangedFieldOptions {
  fieldNameBeingUpdated: Extract<keyof ProjectSchema, ProjectChangedFieldName>
  statuses: StatusSchema[]
  members: WorkspaceMemberSchema[]
  customFields: AllAvailableCustomFieldSchema[]
}
