import { type GetInitialFormDataOptions } from './get-initial-form-data'

export function resolveFormTaskId({
  searchParams = {},
  state,
}: Pick<GetInitialFormDataOptions, 'searchParams' | 'state'>) {
  if (state?.chunkId != null) {
    return state.chunkId
  }

  const { forTaskId: forTaskIdParam, task: taskParam } = searchParams

  const taskParamId =
    forTaskIdParam ?? (taskParam === 'new' ? undefined : taskParam)

  return taskParamId
}
