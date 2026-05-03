export function toV5(obj: any): any {
  obj.$version = 5

  obj.tasks = remapFields(TASK_FIELDS, obj.tasks)
  obj.projects = remapFields(PROJECT_FIELDS, obj.projects)

  return obj
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

const TASK_FIELDS: Record<string, string> = {
  statuses: 'statusIds',
  users: 'assigneeUserIds',
  labels: 'labelIds',
}

const PROJECT_FIELDS: Record<string, string> = {
  statuses: 'statusIds',
  users: 'managerIds',
  labels: 'labelIds',
}
