import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { FieldTypes } from './constants'

const IsoDateTimeSchema = z
  .union([z.date(), z.string()])
  .transform((value) => {
    if (typeof value === 'string') {
      return DateTime.fromISO(value).toISO()
    }
    return DateTime.fromJSDate(value).toISO()
  })
  .pipe(z.string())
  .meta({ type: 'string', format: 'date-time' })

export const FieldBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  workspaceId: z.string(),
  createdTime: IsoDateTimeSchema,
  updatedTime: IsoDateTimeSchema.nullable(),
  deletedTime: IsoDateTimeSchema.nullable(),
})

export type FieldBase = z.infer<typeof FieldBaseSchema>

export const SelectFieldOptionSchema = z.object({
  id: z.string(),
  value: z.string(),
  color: z.string(),
  deletedTime: z.string().nullable(),
})

export type SelectFieldOption = z.infer<typeof SelectFieldOptionSchema>

export const SelectFieldOptionsSchema = z.object({
  options: SelectFieldOptionSchema.array(),
})

export type SelectFieldOptions = z.infer<typeof SelectFieldOptionsSchema>

export const NumberMetadataSchema = z.object({
  format: z.enum(['plain', 'formatted', 'percent']),
})

export type NumberMetadataSchema = z.infer<typeof NumberMetadataSchema>

export const CheckboxMetadataSchema = z.object({
  toggle: z.boolean(),
})

export type CheckboxMetadataSchema = z.infer<typeof CheckboxMetadataSchema>

export const FieldTypeSchema = z.enum(FieldTypes)

export type FieldTypeSchema = z.infer<typeof FieldTypeSchema>

export const TextFieldSchema = FieldBaseSchema.extend({
  type: z.literal(FieldTypeSchema.enum.text),
})

export type TextFieldSchema = z.infer<typeof TextFieldSchema>

export const UrlFieldSchema = FieldBaseSchema.extend({
  type: z.literal(FieldTypeSchema.enum.url),
})

export type UrlFieldSchema = z.infer<typeof UrlFieldSchema>

export const DateFieldSchema = FieldBaseSchema.extend({
  type: z.literal(FieldTypeSchema.enum.date),
})

export type DateFieldSchema = z.infer<typeof DateFieldSchema>

export const PersonFieldSchema = FieldBaseSchema.extend({
  type: z.literal(FieldTypeSchema.enum.person),
})

export type PersonFieldSchema = z.infer<typeof PersonFieldSchema>

export const MultiPersonFieldSchema = FieldBaseSchema.extend({
  type: z.literal(FieldTypeSchema.enum.multiPerson),
})

export type MultiPersonFieldSchema = z.infer<typeof MultiPersonFieldSchema>

export const SelectFieldSchema = FieldBaseSchema.extend({
  type: z.literal(FieldTypeSchema.enum.select),
  metadata: SelectFieldOptionsSchema,
})

export type SelectFieldSchema = z.infer<typeof SelectFieldSchema>

export const MultiSelectFieldSchema = FieldBaseSchema.extend({
  type: z.literal(FieldTypeSchema.enum.multiSelect),
  metadata: SelectFieldOptionsSchema,
})

export type MultiSelectFieldSchema = z.infer<typeof MultiSelectFieldSchema>

export const NumberFieldSchema = FieldBaseSchema.extend({
  type: z.literal(FieldTypeSchema.enum.number),
  metadata: NumberMetadataSchema,
})

export type NumberFieldSchema = z.infer<typeof NumberFieldSchema>

export const CustomFieldSchema = z.discriminatedUnion('type', [
  TextFieldSchema,
  UrlFieldSchema,
  DateFieldSchema,
  PersonFieldSchema,
  MultiPersonFieldSchema,
  NumberFieldSchema,
  SelectFieldSchema,
  MultiSelectFieldSchema,
])

export type CustomFieldSchema = z.infer<typeof CustomFieldSchema>

export const TextValueSchema = z.object({
  type: z.literal(FieldTypeSchema.enum.text),
  value: z.string().nullable(),
})

export type TextValueSchema = z.infer<typeof TextValueSchema>

export const NumberValueSchema = z.object({
  type: z.literal(FieldTypeSchema.enum.number),
  value: z.number().nullable(),
})

export type NumberValueSchema = z.infer<typeof NumberValueSchema>

export const UrlValueSchema = z.object({
  type: z.literal(FieldTypeSchema.enum.url),
  value: z.string().nullable(),
})

export type UrlValueSchema = z.infer<typeof UrlValueSchema>

export const DateValueSchema = z.object({
  type: z.literal(FieldTypeSchema.enum.date),
  value: z.string().nullable(),
})

export type DateValueSchema = z.infer<typeof DateValueSchema>

export const SelectValueSchema = z.object({
  type: z.literal(FieldTypeSchema.enum.select),
  value: z.string().nullable(),
})

export type SelectValueSchema = z.infer<typeof SelectValueSchema>

export const MultiSelectValueSchema = z.object({
  type: z.literal(FieldTypeSchema.enum.multiSelect),
  value: z.string().array().nullable(),
})

export type MultiSelectValueSchema = z.infer<typeof MultiSelectValueSchema>

export const PersonValueSchema = z.object({
  type: z.literal(FieldTypeSchema.enum.person),
  value: z.string().nullable(),
})

export type PersonValueSchema = z.infer<typeof PersonValueSchema>

export const MultiPersonValueSchema = z.object({
  type: z.literal(FieldTypeSchema.enum.multiPerson),
  value: z.string().array().nullable(),
})

export type MultiPersonValueSchema = z.infer<typeof MultiPersonValueSchema>

export const CustomFieldValuesSchema = z.discriminatedUnion('type', [
  TextValueSchema,
  NumberValueSchema,
  UrlValueSchema,
  SelectValueSchema,
  MultiSelectValueSchema,
  PersonValueSchema,
  MultiPersonValueSchema,
  DateValueSchema,
])

export type CustomFieldValuesSchema = z.infer<typeof CustomFieldValuesSchema>
export const CustomFieldCategoriesSchema = z.object({
  id: FieldTypeSchema,
  name: z.string(),
})

/*
 All of the below is for bulk operations specifically which operate in a hyper specialized fashion
 */
export const FieldOperationSchema = z.enum(['add', 'remove'])
export type FieldOperationSchema = z.infer<typeof FieldOperationSchema>
export const SelectionSchema = z.object({
  id: z.string(),
  operation: FieldOperationSchema,
})

export const BulkMultiSelect = z.object({
  type: z.literal(FieldTypeSchema.enum.multiSelect),
  value: SelectionSchema.array().nullable(),
})

export const BulkMultiPerson = z.object({
  type: z.literal(FieldTypeSchema.enum.multiPerson),
  value: SelectionSchema.array().nullable(),
})

export const BulkOpsCustomFieldsSchema = z.discriminatedUnion('type', [
  TextValueSchema,
  NumberValueSchema,
  UrlValueSchema,
  DateValueSchema,
  SelectValueSchema,
  PersonValueSchema,
  BulkMultiPerson,
  BulkMultiSelect,
])

export type BulkOpsCustomFieldsSchema = z.infer<
  typeof BulkOpsCustomFieldsSchema
>
