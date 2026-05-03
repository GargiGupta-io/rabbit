import type { V2SetupProjectFormFields } from '../../form-fields'

export const v2SetupProjectChangedFieldNames = [
  'startDate',
  'dueDate',
] satisfies (keyof V2SetupProjectFormFields)[]

export type V2SetupProjectChangedFieldName =
  (typeof v2SetupProjectChangedFieldNames)[number]

export function isV2SetupProjectChangedFieldName(
  name: string
): name is V2SetupProjectChangedFieldName {
  return v2SetupProjectChangedFieldNames.includes(name)
}
