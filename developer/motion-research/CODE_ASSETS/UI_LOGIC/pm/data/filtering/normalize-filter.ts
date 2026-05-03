import { getIdFromNoneId, isNoneId } from '@motion/shared/identifiers'
import { type IdFilterSchema } from '@motion/zod/client'

import { type EntityFilterState } from './state/types'

import { type AppDataContext, type EntityCache } from '../types'

export function normalizeFilter(
  ctx: AppDataContext,
  filter: EntityFilterState
): EntityFilterState {
  const workspaceIds = filter.workspaces.filters.ids

  if (workspaceIds == null || workspaceIds.value.length === 0) return filter

  filter.tasks.filters.statusIds = filterWorkspaceItems(
    'statuses',
    filter.tasks.filters.statusIds,
    workspaceIds.value,
    ctx
  )

  filter.tasks.filters.labelIds = filterWorkspaceItems(
    'labels',
    filter.tasks.filters.labelIds,
    workspaceIds.value,
    ctx
  )

  filter.projects.filters.ids = filterWorkspaceItems(
    'projects',
    filter.projects.filters.ids,
    workspaceIds.value,
    ctx
  )

  filter.projects.filters.statusIds = filterWorkspaceItems(
    'statuses',
    filter.projects.filters.statusIds,
    workspaceIds.value,
    ctx
  )

  filter.projects.filters.labelIds = filterWorkspaceItems(
    'labels',
    filter.projects.filters.labelIds,
    workspaceIds.value,
    ctx
  )
  return filter
}

type WithWorkspaceId = {
  id: string
  workspaceId: string
}

type WorkspaceItemKeys = {
  [K in keyof AppDataContext]: AppDataContext[K] extends EntityCache<WithWorkspaceId>
    ? K
    : never
}[keyof AppDataContext]

function filterWorkspaceItems(
  type: WorkspaceItemKeys,
  filter: IdFilterSchema | null,
  selectedWorkspaceIds: string[] | null,
  ctx: AppDataContext
): IdFilterSchema | null {
  if (filter == null) return null
  if (selectedWorkspaceIds == null) return null

  const ids = filter.value
  const items = ids
    .map((id) => {
      if (isNoneId(id)) return { id, workspaceId: getIdFromNoneId(id) }
      return ctx[type].byId(id)
    })
    .filter(Boolean)
    .filter((x) => selectedWorkspaceIds.includes(x.workspaceId))
  if (items.length === 0) return null
  return {
    operator: 'in',
    value: items.map((x) => x.id),
    inverse: filter.inverse,
  }
}
