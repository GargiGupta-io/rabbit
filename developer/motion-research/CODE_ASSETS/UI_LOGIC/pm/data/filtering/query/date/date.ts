import {
  fromNamedDurationToDateRange,
  fromRelativeNowToDateRange,
} from '@motion/utils/dates'
import {
  type DateFilterSchema,
  type DefinedFilterSchema,
  type DefinedRelativeDateFilterSchema,
  type EmptyFilterSchema,
  type LogicalDateFilterSchema,
  type NowRelativeDateSchema,
  type RangeDateFilterSchema,
  type RelativeDateFilterSchema,
  type RelativeDateRangeFilterSchema,
} from '@motion/zod/client'

import { DateTime, type Zone } from 'luxon'

import { type CalendarStartDay } from '../../../../../calendar'

const LOGICAL_OPS = [
  'gt',
  'gte',
  'lt',
  'lte',
  'equals',
] as LogicalDateFilterSchema['operator'][]

export function isLogicalFilter(
  obj: DateFilterSchema
): obj is LogicalDateFilterSchema {
  return LOGICAL_OPS.includes(obj.operator)
}

export function buildDateFilterQuery(
  filter: DateFilterSchema | null | undefined,
  startDay: CalendarStartDay = 'sunday'
):
  | DefinedFilterSchema
  | EmptyFilterSchema
  | RangeDateFilterSchema
  | LogicalDateFilterSchema
  | undefined {
  if (filter == null) return undefined
  if (filter.operator === 'defined') return filter
  if (filter.operator === 'empty') return filter

  if (filter.operator === 'relative') {
    return buildRelativeDateQuery(filter, startDay)
  }

  if (filter.operator === 'defined-relative') {
    return buildRelativeRangeDateQuery(filter, startDay)
  }

  if (filter.operator === 'range') return normalizeRangeFilter(filter)

  if (filter.operator === 'relative-date-range') {
    const now = DateTime.now()
    const { from, to } = fromRelativeDateRangeFilter(filter, {
      now,
      zone: now.zone,
    })
    if (from != null && to != null) {
      return {
        operator: 'range',
        value: {
          from,
          to,
        },
      }
    }

    if (from == null && to != null) {
      return {
        operator: 'lte',
        value: to,
        inverse: filter.inverse,
      }
    }

    if (from != null && to == null) {
      return {
        operator: 'gte',
        value: from,
        inverse: filter.inverse,
      }
    }
    return undefined
  }

  return normalizeLogicalFilters(filter)
}

export function buildRelativeDateQuery(
  filter: RelativeDateFilterSchema,
  startDay: CalendarStartDay = 'sunday'
): RangeDateFilterSchema {
  const range = fromRelativeNowToDateRange(filter.duration)
  return {
    operator: 'range',
    inverse: filter.inverse,
    value: range,
  }
}

export function buildRelativeRangeDateQuery(
  filter: DefinedRelativeDateFilterSchema,
  startDay: CalendarStartDay = 'sunday'
): RangeDateFilterSchema {
  const base = buildRelativeRangeDateQueryBase(filter, startDay)
  return {
    ...base,
    inverse: filter.inverse,
  }
}

function buildRelativeRangeDateQueryBase(
  filter: DefinedRelativeDateFilterSchema,
  startDay: CalendarStartDay = 'sunday'
): RangeDateFilterSchema {
  const range = fromNamedDurationToDateRange(filter.name)
  return {
    operator: 'range',
    value: range,
    inverse: filter.inverse,
  }
}

function normalizeRangeFilter(
  filter: RangeDateFilterSchema
): RangeDateFilterSchema {
  return {
    ...filter,
    value: {
      from: DateTime.fromISO(filter.value.from).startOf('day').toISO(),
      to: DateTime.fromISO(filter.value.to).endOf('day').toISO(),
    },
  }
}

export function normalizeLogicalFilters(
  filter: LogicalDateFilterSchema
): RangeDateFilterSchema | LogicalDateFilterSchema {
  const value = DateTime.fromISO(filter.value)
  if (filter.operator === 'equals') {
    return {
      inverse: filter.inverse,
      operator: 'range',
      value: {
        from: value.startOf('day').toISO(),
        to: value.endOf('day').toISO(),
      },
    }
  }
  if (filter.operator === 'gt') {
    return { ...filter, value: value.endOf('day').toISO() }
  }
  if (filter.operator === 'lt') {
    return { ...filter, value: value.startOf('day').toISO() }
  }
  if (filter.operator === 'gte') {
    return { ...filter, value: value.startOf('day').toISO() }
  }

  if (filter.operator === 'lte') {
    return { ...filter, value: value.endOf('day').toISO() }
    /* c8 ignore start */
  }

  // This shouldn't ever be hit.
  // But just in case, return the filter
  return filter
}

type DateRangeContext = {
  zone: string | Zone
  now: DateTime
}
export function fromRelativeDateRangeFilter(
  value: RelativeDateRangeFilterSchema,
  opts: DateRangeContext
) {
  const start = processLeadingEdge(opts, value.from)
  const end = processTrailingEdge(opts, value.to)
  return { from: start?.toISO(), to: end?.toISO() }
}

export function processLeadingEdge(ctx: DateRangeContext, value: null): null
export function processLeadingEdge(
  ctx: DateRangeContext,
  value: NowRelativeDateSchema | string
): DateTime
export function processLeadingEdge(
  ctx: DateRangeContext,
  value: NowRelativeDateSchema | null | string
): DateTime | null
export function processLeadingEdge(
  ctx: DateRangeContext,
  value: NowRelativeDateSchema | null | string
): DateTime | null {
  if (value == null) return null
  if (typeof value === 'string') {
    return DateTime.fromISO(value, { zone: ctx.zone }).startOf('day')
  }
  return ctx.now
    .setZone(ctx.zone)
    .plus({ [value.unit]: value.offset })
    .startOf(value.mode === 'strict' ? 'day' : value.unit)
}

export function processTrailingEdge(ctx: DateRangeContext, value: null): null
export function processTrailingEdge(
  ctx: DateRangeContext,
  value: NowRelativeDateSchema | string
): DateTime
export function processTrailingEdge(
  ctx: DateRangeContext,
  value: NowRelativeDateSchema | null | string
): DateTime | null
export function processTrailingEdge(
  ctx: DateRangeContext,
  value: NowRelativeDateSchema | null | string
): DateTime | null {
  if (value == null) return null
  if (typeof value === 'string') {
    return DateTime.fromISO(value, { zone: ctx.zone }).endOf('day')
  }
  return ctx.now
    .setZone(ctx.zone)
    .plus({ [value.unit]: value.offset })
    .endOf(value.mode === 'strict' ? 'day' : value.unit)
}
