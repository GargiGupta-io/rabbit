import {
  type DateFilterSchema,
  type IdFilterSchema,
  type Inclusion,
} from '@motion/zod/client'

import { type DataFilters } from './types'

import { type EntityFilterState } from '../state'

export function intersection(...values: string[][]): string[] {
  const nonEmpty = values.filter((s) => s.length > 0)
  const unique = Array.from(new Set(nonEmpty.flat()))
  return unique.reduce((acc, cur) => {
    const count = values.filter((v) => v.some((v1) => v1 === cur)).length

    if (count === values.length) {
      acc.push(cur)
    }

    return acc
  }, [] as string[])
}

export function toDataFilter(state: EntityFilterState): DataFilters {
  return {
    tasks: state.tasks.filters,
    projects: state.projects.filters,
    workspaces: state.workspaces.filters,
  }
}

export function normalizeToDataFilter(
  stateOrFilter: EntityFilterState | DataFilters
): DataFilters {
  return isDataFilter(stateOrFilter)
    ? stateOrFilter
    : toDataFilter(stateOrFilter)
}

function isDataFilter(
  stateOrFilter: EntityFilterState | DataFilters
): stateOrFilter is DataFilters {
  return !('ordered' in stateOrFilter.tasks)
}

type CompletedFilterRequires = {
  statusIds?: IdFilterSchema | null | undefined
  completedTime?: DateFilterSchema | null | undefined
  completed?: Inclusion | null | undefined
}

export function getCompletedFilter(
  filter: CompletedFilterRequires,
  fallbackValue: Inclusion
): Inclusion
export function getCompletedFilter(
  filter: CompletedFilterRequires
): Inclusion | undefined
export function getCompletedFilter(
  filter: CompletedFilterRequires,
  fallbackValue?: Inclusion
): Inclusion | undefined {
  if (filter.statusIds != null) return 'include'
  if ('completedTime' in filter && filter.completedTime != null)
    return 'include'
  return filter.completed ?? fallbackValue
}

type CanceledFilterRequires = {
  statusIds?: IdFilterSchema | null | undefined
  canceled?: Inclusion | null | undefined
}

export function getCanceledFilter(
  filter: CanceledFilterRequires,
  fallbackValue: Inclusion
): Inclusion
export function getCanceledFilter(
  filter: CanceledFilterRequires
): Inclusion | undefined
export function getCanceledFilter(
  filter: CanceledFilterRequires,
  fallbackValue?: Inclusion
): Inclusion | undefined {
  if (filter.statusIds != null) return 'include'
  return filter.canceled ?? fallbackValue
}

export function getCanceledIdFilter(
  filter: CanceledFilterRequires,
  canceledStatusIds: string[]
): IdFilterSchema | undefined {
  if (canceledStatusIds.length === 0) return undefined

  if (filter.canceled === 'include') return undefined

  if (filter.statusIds != null) return undefined

  return {
    operator: 'in',
    value: canceledStatusIds,
    inverse: filter.canceled !== 'only', // Lots of negatives in these filters - when passed to `excludeId`, 'exclude' means exclude tasks that are cancelled & 'only' means only include tasks that are cancelled
  }
}
