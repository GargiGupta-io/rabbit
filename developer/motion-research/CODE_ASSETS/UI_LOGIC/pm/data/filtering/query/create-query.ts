import { API } from '@motion/rpc-definitions'
import { type OrNullable, stripNull } from '@motion/utils/object'
import {
  type GetTasksV2FilterWithOperatorsSchema,
  type TasksV2QuerySchema,
} from '@motion/zod/client'

import { buildTaskFilter, type TaskFilterOptions } from './tasks'
import { type DataFilters } from './types'

import { type AppDataContext } from '../../types'

export function createQuery(
  ctx: AppDataContext,
  filters: DataFilters,
  overrides?: Partial<OrNullable<GetTasksV2FilterWithOperatorsSchema>>,
  opts: TaskFilterOptions = {}
): TasksV2QuerySchema | null {
  const taskFilters = buildTaskFilter(ctx, filters, opts)
  if (taskFilters == null) return null

  if (taskFilters.length === 0) {
    return null
  }

  if (
    taskFilters.some(
      (x) => x.workspaceIds == null || x.workspaceIds.length === 0
    )
  ) {
    return null
  }

  return {
    $version: 2,
    filters: taskFilters.map((filter) =>
      Object.assign(filter, stripNull(overrides ?? {}))
    ),
    include: API.tasksV2.taskAllIncludes,
  }
}
