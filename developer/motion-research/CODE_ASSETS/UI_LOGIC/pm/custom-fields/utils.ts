import { type CustomFieldValuesRecord } from '@motion/rpc-types/legacy'
import { FieldTypes, type FieldTypeSchema } from '@motion/shared/custom-fields'
import { CUSTOM_FIELDS_VALIDATIONS } from '@motion/zod/client'

import { CUSTOM_FIELD_CATEGORIES_RESPONSE } from './consts'
import { numberFormatOptions } from './number'
import {
  type AllAvailableCustomFieldSchema,
  type CustomFieldFieldArrayValue,
  type MultiSelectCustomField,
  type SelectCustomField,
  type TypedNameKey,
} from './types'

export function isMaxNumberWorkspaceFields(current: number): boolean {
  return current >= CUSTOM_FIELDS_VALIDATIONS.workspace.maxFields
}

export function getNameValidationRules(type: FieldTypeSchema) {
  const { maxLength } = CUSTOM_FIELDS_VALIDATIONS.categories[type].name

  return {
    required: true,
    maxLength,
  }
}

export function getOptionValidationRules(
  type: Extract<FieldTypeSchema, 'select' | 'multiSelect' | 'multiPerson'>
) {
  const { maxLength, maxOptions, maxSelected } =
    CUSTOM_FIELDS_VALIDATIONS.categories[type].options

  return {
    required: true,
    maxLength,
    maxOptions,
    maxSelected,
  }
}

export function getTextLengthValidationRules(
  type: Extract<FieldTypeSchema, 'text' | 'url' | 'number'>
) {
  return CUSTOM_FIELDS_VALIDATIONS.categories[type].value
}

export function getCreateCustomFieldErrorMsg(e: Error, name: string) {
  if ((e as any).status === 409) {
    return `Custom Field with name ${name} already exists on this workspace.`
  }
  return e.message
}

export function hasOptions(
  t: AllAvailableCustomFieldSchema
): t is MultiSelectCustomField | SelectCustomField {
  return t.type === 'multiSelect' || t.type === 'select'
}

export function hasTypeOptions(
  t: FieldTypeSchema
): t is 'multiSelect' | 'select' {
  return t === 'multiSelect' || t === 'select'
}

export function hasFormatOptions(t: FieldTypeSchema): t is 'number' {
  return ['number'].includes(t)
}

export function getDisplayableLink(value: string) {
  return value.replace(/https?:\/\//g, '')
}

export function getFormatOptions(t: 'number') {
  return numberFormatOptions
}

export function buildCustomFieldKey(
  field: AllAvailableCustomFieldSchema
): TypedNameKey {
  return `${field.type}/${field.name}`
}

// e.g. "multiSelect/Field Name" => true
export function isCustomFieldKey(key: string): boolean {
  const type = getPrefixFromMaybeCustomFieldKey(key)
  if (type === null) {
    return false
  }
  return FieldTypes.includes(type)
}

// This util doesn't validate that the prefix is a valid custom field type.
// If you want to do that, use isCustomFieldKey or parseCustomFieldInfoFromMaybeDelimitedKey instead.
//
// e.g. "multiSelect/Field Name" => "multiSelect"
// e.g. "ids" => "ids"
export function getPrefixFromMaybeCustomFieldKey(key: string): string | null {
  const split = key.split('/')
  const maybeResult = split[0]
  if (maybeResult === '') {
    return null
  }
  return maybeResult
}

// e.g. "multiSelect/Field Name" => { customFieldType: "multiSelect", name: "Field Name" }
export function parseCustomFieldInfoFromMaybeDelimitedKey<
  K extends string,
  T = K extends `${infer U}/${string}` ? U : never,
>(key: K): { customFieldType: T; name: string } | null {
  const split = key.split('/')
  if (!isCustomFieldKey(key) || split.length < 2 || split[1] === '') {
    return null
  }
  return {
    customFieldType: split[0] as T,
    name: split.slice(1).join('/'),
  }
}

export const mapCustomFieldToFieldArrayWithValue = <
  T extends AllAvailableCustomFieldSchema,
>(
  field: T,
  customFieldValues: CustomFieldValuesRecord | undefined
): CustomFieldFieldArrayValue => {
  const base: CustomFieldFieldArrayValue = {
    instanceId: field.id,
    name: field.name,
    value: null,
    type: field.type,
  }

  const matchingFieldValue = customFieldValues?.[field.id]
  // If there is no matching field value or is nullish, return a default object
  if (matchingFieldValue == null) {
    return base
  }

  const formValue: CustomFieldFieldArrayValue = {
    ...base,
    value: matchingFieldValue.value as any,
  }
  return formValue
}

export function getHumanReadableCustomFieldType(
  customField: AllAvailableCustomFieldSchema
) {
  return CUSTOM_FIELD_CATEGORIES_RESPONSE.models.customFieldCategories[
    customField.type
  ].name
}
