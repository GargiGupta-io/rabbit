import { type AllModelsSchema } from '@motion/zod/client'

export function addArchivedFilter(
  models: Pick<AllModelsSchema, 'views'>
): Pick<AllModelsSchema, 'views'> {
  const migratedViews = Object.entries(models.views).reduce(
    (acc, [id, view]) => {
      if ('filters' in view.definition && 'tasks' in view.definition.filters) {
        view.definition.filters.tasks.filters.archived = 'exclude'
      }

      acc[id] = view

      return acc
    },
    {} as Pick<AllModelsSchema, 'views'>['views']
  )

  models.views = migratedViews

  return models
}
