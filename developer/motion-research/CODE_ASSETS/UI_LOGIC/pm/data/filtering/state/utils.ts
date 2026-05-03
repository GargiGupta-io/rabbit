import { type AvailableCustomFieldTypes } from '../../../custom-fields'

export const availableFilterFields = [
  'select',
  'multiSelect',
  'person',
  'multiPerson',
  'text',
  'url',
  'number',
  'date',
] as const satisfies AvailableCustomFieldTypes[]
