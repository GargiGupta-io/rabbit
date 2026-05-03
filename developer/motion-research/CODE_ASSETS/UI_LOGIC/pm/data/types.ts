import { type CustomFieldSchema } from '@motion/shared/custom-fields'
import {
  type DeadlineStatusSchema,
  type LabelSchema,
  type PriorityLevelSchema,
  type ProjectSchema,
  type StatusSchema,
  type UserInfoSchema,
  type WorkspaceSchema,
} from '@motion/zod/client'

export type EntityCache<T> = {
  all(): readonly T[]
  byId(id: string): T | undefined
}

export interface AppDataContext {
  loaded: boolean
  workspaces: EntityCache<WorkspaceSchema>
  projects: EntityCache<ProjectSchema>
  statuses: EntityCache<StatusSchema>
  users: EntityCache<UserInfoSchema>
  labels: EntityCache<LabelSchema>
  customFields: EntityCache<CustomFieldSchema>
  priorities: EntityCache<PriorityLevelSchema>
  deadlineStatuses: EntityCache<DeadlineStatusSchema>
}
