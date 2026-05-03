/* c8 ignore start */

export function toV9(obj: any): any {
  obj.$version = 9

  if (obj.tasks.filters.completed === 'include') {
    obj.tasks.filters.canceled = 'include'
  } else {
    obj.tasks.filters.canceled = 'exclude'
  }

  return obj
}
