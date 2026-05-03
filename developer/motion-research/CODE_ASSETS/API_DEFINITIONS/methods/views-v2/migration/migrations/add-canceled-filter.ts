import { type AllModelsSchema } from '@motion/zod/client'

export function addCanceledFilter(
  models: Pick<AllModelsSchema, 'views'>
): Pick<AllModelsSchema, 'views'> {
  const migratedViews = Object.entries(models.views).reduce(
    (acc, [id, view]) => {
      if ('filters' in view.definition && 'tasks' in view.definition.filters) {
        if (view.definition.filters.tasks.filters.completed === 'include') {
          view.definition.filters.tasks.filters.canceled = 'include'
        } else {
          view.definition.filters.tasks.filters.canceled = 'exclude'
        }
      }

      acc[id] = view

      return acc
    },
    {} as Pick<AllModelsSchema, 'views'>['views']
  )

  models.views = migratedViews

  return models
}
