import { DateTime } from 'luxon'

import {
  convertDataFieldsToCreateSchema,
  convertDataFieldsToUpdateSchema,
} from '../convert-data-fields-to-schema'
import { type EventFormFields } from '../form-fields'

describe('convertDataFieldsToCreateSchema', () => {
  const mockData = {
    email: 'organizer@example.com',
    colorId: '1',
    recurrence: 'weekly',
    // additional properties as needed
  } as unknown as EventFormFields

  it('should convert data fields to create schema correctly', () => {
    const result = convertDataFieldsToCreateSchema(mockData)

    expect(result).toEqual({
      ...mockData,
      organizer: { email: 'organizer@example.com' },
      timezone: DateTime.now().zoneName,
      colorId: '1',
      recurrence: 'weekly',
      sendUpdates: true,
    })
  })

  it('should handle undefined colorId', () => {
    const dataWithUndefinedColorId = {
      email: 'organizer@example.com',
      colorId: null,
      recurrence: 'weekly',
    } as unknown as EventFormFields

    const result = convertDataFieldsToCreateSchema(dataWithUndefinedColorId)

    expect(result.colorId).toBeUndefined()
  })
})

describe('convertDataFieldsToUpdateSchema', () => {
  it('should preserve colorId and recurrence when both are provided', () => {
    const data: Partial<EventFormFields> = {
      colorId: '3',
      recurrence: 'monthly',
    }

    const result = convertDataFieldsToUpdateSchema(data)

    expect(result.colorId).toBe('3')
    expect(result.recurrence).toBe('monthly')
  })

  it('should preserve only colorId when recurrence is not provided', () => {
    const data: Partial<EventFormFields> = {
      colorId: '2',
    }

    const result = convertDataFieldsToUpdateSchema(data)

    expect(result.colorId).toBe('2')
    expect(result.recurrence).toBeUndefined()
  })

  it('should preserve only recurrence when colorId is not provided', () => {
    const data: Partial<EventFormFields> = {
      recurrence: 'weekly',
    }

    const result = convertDataFieldsToUpdateSchema(data)

    expect(result.colorId).toBeUndefined()
    expect(result.recurrence).toBe('weekly')
  })

  it('should handle multiple fields correctly', () => {
    const data: Partial<EventFormFields> = {
      colorId: '4',
      recurrence: 'daily',
    }

    const result = convertDataFieldsToUpdateSchema(data)

    expect(result.colorId).toBe('4')
    expect(result.recurrence).toBe('daily')
  })
})
