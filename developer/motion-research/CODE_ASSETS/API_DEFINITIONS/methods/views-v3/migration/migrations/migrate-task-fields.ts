import { VersionedViewV3 } from '@motion/zod'

const TASK_FIELDS = {
  updatedTime: 'lastInteractedTime',
}

export function migrateTaskFields<
  T extends { views: Record<string, VersionedViewV3> },
>(models: T): T {
  const migratedViews = Object.entries(models.views).reduce(
    (acc, [id, view]) => {
      if ('filters' in view.definition && 'tasks' in view.definition.filters) {
        view.definition.filters.tasks = remapFields(
          TASK_FIELDS,
          view.definition.filters.tasks
        )
      }

      acc[id] = view

      return acc
    },
    {} as Record<string, VersionedViewV3>
  )

  models.views = migratedViews

  return models
}

function remapFields(
  fieldMap: Record<string, string>,
  filter: { ordered: string[]; filters: Record<string, unknown> }
): { ordered: string[]; filters: Record<string, unknown> } {
  return {
    ordered: filter.ordered.map((x: string) => fieldMap[x] ?? x),
    filters: Object.keys(filter.filters).reduce(
      (acc, key) => {
        const value = filter.filters[key]
        if (value != null) {
          const newKey = fieldMap[key] ?? key
          acc[newKey] = value
        }
        return acc
      },
      {} as Record<string, unknown>
    ),
  }
}
