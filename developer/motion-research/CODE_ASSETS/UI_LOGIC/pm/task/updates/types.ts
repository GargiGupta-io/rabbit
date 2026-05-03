import {
  type GlobalUserTaskDefaultSettingsSchema,
  type NormalTaskSchema,
  type ProjectSchema,
  type RecurringTaskSchema,
  type StatusSchema,
  type TaskSchema,
  type TasksV2NormalUpdateSchema,
  type UpdateRecurringTaskDto,
} from '@motion/rpc-types'

import { type ChangedFieldName } from './utils'

import { type AllAvailableCustomFieldSchema } from '../../custom-fields'
import { type WorkspaceMemberWithUser } from '../../members'

export type UpdatableTaskSchema = TaskSchema | RecurringTaskSchema
export type TaskUpdateFields = Omit<
  TasksV2NormalUpdateSchema,
  'type' | 'schedule' // `schedule` is deprecated and replaced with `scheduleId`
>
export type RecurringTaskUpdateFields = Omit<UpdateRecurringTaskDto, 'id'>

export interface TaskFormChangedFieldOptions {
  fieldNameBeingUpdated: Extract<
    keyof NormalTaskSchema | keyof RecurringTaskSchema,
    ChangedFieldName
  >
  currentUserId: string
  statuses: Pick<StatusSchema, 'id' | 'name' | 'type' | 'autoScheduleSetting'>[]
  projects: ProjectSchema[]
  members: WorkspaceMemberWithUser[]
  customFields: AllAvailableCustomFieldSchema[]
  globalTaskDefaults?: GlobalUserTaskDefaultSettingsSchema | null
}
