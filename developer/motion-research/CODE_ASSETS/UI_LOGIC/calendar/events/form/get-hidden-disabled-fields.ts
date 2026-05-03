import { type CalendarEventSchemaV2 } from '@motion/zod/client'

import { type EventFormFields } from './form-fields'

import { getConferenceDataForType } from '../../conference'

export type EventHiddenAndDisabledOptions = {
  initialEvent?: CalendarEventSchemaV2 | null | undefined
  initialEventRecurringParent?: CalendarEventSchemaV2 | null | undefined
  isReadOnly?: boolean
  fromSchedulingTask?: boolean
}

type EventHiddenAndDisabledFields = Pick<
  CalendarEventSchemaV2,
  'recurrence' | 'travelTimeBefore' | 'travelTimeAfter' | 'conferenceType'
>

export function getEventHiddenAndDisabledFields(
  {
    recurrence,
    travelTimeBefore,
    travelTimeAfter,
    conferenceType,
  }: EventHiddenAndDisabledFields,
  {
    initialEvent,
    initialEventRecurringParent,
    isReadOnly = false,
    fromSchedulingTask = false,
  }: EventHiddenAndDisabledOptions
) {
  const hiddenFields: Set<keyof EventFormFields> = new Set()
  const disabledFields: Set<keyof EventFormFields> = new Set()

  // Travel Times is not compatible with recurring events
  if (recurrence != null) {
    hiddenFields.add('travelTimeBefore')
    hiddenFields.add('travelTimeAfter')
  }

  // If the event has travel time, it cannot be recurring
  if (travelTimeBefore != null || travelTimeAfter != null) {
    hiddenFields.add('recurrence')
  }

  // We cannot update the email/host for an existing event
  if (initialEvent != null) {
    disabledFields.add('email')
  }

  // Disable updating the conference type when the event is saved with MS Teams
  // This is because once the event is set with MS Teams, there's no way to remove it when updating
  if (initialEvent != null && initialEvent.conferenceType != null) {
    const confData = getConferenceDataForType(initialEvent.conferenceType)
    if (confData.category === 'teams') {
      disabledFields.add('conferenceType')
    }
  }

  // Don’t show Recurrence, Conference, Location Description and Travel Times if there is none
  if (isReadOnly && initialEvent != null) {
    hiddenFields.add('isAllDay')

    if (!initialEventRecurringParent?.recurrence) {
      hiddenFields.add('recurrence')
    }
    if (initialEvent.conferenceType === 'none') {
      hiddenFields.add('conferenceType')
    }
    if (!initialEvent.location) {
      hiddenFields.add('location')
    }
    if (!initialEvent.description) {
      hiddenFields.add('description')
    }

    if (
      initialEvent.travelTimeBefore == null &&
      initialEvent.travelTimeAfter == null
    ) {
      hiddenFields.add('travelTimeBefore')
      hiddenFields.add('travelTimeAfter')
    }
  }

  // Disabling the location when we use the default location or phone from the user settings
  if (conferenceType === 'customLocation' || conferenceType === 'phone') {
    disabledFields.add('location')
  }

  // From a scheduling task, it means it will be an event in project
  if (fromSchedulingTask || initialEvent?.meetingTaskId != null) {
    hiddenFields.add('isAllDay')
    hiddenFields.add('recurrence')
  }

  return { hiddenFields, disabledFields }
}
