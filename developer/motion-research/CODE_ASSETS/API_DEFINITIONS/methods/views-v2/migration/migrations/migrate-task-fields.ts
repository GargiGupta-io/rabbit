import type { AllModelsSchema } from '@motion/zod/client'

const TASK_FIELDS: Record<string, string> = {
  updatedTime: 'lastInteractedTime',
}

export function migrateTaskFields(
  models: Pick<AllModelsSchema, 'views'>
): Pick<AllModelsSchema, 'views'> {
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
    {} as Pick<AllModelsSchema, 'views'>['views']
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
