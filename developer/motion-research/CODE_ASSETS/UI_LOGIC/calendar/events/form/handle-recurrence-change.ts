import { type EventFormFields } from './form-fields'

import { disabledGoogleEventColorIds } from '../../calendar'

export function handleRecurrenceChange(
  newValue: EventFormFields['recurrence'],
  { colorId }: Pick<EventFormFields, 'colorId'>
): Pick<EventFormFields, 'recurrence' | 'colorId'> {
  let nextColorId = colorId

  if (colorId != null && disabledGoogleEventColorIds.includes(colorId)) {
    nextColorId = null
  }

  return {
    recurrence: newValue,
    colorId: nextColorId,
  }
}
