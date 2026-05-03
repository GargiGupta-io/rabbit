import { type CalendarEventSchemaV2 } from '@motion/zod/client'

import { getEventHiddenAndDisabledFields } from '../get-hidden-disabled-fields'

describe('getEventHiddenAndDisabledFields', () => {
  const defaultEvent = {
    id: 'event-id',
    conferenceType: 'none',
    recurrence: null,
    location: null,
    description: null,
    travelTimeBefore: null,
    travelTimeAfter: null,
  } as CalendarEventSchemaV2
  const parentEvent = {
    id: 'parent-event-id',
    conferenceType: 'none',
    recurrence: 'RRULE:FREQ=WEEKLY;WKST=MO;INTERVAL=2;BYDAY=FR',
    location: null,
    description: null,
    travelTimeBefore: null,
    travelTimeAfter: null,
  } as CalendarEventSchemaV2

  it('should hide travel time fields if recurrence is provided', () => {
    const result = getEventHiddenAndDisabledFields(
      {
        recurrence: 'daily',
        travelTimeBefore: null,
        travelTimeAfter: null,
        conferenceType: 'none',
      },
      { initialEvent: undefined, isReadOnly: false }
    )

    expect(result.hiddenFields.has('travelTimeBefore')).toBe(true)
    expect(result.hiddenFields.has('travelTimeAfter')).toBe(true)
  })

  it('should hide recurrence field if travel times are provided', () => {
    const result = getEventHiddenAndDisabledFields(
      {
        recurrence: null,
        travelTimeBefore: 30,
        travelTimeAfter: null,
        conferenceType: 'none',
      },
      { initialEvent: undefined, isReadOnly: false }
    )

    expect(result.hiddenFields.has('recurrence')).toBe(true)
  })

  it('should disable email field if an id is provided', () => {
    const result = getEventHiddenAndDisabledFields(
      {
        recurrence: null,
        travelTimeBefore: null,
        travelTimeAfter: null,
        conferenceType: 'none',
      },
      { initialEvent: defaultEvent, isReadOnly: false }
    )

    expect(result.disabledFields.has('email')).toBe(true)
  })

  it('should disable conferenceType field if initialEvent has a conferenceType set to MS Teams', () => {
    const result = getEventHiddenAndDisabledFields(
      {
        recurrence: null,
        travelTimeBefore: null,
        travelTimeAfter: null,
        conferenceType: 'none',
      },
      {
        initialEvent: { ...defaultEvent, conferenceType: 'teamsForBusiness' },
        isReadOnly: false,
      }
    )

    expect(result.disabledFields.has('conferenceType')).toBe(true)
  })

  it('should not disable conferenceType field if initialEvent does not have a conferenceType or is not MS Teams', () => {
    const result = getEventHiddenAndDisabledFields(
      {
        recurrence: null,
        travelTimeBefore: null,
        travelTimeAfter: null,
        conferenceType: 'none',
      },
      {
        initialEvent: { ...defaultEvent, conferenceType: 'zoom' },
        isReadOnly: false,
      }
    )

    expect(result.disabledFields.has('conferenceType')).toBe(false)
  })

  it('should return empty hidden and disabled fields if no conditions are met', () => {
    const result = getEventHiddenAndDisabledFields(
      {
        recurrence: null,
        travelTimeBefore: null,
        travelTimeAfter: null,
        conferenceType: 'none',
      },
      { initialEvent: undefined, isReadOnly: false }
    )

    expect(result.hiddenFields.size).toBe(0)
    expect(result.disabledFields.size).toBe(0)
  })

  it('returns fields as hidden when blank and readOnly', () => {
    const result = getEventHiddenAndDisabledFields(defaultEvent, {
      initialEvent: defaultEvent,
      isReadOnly: true,
    })

    expect(Array.from(result.hiddenFields)).toEqual([
      'isAllDay',
      'recurrence',
      'conferenceType',
      'location',
      'description',
      'travelTimeBefore',
      'travelTimeAfter',
    ])
  })

  it('returns disabled location for custom location conference type', () => {
    const result = getEventHiddenAndDisabledFields(
      { ...defaultEvent, conferenceType: 'customLocation' },
      {
        initialEvent: defaultEvent,
        isReadOnly: false,
      }
    )

    expect(Array.from(result.disabledFields)).toContain('location')
  })

  it('returns disabled location for phone conference type', () => {
    const result = getEventHiddenAndDisabledFields(
      { ...defaultEvent, conferenceType: 'phone' },
      {
        initialEvent: defaultEvent,
        isReadOnly: false,
      }
    )

    expect(Array.from(result.disabledFields)).toContain('location')
  })

  it('returns recurrence field as visible when readonly and recurring', () => {
    const result = getEventHiddenAndDisabledFields(
      {
        ...defaultEvent,
      },
      {
        initialEvent: { ...defaultEvent, recurringParentId: parentEvent.id },
        initialEventRecurringParent: parentEvent,
        isReadOnly: true,
      }
    )

    expect(Array.from(result.hiddenFields)).not.toContain('recurrence')
  })

  describe('from a scheduling task', () => {
    it('returns hidden isAllDay and recurrence', () => {
      const result = getEventHiddenAndDisabledFields(defaultEvent, {
        fromSchedulingTask: true,
      })

      const hiddenFields = Array.from(result.hiddenFields)

      expect(hiddenFields).toContain('isAllDay')
      expect(hiddenFields).toContain('recurrence')
    })
  })

  describe('from a meeting task', () => {
    it('returns hidden isAllDay and recurrence', () => {
      const result = getEventHiddenAndDisabledFields(defaultEvent, {
        initialEvent: {
          ...defaultEvent,
          meetingTaskId: 'meeting-task-1',
        },
      })

      const hiddenFields = Array.from(result.hiddenFields)

      expect(hiddenFields).toContain('isAllDay')
      expect(hiddenFields).toContain('recurrence')
    })
  })
})
