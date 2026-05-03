import type { SetupProjectFormFields } from '../../form-fields'

export const setupProjectChangedFieldNames = [
  'startDate',
  'dueDate',
] satisfies (keyof SetupProjectFormFields)[]

export const dynamicSetupProjectChangedFieldPrefix = [
  'stageDueDates',
] satisfies (keyof SetupProjectFormFields)[]

export type SetupProjectChangedFieldName =
  | (typeof setupProjectChangedFieldNames)[number]
  | (typeof dynamicSetupProjectChangedFieldPrefix)[number]

export function isSetupProjectChangedFieldName(
  name: string
): name is SetupProjectChangedFieldName {
  return (
    setupProjectChangedFieldNames.includes(name) ||
    dynamicSetupProjectChangedFieldPrefix.some((n) => name.startsWith(n))
  )
}
