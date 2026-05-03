import { type FieldTypeSchema } from '@motion/shared/custom-fields'
import { CUSTOM_FIELDS_VALIDATIONS } from '@motion/zod/client'

import { CUSTOM_FIELD_CATEGORIES_RESPONSE } from '../consts'
import { numberFormatOptions } from '../number'
import { type AllAvailableCustomFieldSchema } from '../types'
import {
  buildCustomFieldKey,
  getCreateCustomFieldErrorMsg,
  getDisplayableLink,
  getFormatOptions,
  getHumanReadableCustomFieldType,
  getNameValidationRules,
  getOptionValidationRules,
  getPrefixFromMaybeCustomFieldKey,
  getTextLengthValidationRules,
  hasFormatOptions,
  hasOptions,
  isCustomFieldKey,
  isMaxNumberWorkspaceFields,
  mapCustomFieldToFieldArrayWithValue,
  parseCustomFieldInfoFromMaybeDelimitedKey,
} from '../utils'

describe('utils', () => {
  describe('getPrefixFromMaybeCustomFieldKey', () => {
    it('should return the type from a slash-delimited key', () => {
      const key = 'type/value'
      const result = getPrefixFromMaybeCustomFieldKey(key)

      expect(result).toEqual('type')
    })

    it('should return the type from a key without a slash', () => {
      const key = 'type'
      const result = getPrefixFromMaybeCustomFieldKey(key)

      expect(result).toEqual('type')
    })

    it('should return null for an empty key', () => {
      const key = ''
      const result = getPrefixFromMaybeCustomFieldKey(key)

      expect(result).toEqual(null)
    })
  })

  describe('getCustomFieldTypeAndNameFromMaybeSlashDelimitedKey', () => {
    it('should return null for invalid keys', () => {
      const invalidKeys = ['notCustomField/key', 'type', 'text/']

      invalidKeys.forEach((key) => {
        const result = parseCustomFieldInfoFromMaybeDelimitedKey(key)

        expect(result).toBeNull()
      })
    })

    it('should return the correct type and name for valid keys', () => {
      const validKeys = [
        'text/name',
        'multiSelect/name/with/slashes',
        'select/another/name',
      ]

      const expectedResults = [
        { customFieldType: 'text', name: 'name' },
        { customFieldType: 'multiSelect', name: 'name/with/slashes' },
        { customFieldType: 'select', name: 'another/name' },
      ]

      validKeys.forEach((key, index) => {
        const result = parseCustomFieldInfoFromMaybeDelimitedKey(key)

        expect(result).toEqual(expectedResults[index])
      })
    })

    describe('getNameValidationRules', () => {
      it('should return the validation rules for the given field type', () => {
        const type = 'text'
        const rules = getNameValidationRules(type)

        expect(rules.required).toBe(true)
        expect(rules.maxLength).toBe(
          CUSTOM_FIELDS_VALIDATIONS.categories[type].name.maxLength
        )
      })
    })

    describe('getOptionValidationRules', () => {
      it('should return the validation rules for the given field type', () => {
        const types: Extract<
          FieldTypeSchema,
          'select' | 'multiSelect' | 'multiPerson'
        >[] = ['select', 'multiSelect', 'multiPerson']
        types.forEach((type) => {
          const rules = getOptionValidationRules(type)

          expect(rules.required).toBe(true)
          expect(rules.maxLength).toBe(
            CUSTOM_FIELDS_VALIDATIONS.categories[type].options.maxLength
          )
          expect(rules.maxOptions).toBe(
            CUSTOM_FIELDS_VALIDATIONS.categories[type].options.maxOptions
          )
        })
      })
    })

    describe(getTextLengthValidationRules, () => {
      it('should return the correct values for text, url, and number', () => {
        const textRules = getTextLengthValidationRules('text')

        expect(textRules.maxLength).toBe(
          CUSTOM_FIELDS_VALIDATIONS.categories.text.value.maxLength
        )

        const urlRules = getTextLengthValidationRules('url')

        expect(urlRules.maxLength).toBe(
          CUSTOM_FIELDS_VALIDATIONS.categories.url.value.maxLength
        )
      })
    })

    describe('getCreateCustomFieldErrorMsg', () => {
      it('should return the error message if no code case', () => {
        const error = new Error('Some error')
        const name = 'Field Name'
        const errorMsg = getCreateCustomFieldErrorMsg(error, name)

        expect(errorMsg).toBe(error.message)
      })

      it('should return a specific error message if the status is 409', () => {
        const error = new Error('nooo')
        ;(error as any).status = 409
        const name = 'Field Name'
        const errorMsg = getCreateCustomFieldErrorMsg(error, name)

        expect(errorMsg).toBe(
          `Custom Field with name ${name} already exists on this workspace.`
        )
      })
    })

    describe('hasOptions', () => {
      it('should return true for fields with options', () => {
        const multiSelectField = {
          type: 'multiSelect' as const,
          id: '1',
          name: 'test',
          workspaceId: 'workspace1',
          metadata: {
            options: [
              {
                id: 'opt1',
                value: 'Option 1',
                color: '#000000',
                deletedTime: null,
              },
            ],
          },
        } as AllAvailableCustomFieldSchema
        const selectField = {
          type: 'select' as const,
          id: '2',
          name: 'test',
          workspaceId: 'workspace1',
          metadata: {
            options: [
              {
                id: 'opt1',
                value: 'Option 1',
                color: '#000000',
                deletedTime: null,
              },
            ],
          },
        } as AllAvailableCustomFieldSchema

        expect(hasOptions(multiSelectField)).toBe(true)
        expect(hasOptions(selectField)).toBe(true)
      })

      it('should return false for fields without options', () => {
        const textField = {
          type: 'text' as const,
          id: '1',
          name: 'test',
          workspaceId: 'workspace1',
        } as AllAvailableCustomFieldSchema
        const numberField = {
          type: 'number' as const,
          id: '2',
          name: 'test',
          workspaceId: 'workspace1',
        } as AllAvailableCustomFieldSchema

        expect(hasOptions(textField)).toBe(false)
        expect(hasOptions(numberField)).toBe(false)
      })
    })

    describe(hasFormatOptions, () => {
      it('should return true for number field types', () => {
        expect(hasFormatOptions('number')).toBe(true)
      })

      it('should return false for other field types', () => {
        expect(hasFormatOptions('text')).toBe(false)
        expect(hasFormatOptions('multiSelect')).toBe(false)
        expect(hasFormatOptions('select')).toBe(false)
      })
    })
  })

  describe(getDisplayableLink, () => {
    it('should remove http:// and https:// from the beginning of a string', () => {
      const value = 'https://some-url.com'

      expect(getDisplayableLink(value)).toBe('some-url.com')

      const value2 = 'http://use-motion.com'

      expect(getDisplayableLink(value2)).toBe('use-motion.com')
    })

    it('should leave a regular string unchanged', () => {
      const value = 'some string1234;0-/.[];'

      expect(getDisplayableLink(value)).toBe(value)
    })
  })

  describe('isMaxNumberWorkspaceFields', () => {
    it('should return true when current is equal to maxFields', () => {
      const current = 25
      const result = isMaxNumberWorkspaceFields(current)

      expect(result).toBe(true)
    })

    it('should return true when current is greater than maxFields', () => {
      const current = 26
      const result = isMaxNumberWorkspaceFields(current)

      expect(result).toBe(true)
    })

    it('should return false when current is less than maxFields', () => {
      const current = 24
      const result = isMaxNumberWorkspaceFields(current)

      expect(result).toBe(false)
    })
  })

  describe('isCustomFieldKey', () => {
    it('should return true for valid custom field keys', () => {
      expect(isCustomFieldKey('text/Field Name')).toBe(true)
      expect(isCustomFieldKey('multiSelect/Options Field')).toBe(true)
      expect(isCustomFieldKey('number/Count')).toBe(true)
    })

    it('should return false for invalid custom field keys', () => {
      expect(isCustomFieldKey('invalid/Field')).toBe(false)
      expect(isCustomFieldKey('/')).toBe(false)
      expect(isCustomFieldKey('')).toBe(false)
    })
  })

  describe('mapCustomFieldToFieldArrayWithValue', () => {
    const field = {
      id: 'field1',
      name: 'Test Field',
      type: 'text' as const,
      workspaceId: 'workspace1',
    } as AllAvailableCustomFieldSchema

    it('should return base object when no custom field values provided', () => {
      const result = mapCustomFieldToFieldArrayWithValue(field, undefined)

      expect(result).toEqual({
        instanceId: 'field1',
        name: 'Test Field',
        type: 'text',
        value: null,
      })
    })

    it('should return object with value when custom field values exist', () => {
      const customFieldValues = {
        field1: { value: 'test value', type: 'text' as const },
      }

      const result = mapCustomFieldToFieldArrayWithValue(
        field,
        customFieldValues
      )

      expect(result).toEqual({
        instanceId: 'field1',
        name: 'Test Field',
        type: 'text',
        value: 'test value',
      })
    })

    it('should return base object when matching field value is null', () => {
      const customFieldValues = {
        field1: { value: null, type: 'text' as const },
      }

      const result = mapCustomFieldToFieldArrayWithValue(
        field,
        customFieldValues
      )

      expect(result).toEqual({
        instanceId: 'field1',
        name: 'Test Field',
        type: 'text',
        value: null,
      })
    })
  })

  describe('getHumanReadableCustomFieldType', () => {
    it('should return human readable name for custom field type', () => {
      const textField = {
        type: 'text' as const,
        id: '1',
        name: 'test',
        workspaceId: 'workspace1',
      } as AllAvailableCustomFieldSchema
      const multiSelectField = {
        type: 'multiSelect' as const,
        id: '2',
        name: 'test',
        workspaceId: 'workspace1',
        metadata: {
          options: [
            {
              id: 'opt1',
              value: 'Option 1',
              color: '#000000',
              deletedTime: null,
            },
          ],
        },
      } as AllAvailableCustomFieldSchema

      expect(getHumanReadableCustomFieldType(textField)).toBe(
        CUSTOM_FIELD_CATEGORIES_RESPONSE.models.customFieldCategories.text.name
      )
      expect(getHumanReadableCustomFieldType(multiSelectField)).toBe(
        CUSTOM_FIELD_CATEGORIES_RESPONSE.models.customFieldCategories
          .multiSelect.name
      )
    })
  })

  describe('getFormatOptions', () => {
    it('should return number format options for number type', () => {
      expect(getFormatOptions('number')).toBe(numberFormatOptions)
    })
  })

  describe('buildCustomFieldKey', () => {
    it('should return a key for a custom field', () => {
      const field = {
        type: 'text',
        name: 'Test Field',
      } as AllAvailableCustomFieldSchema

      expect(buildCustomFieldKey(field)).toBe('text/Test Field')
    })
  })
})
