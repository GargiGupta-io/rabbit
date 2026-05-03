import { isCompletedStatus } from '@motion/shared/common'
import { createNoneId, isNoneId } from '@motion/shared/identifiers'
import {
  type BooleanFilterSchema,
  type DateFilterSchema,
  type IdFilterSchema,
  type IdNullableFilterSchema,
  type Inclusion,
  type PriorityFilterSchema,
  type ProjectSchema,
  type RangeDateFilterSchema,
  type TaskSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { buildDateFilterQuery } from './date'
import { intersection } from './utils'

import { type AppDataContext } from '../../types'
import {
  type SupportedNumberFilterSchema,
  type SupportedStringFilterSchema,
} from '../state'

export function excludeLabels(
  filter: IdNullableFilterSchema | null | undefined,
  entity: TaskSchema | ProjectSchema
) {
  if (filter == null) return false
  if (filter.value.length === 0) return false

  const excluded = excludeLabelsCore(filter, entity)
  return filter.inverse ? !excluded : excluded
}

function excludeLabelsCore(
  filter: IdNullableFilterSchema,
  entity: TaskSchema | ProjectSchema
): boolean {
  if (entity.type === 'CHUNK') return true

  if (entity.labelIds.length === 0) {
    if (filter.value.includes(createNoneId(entity.workspaceId))) {
      return false
    }
  }

  const matches = entity.labelIds.some((id) => filter.value.includes(id))
  return !matches
}

type StringFields<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends string ? K : never
}[keyof T]

export function exclude(
  filter: IdNullableFilterSchema | null | undefined,
  project: ProjectSchema,
  field: StringFields<ProjectSchema>
): boolean {
  if (!filter) return false

  const value = project[field]
  const ids = filter.value

  const excluded = ids.length > 0 && !ids.includes(value ?? null)
  return invert(excluded, filter.inverse)
}

export function excludeDate(
  filter: DateFilterSchema | null | undefined,
  value: string | null | undefined
) {
  const normalized = buildDateFilterQuery(filter)
  if (normalized == null) return false

  const excluded = excludeDateCore(normalized, value)
  return normalized.inverse ? !excluded : excluded
}

function excludeDateRange(filter: RangeDateFilterSchema, isoValue: string) {
  const value = DateTime.fromISO(isoValue)
  const from = DateTime.fromISO(filter.value.from)
  const to = DateTime.fromISO(filter.value.to)
  return !(from <= value && value <= to)
}

function excludeDateCore(
  filter: DateFilterSchema,
  raw: string | null | undefined
): boolean {
  if (filter.operator === 'empty') {
    return !!raw
  }

  if (filter.operator === 'defined') {
    return !raw
  }

  if (raw == null) return true

  const normalized = buildDateFilterQuery(filter)
  if (normalized == null) return true

  if (normalized.operator === 'empty') {
    return !!raw
  }

  if (normalized.operator === 'defined') {
    return !raw
  }

  if (normalized.operator === 'range') {
    return excludeDateRange(normalized, raw)
  }

  const post = DateTime.fromISO(normalized.value).toISODate()
  const value = DateTime.fromISO(raw).toISODate()

  switch (filter.operator) {
    case 'equals':
      return !(value === post)
    case 'gt':
      return !(value > post)
    case 'gte':
      return !(value >= post)
    case 'lt':
      return !(value < post)
    case 'lte':
      return !(value <= post)
  }

  return true
}

export function excludeId(
  filter: IdFilterSchema,
  filterValues: string[],
  projectValues: string[] | string | null
) {
  if (projectValues == null) return invert(true, filter.inverse)

  const noIntersection =
    intersection(
      filterValues,
      Array.isArray(projectValues) ? projectValues : [projectValues]
    ).length === 0
  return invert(noIntersection, filter.inverse)
}

export function excludeNumber(
  filter: SupportedNumberFilterSchema,
  projectValue: number | null
): boolean {
  if (projectValue == null) return invert(true, filter.inverse)

  switch (filter.operator) {
    case 'equals': {
      return invert(projectValue !== filter.value, filter.inverse)
    }
    case 'gt': {
      return invert(projectValue <= filter.value, filter.inverse)
    }
    case 'gte': {
      return invert(projectValue < filter.value, filter.inverse)
    }
    case 'lt': {
      return invert(projectValue >= filter.value, filter.inverse)
    }
    case 'lte': {
      return invert(projectValue > filter.value, filter.inverse)
    }
    case 'range': {
      const range = filter.value
      if (range.min == null && range.max == null) return false
      const from = range.min ?? -Infinity
      const to = range.max ?? Infinity
      return invert(projectValue < from || projectValue > to, filter.inverse)
    }
    default: {
      return true
    }
  }
}

export function excludeText(
  filter: SupportedStringFilterSchema,
  projectValue: string | null
): boolean {
  if (projectValue == null) return invert(true, filter.inverse)

  switch (filter.operator) {
    case 'beginsWith': {
      return invert(!projectValue.startsWith(filter.value), filter.inverse)
    }
    case 'endsWith': {
      return invert(!projectValue.endsWith(filter.value), filter.inverse)
    }
    case 'contains': {
      return invert(!projectValue.includes(filter.value), filter.inverse)
    }
    default: {
      return true
    }
  }
}

export function excludeInclusion(
  filter: Inclusion | null | undefined,
  value: string | boolean | null
): boolean {
  return (
    (filter === 'exclude' && Boolean(value)) || (filter === 'only' && !value)
  )
}

export function invert(left: boolean | undefined, right: boolean | undefined) {
  return Boolean(right ? !left : left)
}

export function isComplete(ctx: AppDataContext, project: ProjectSchema) {
  const status = ctx.statuses.byId(project.statusId)
  return isCompletedStatus(status)
}

export function emptyInToUndefined<
  T extends IdFilterSchema | PriorityFilterSchema,
>(filter: T | null) {
  if (filter == null) return undefined
  if (filter.value.length === 0) return undefined
  return filter
}

export function formatIdNullableFilter(
  filter: IdFilterSchema | null
): IdNullableFilterSchema | undefined {
  if (filter == null) return undefined
  if (filter.value.length === 0) return undefined
  return {
    ...filter,
    value: filter.value.filter(Boolean).map((x) => (isNoneId(x) ? null : x)),
  }
}

export function formatInclusionFilterToBooleanFilter(
  filter: Inclusion | null
): BooleanFilterSchema | undefined {
  if (filter == null) return undefined
  if (filter === 'include' || filter === 'only')
    return { operator: 'equals', value: true }
  if (filter === 'exclude') return { operator: 'equals', value: false }
  return undefined
}
