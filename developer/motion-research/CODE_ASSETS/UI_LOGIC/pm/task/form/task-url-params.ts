import { type CustomFieldValuesRecord } from '@motion/rpc-types/legacy'

const forTaskUrlSearchParams = [
  'forWorkspace',
  'forProject',
  'forAssignee',
  'forStatus',
  'forPriority',
  'forLabel',
  'forTaskId',
  'forStartDate',
  'forDueDate',
  'forStage',
  'forCustomField',
  'forInboxItem',
  'forCommentId',
] as const

// forXYZ are the params used to open the task modal with specific values
export const taskUrlSearchParams = [
  'task', // It's the main param to spawn the modal. Either in create or edit mode ('new' or task id).
  ...forTaskUrlSearchParams,
] as const

export type TaskUrlSearchParams = {
  [K in Exclude<
    (typeof taskUrlSearchParams)[number],
    'forCustomField'
  >]?: string
} & {
  forCustomField?: CustomFieldValuesRecord
}

export type TaskUrlParams = {
  workspaceId?: string
  projectId?: string
}

export const clearTaskForParams = (searchParams: URLSearchParams) => {
  forTaskUrlSearchParams.forEach((param) => searchParams.delete(param))
  return searchParams
}
