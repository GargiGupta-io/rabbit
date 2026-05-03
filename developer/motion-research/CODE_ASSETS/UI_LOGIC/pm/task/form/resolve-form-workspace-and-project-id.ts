import type { WorkspaceSchema } from '@motion/zod/client'

import { type GetInitialFormDataOptions } from './get-initial-form-data'
import { resolveFormTaskId } from './resolve-form-task-id'
import type { TaskUrlParams } from './task-url-params'

export function resolveFormWorkspaceAndProjectId({
  searchParams,
  urlParams,
  task,
  defaultWorkspace,
  userDefinedTaskDefaults,
}: Pick<
  GetInitialFormDataOptions,
  'searchParams' | 'task' | 'userDefinedTaskDefaults'
> & {
  urlParams: TaskUrlParams
  defaultWorkspace?: WorkspaceSchema
}) {
  const taskParamId = resolveFormTaskId({ searchParams })
  const usingTaskData = task != null
  const { workspaceId: workspaceIdParam, projectId: projectIdParam } = urlParams

  const workspaceId = usingTaskData
    ? task.workspaceId
    : (searchParams?.forWorkspace ??
      workspaceIdParam ??
      userDefinedTaskDefaults?.global?.workspaceId ??
      defaultWorkspace?.id)

  const projectId = usingTaskData
    ? 'projectId' in task
      ? task.projectId
      : null
    : (searchParams?.forProject ??
      projectIdParam ??
      userDefinedTaskDefaults?.global?.projectId ??
      null)

  return {
    taskId: taskParamId,
    workspaceId,
    projectId,
  }
}
