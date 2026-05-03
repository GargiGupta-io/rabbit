import {
  type CustomFieldValueFilterSchema,
  type NormalTaskSchema,
  type ProjectSchema,
} from '@motion/zod/client'

import { createDataFilters } from '../../__tests__/utils'
import {
  excludeByCustomField,
  excludeProjectsByCustomField,
} from '../custom-fields'

const START_DATE = '2022-01-01T00:00:00.000Z'

describe('custom field query utils', () => {
  describe('excludeProjectsByCustomField', () => {
    it('should include if matches', () => {
      const state = createDataFilters(
        {},
        {
          text: {
            'text/name': {
              '123': {
                value: 'he',
                operator: 'contains',
              },
            },
          },
          date: {
            'date/start': {
              '456': {
                value: START_DATE,
                operator: 'lte',
              },
            },
          },
        }
      )

      const project: any = {
        id: 'p1',
        workspaceId: 'w1',
        statusId: 's1',
        customFieldValues: {
          '123': {
            type: 'text',
            value: 'hello',
          },
          '456': {
            type: 'date',
            value: START_DATE,
          },
        },
      }

      expect(excludeProjectsByCustomField(state.projects, project)).toBe(false)
    })

    it('should exclude if no matches', () => {
      const state = createDataFilters(
        {},
        {
          text: {
            'text/name': {
              '123': {
                value: 'hez',
                operator: 'contains',
              },
            },
          },
        }
      )

      const project: any = {
        id: 'p1',
        workspaceId: 'w1',
        statusId: 's1',
        customFieldValues: {
          '123': {
            type: 'text',
            value: 'hello',
          },
        },
      }

      expect(excludeProjectsByCustomField(state.projects, project)).toBe(true)
    })
  })

  describe('excludeByCustomField', () => {
    it('should return false if customFieldFilters is null or undefined', () => {
      const entity = {} as unknown as ProjectSchema | NormalTaskSchema

      expect(excludeByCustomField(null as any, entity)).toBe(false)
      expect(excludeByCustomField(undefined, entity)).toBe(false)
    })

    it('should return true if any grouped filter excludes the entity', () => {
      const customFieldFilters = [
        {
          field1: { operator: 'empty', inverse: false },
        },
        {
          field2: { operator: 'contains', value: 'test', inverse: false },
        },
      ] satisfies Record<string, CustomFieldValueFilterSchema>[]
      const entity = {
        customFieldValues: {
          field1: { type: 'text', value: 'not empty' },
          field2: { type: 'text', value: 'no match' },
        },
      } as unknown as ProjectSchema | NormalTaskSchema

      expect(excludeByCustomField(customFieldFilters as any, entity)).toBe(true)
    })

    it('should return false if no grouped filter excludes the entity', () => {
      const customFieldFilters = [
        {
          field1: { operator: 'empty', inverse: true },
        },
        {
          field2: { operator: 'contains', value: 'test', inverse: false },
        },
      ] satisfies Record<string, CustomFieldValueFilterSchema>[]
      const entity = {
        customFieldValues: {
          field1: { type: 'text', value: 'not empty' },
          field2: { type: 'text', value: 'test value' },
        },
      } as unknown as ProjectSchema | NormalTaskSchema

      expect(excludeByCustomField(customFieldFilters as any, entity)).toBe(
        false
      )
    })
  })
})
