import {
  type CustomFieldSchema,
  type CustomFieldValuesSchema,
  type NumberMetadataSchema,
} from '@motion/shared/custom-fields'

export type AvailableCustomFieldTypes = CustomFieldValuesSchema['type']

export type TextCustomField = CustomFieldSchemaByType<'text'>
export type UrlCustomField = CustomFieldSchemaByType<'url'>
export type NumberCustomField = CustomFieldSchemaByType<'number'>
export type DateCustomField = CustomFieldSchemaByType<'date'>
export type SelectCustomField = CustomFieldSchemaByType<'select'>
export type MultiSelectCustomField = CustomFieldSchemaByType<'multiSelect'>
export type PersonCustomField = CustomFieldSchemaByType<'person'>
export type MultiPersonCustomField = CustomFieldSchemaByType<'multiPerson'>

export type AllAvailableCustomFieldSchema = CustomFieldSchema
// export type AllAvailableCustomFieldSchema =
//   | TextCustomField
//   | NumberCustomField
//   | SelectCustomField
//   | UrlCustomField
//   | DateCustomField
//   | MultiSelectCustomField
//   | PersonCustomField
//   | MultiPersonCustomField

export type CustomFieldSchemaByType<T extends AvailableCustomFieldTypes> =
  Extract<
    CustomFieldSchema,
    {
      type: T
    }
  >

export type CustomFieldValueSchemaByType<T extends AvailableCustomFieldTypes> =
  Extract<
    CustomFieldValuesSchema,
    {
      type: T
    }
  >

/// Grouping type helpers

type FieldType = AllAvailableCustomFieldSchema extends { type: infer T }
  ? T
  : never

export type FieldName = AllAvailableCustomFieldSchema extends { name: infer T }
  ? T
  : never

export type TypedNameKey = `${FieldType}/${FieldName}`

type RemoveName<T> = T extends `${infer U}/${FieldName}` ? U : T

export type FieldsByTypedName = {
  [K in TypedNameKey]: Extract<
    AllAvailableCustomFieldSchema,
    {
      type: RemoveName<K>
    }
  >[]
}

export type WorkspaceFieldsByTypedName = {
  [K in TypedNameKey]: Extract<
    AllAvailableCustomFieldSchema,
    {
      type: RemoveName<K>
    }
  >
}

export type FormatOptions = {
  id: NumberMetadataSchema['format']
  label: string
  exampleText: string
}[]

export type CustomFieldFieldArrayValue = {
  instanceId: string
  name: string
} & CustomFieldValuesSchema
