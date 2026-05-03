export function toV3(obj: any) {
  obj.$version = 3

  if (obj.tasks.filters.projects != null) {
    obj.projects.filters.ids = obj.tasks.filters.projects

    delete obj.tasks.filters.projects
    obj.tasks.ordered = obj.tasks.ordered.filter(
      (x: string) => x !== 'projects'
    )
    obj.projects.ordered.unshift('ids')
  }

  return obj
}
