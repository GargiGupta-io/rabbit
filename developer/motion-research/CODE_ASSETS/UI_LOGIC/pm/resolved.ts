import { type EntityFilterState } from './data'

export function isShowCompletedChecked(
  entity: EntityFilterState['tasks'] | EntityFilterState['projects']
): 'indeterminate' | boolean {
  if (entity.filters.statusIds) return 'indeterminate'
  if ('completedTime' in entity.filters && entity.filters.completedTime)
    return 'indeterminate'

  return entity.filters.completed === 'include'
}

export function isShowResolvedChecked(
  entity: EntityFilterState['tasks']
): 'indeterminate' | boolean {
  const isShowCompleted = isShowCompletedChecked(entity)
  if (isShowCompleted === 'indeterminate') return 'indeterminate'

  return isShowCompleted && entity.filters.canceled === 'include'
}
