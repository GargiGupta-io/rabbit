import {
  type DateFilterSchema,
  type IdNullableFilterSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

const STRING_FIELDS = ['ids', 'statuses', 'users', 'priorities', 'labels']
const DATE_FIELDS = [
  'dueDate',
  'createdTime',
  'updatedTime',
  'startDate',
  'completedTime',
  'lastInteractedTime',
  'scheduledDate',
]
const INCLUSION_FIELDS = ['recurring', 'autoScheduled']

export function toV4(obj: any): any {
  obj.$version = 4
  ;['tasks', 'projects', 'workspaces'].forEach((type) => {
    const entity = obj[type]
    const filters = entity.filters
    const keys = Object.keys(filters) as string[]
    keys.forEach((key) => {
      if (STRING_FIELDS.includes(key)) {
        const value = filters[key] as string[] | null
        if (value == null) return
        const newValue: IdNullableFilterSchema = {
          inverse: false,
          operator: 'in',
          value,
        }
        filters[key] = newValue
      } else if (DATE_FIELDS.includes(key)) {
        filters[key] = toFilterSchema(filters[key])
      } else if (INCLUSION_FIELDS.includes(key)) {
        // no migration needed
      } else {
        filters[key] = null
      }
    })
  })

  return obj
}

type DateValueFilter = { from?: string; to?: string }
export function toFilterSchema(
  value: DateValueFilter | null
): DateFilterSchema | null {
  if (value == null) return null

  const from = value.from
    ? DateTime.fromISO(value.from, { setZone: true })
    : null
  const to = value.to ? DateTime.fromISO(value.to, { setZone: true }) : null

  if (from && to && from.hasSame(to, 'day')) {
    return {
      inverse: false,
      operator: 'equals',
      value: from.startOf('day').toISODate(),
    }
  }

  if (from && to) {
    return {
      inverse: false,
      operator: 'range',
      value: { from: from.toISO(), to: to.toISO() },
    }
  }

  if (from) {
    return {
      inverse: false,
      operator: 'gte',
      value: from.startOf('day').toISO(),
    }
  }
  if (to) {
    return { inverse: false, operator: 'lt', value: to.endOf('day').toISO() }
  }

  return null
}
