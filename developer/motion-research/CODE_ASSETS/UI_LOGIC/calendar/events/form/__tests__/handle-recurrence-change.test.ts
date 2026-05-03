import { type ColorId, disabledGoogleEventColorIds } from '../../../calendar'
import { type EventFormFields } from '../form-fields'
import { handleRecurrenceChange } from '../handle-recurrence-change'

describe('handleRecurrenceChange', () => {
  it('should return the new recurrence value and the original colorId if it is not disabled', () => {
    const newValue: EventFormFields['recurrence'] = 'daily'
    const input = { colorId: '4' as ColorId }

    const result = handleRecurrenceChange(newValue, input)

    expect(result).toEqual({
      recurrence: newValue,
      colorId: '4',
    })
  })

  it('should set colorId to null if the original colorId is disabled', () => {
    const newValue: EventFormFields['recurrence'] = 'weekly'
    const input = { colorId: disabledGoogleEventColorIds[0] as ColorId }

    const result = handleRecurrenceChange(newValue, input)

    expect(result).toEqual({
      recurrence: newValue,
      colorId: null,
    })
  })

  it('should return the new recurrence and null colorId when original colorId is disabled', () => {
    const newValue: EventFormFields['recurrence'] = 'monthly'
    const input = { colorId: null }

    const result = handleRecurrenceChange(newValue, input)

    expect(result).toEqual({
      recurrence: newValue,
      colorId: null,
    })
  })
})
