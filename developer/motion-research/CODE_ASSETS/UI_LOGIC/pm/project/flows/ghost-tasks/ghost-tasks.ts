import { type TaskResponseSchema, type TaskSchema } from '@motion/zod/client'

export type GhostTaskCheckableType =
  | Pick<TaskSchema, 'id' | 'isUnvisitedStage' | 'type'>
  | Pick<TaskResponseSchema, 'id' | 'isUnvisitedStage' | 'entityType'>
  | { id: string; isUnvisitedStage?: boolean; type?: string }

export const isGhostTask = (task?: GhostTaskCheckableType) =>
  task != null && isInUnvisitedStage(task) && !isRecurringInstance(task)

const isRecurringInstance = (task: GhostTaskCheckableType) =>
  ('type' in task && task.type === 'RECURRING_INSTANCE') ||
  ('entityType' in task && task.entityType === 'recurringTask')

export const isInUnvisitedStage = (task: GhostTaskCheckableType) =>
  task.isUnvisitedStage ?? false
