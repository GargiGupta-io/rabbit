export function toV8(obj: any): any {
  obj.$version = 8

  obj.tasks.filters.archived = 'exclude'

  return obj
}
