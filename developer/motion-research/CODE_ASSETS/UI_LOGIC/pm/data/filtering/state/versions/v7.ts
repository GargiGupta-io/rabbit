export function toV7(obj: any): any {
  obj.$version = 7

  obj.tasks = remapFields(TASK_FIELDS, obj.tasks)

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
  updatedTime: 'lastInteractedTime',
}
