export function toV2(obj: any) {
  obj.$version = 2
  obj.workspaces = {
    filters: { ids: null },
    ordered: [],
  }

  if (obj.tasks.filters.workspaces != null) {
    obj.workspaces.filters.ids = obj.tasks.filters.workspaces
    obj.workspaces.ordered = ['ids']
    delete obj.tasks.filters.workspaces
    obj.tasks.ordered = obj.tasks.ordered.filter(
      (x: string) => x !== 'workspaces'
    )
  }

  return obj
}
