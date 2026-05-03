import { VersionedViewV3 } from '@motion/zod'

export function addArchivedFilter<
  T extends { views: Record<string, VersionedViewV3> },
>(models: T): T {
  const migratedViews = Object.entries(models.views).reduce(
    (acc, [id, view]) => {
      if ('filters' in view.definition && 'tasks' in view.definition.filters) {
        view.definition.filters.tasks.filters.archived = 'exclude'
      }

      acc[id] = view

      return acc
    },
    {} as Record<string, VersionedViewV3>
  )

  models.views = migratedViews

  return models
}
