import { FieldTypes } from '@motion/shared/custom-fields'
import { entries, keys } from '@motion/utils/object'
import {
  type CustomFieldValueFilterSchema,
  type DateFilterSchema,
  type IdFilterSchema,
  type NormalTaskSchema,
  type ProjectSchema,
  type TaskSchema,
} from '@motion/zod/client'

import { buildDateFilterQuery } from './date'
import {
  excludeDate,
  excludeId,
  excludeNumber,
  excludeText,
  formatIdNullableFilter,
  invert,
} from './helpers'

import {
  type CustomFieldFilters,
  type ProjectFilter,
  type SupportedNumberFilterSchema,
  type SupportedStringFilterSchema,
  type TaskFilter,
} from '../state'

export function getCustomFieldFilters(
  filters: TaskFilter | ProjectFilter
): Record<string, CustomFieldValueFilterSchema>[] | undefined {
  const customFieldFilters = FieldTypes.reduce<
    Record<string, CustomFieldValueFilterSchema>[]
  >((acc, type) => {
    const filtersForType: CustomFieldFilters[keyof CustomFieldFilters] =
      filters[type]
    if (filtersForType == null) {
      return acc
    }

    const allMatchingFieldFilters = Object.values(filtersForType)
    if (allMatchingFieldFilters.length === 0) {
      return acc
    }

    if (type === 'date') {
      const converted = allMatchingFieldFilters
        .map((x) => convertCustomFieldDateFilters(x))
        .filter(Boolean)

      return [...acc, ...converted]
    }
    if (type === 'person' || type === 'multiPerson') {
      const converted = allMatchingFieldFilters.map((x) =>
        convertCustomFieldFilters(x, formatIdNullableFilter)
      )
      return [...acc, ...converted]
    }

    return [...acc, ...allMatchingFieldFilters]
  }, [])

  return customFieldFilters.length > 0 ? customFieldFilters : undefined
}

function convertCustomFieldFilters<T, R>(
  obj: Record<string, T>,
  transform: (item: T) => R
) {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const filter = transform(obj[key])
      if (filter == null) return acc
      acc[key] = filter
      return acc
    },
    {} as Record<string, R>
  )
}

function convertCustomFieldDateFilters(obj: Record<string, DateFilterSchema>) {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const filter = buildDateFilterQuery(obj[key])
      if (filter == null) return acc
      acc[key] = filter
      return acc
    },
    {} as Record<string, DateFilterSchema>
  )
}

export function excludeProjectsByCustomField(
  projectFilter: ProjectFilter,
  project: ProjectSchema
) {
  const customFieldFilters = getCustomFieldFilters(projectFilter)

  if (customFieldFilters == null) return false

  return excludeByCustomField(customFieldFilters, project)
}

export function excludeByCustomField(
  customFieldFilters:
    | Record<string, CustomFieldValueFilterSchema>[]
    | undefined,
  entity: ProjectSchema | TaskSchema
) {
  if (customFieldFilters == null) return false
  // Recurring instances & chunks don't have custom fields
  if (entity.type === 'RECURRING_INSTANCE' || entity.type === 'CHUNK')
    return true

  let excluded = false
  for (const groupedFilters of customFieldFilters) {
    excluded = excludeByGroupedFilters(groupedFilters, entity)
    /**
     * This replicates AND logic b/t filters,
     * meaning if the project doesn't match one of the filters, it should be excluded
     */
    if (excluded) return true
  }

  return excluded
}

const excludeByGroupedFilters = (
  groupedFilters: Record<string, CustomFieldValueFilterSchema>,
  entity: ProjectSchema | NormalTaskSchema
): boolean => {
  const groupedFilterEntires = entries(groupedFilters)
  const allFilterFieldIds = groupedFilterEntires.map(([id]) => id)
  const allFilterValues = groupedFilterEntires
    .flatMap(([, value]) => ('value' in value ? value.value : null))
    .filter(Boolean) as string[]

  // All grouped filters are the same
  const filter = groupedFilterEntires[0][1]

  if (filter.operator === 'empty') {
    const isEmpty = allFilterFieldIds.every(
      (id) => entity.customFieldValues[id] == null
    )
    const exclude = !isEmpty
    return invert(exclude, filter.inverse)
  }

  // Exclude if no matching field
  const customFieldIds = keys(entity.customFieldValues)
  if (!allFilterFieldIds.some((id) => customFieldIds.includes(id)))
    return invert(true, filter.inverse)

  for (const fieldId of allFilterFieldIds) {
    /**
     * This "continue" replicates OR logic in the grouped filters
     */
    const field = entity.customFieldValues[fieldId]
    if (field == null) continue

    let excluded = false
    if (field.type === 'date') {
      excluded = excludeDate(filter as DateFilterSchema, field.value)
    } else if (
      ['multiSelect', 'select', 'multiPerson', 'person'].includes(field.type)
    ) {
      excluded = excludeId(
        filter as IdFilterSchema,
        allFilterValues,
        field.value as string[] | string | null
      )
    } else if (typeof field.value === 'number') {
      excluded = excludeNumber(
        filter as SupportedNumberFilterSchema,
        field.value
      )
    } else {
      excluded = excludeText(
        filter as SupportedStringFilterSchema,
        field.value as string | null
      )
    }

    if (excluded) return true
  }

  return false
}
