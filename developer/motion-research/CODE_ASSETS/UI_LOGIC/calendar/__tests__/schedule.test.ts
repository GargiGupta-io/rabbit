import { type DayVerbose, type ScheduleByDow } from '@motion/rpc-types'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import {
  convertScheduleIntoEvents,
  convertScheduleIntoEventsByDayOfWeek,
  getDayOfWeekVerbose,
} from '../schedule'

describe('getDayOfWeekVerbose', () => {
  it('should return the correct DayVerbose for a given DateTime', () => {
    const tuesday = DateTime.fromISO('2023-11-07')
    const monday = DateTime.fromISO('2023-11-06')
    const sunday = DateTime.fromISO('2023-11-05')
    const saturday = DateTime.fromISO('2023-11-04')

    expect(getDayOfWeekVerbose(tuesday)).toBe('Tuesday' satisfies DayVerbose)
    expect(getDayOfWeekVerbose(monday)).toBe('Monday' satisfies DayVerbose)
    expect(getDayOfWeekVerbose(sunday)).toBe('Sunday' satisfies DayVerbose)
    expect(getDayOfWeekVerbose(saturday)).toBe('Saturday' satisfies DayVerbose)
  })
})

describe('convertScheduleIntoEventsByDayOfWeek', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-11-07')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  const emptySchedule: ScheduleByDow = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }

  const allWeekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ] as DayVerbose[]

  it('returns empty array for each weekday when there are no schedules', () => {
    const eventsByDow = convertScheduleIntoEventsByDayOfWeek(emptySchedule)
    allWeekdays.forEach((weekday) => {
      const events = eventsByDow[weekday]

      expect(events).toBeTruthy()
      expect(events?.length).toEqual(0)
    })
  })

  it('returns hours based on on the schedule', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9:00am-5:00pm' }],
      Tuesday: [{ range: '9:00am-5:00pm' }],
      Wednesday: [{ range: '9:00am-5:00pm' }],
    }
    const eventsByDow = convertScheduleIntoEventsByDayOfWeek(schedule)
    allWeekdays.forEach((weekday) => {
      const events = eventsByDow[weekday]
      switch (weekday) {
        case 'Monday':
          expect(events).toEqual([
            {
              start: '2023-11-06T09:00:00.000+00:00',
              end: '2023-11-06T17:00:00.000+00:00',
            },
          ])

          break
        case 'Tuesday':
          expect(events).toEqual([
            {
              start: '2023-11-07T09:00:00.000+00:00',
              end: '2023-11-07T17:00:00.000+00:00',
            },
          ])

          break
        case 'Wednesday':
          expect(events).toEqual([
            {
              start: '2023-11-08T09:00:00.000+00:00',
              end: '2023-11-08T17:00:00.000+00:00',
            },
          ])

          break
        case 'Sunday':
        case 'Thursday':
        case 'Friday':
        case 'Saturday':
          expect(events).toBeTruthy()
          expect(events?.length).toEqual(0)

          break
      }
    })
  })

  describe('handles midnight-crossing schedules', () => {
    it('handles midnight-crossing schedules with full notation (1:00pm-2:00am)', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Monday: [{ range: '1:00pm-2:00am' }],
      }
      const eventsByDow = convertScheduleIntoEventsByDayOfWeek(schedule, {
        baseDate: new Date('2023-11-16'),
      })

      expect(eventsByDow.Monday).toEqual([
        {
          start: '2023-11-13T13:00:00.000+00:00',
          end: '2023-11-14T02:00:00.000+00:00', // Next day
        },
      ])
    })

    it('handles midnight-crossing schedules with short notation (1pm-2am)', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Tuesday: [{ range: '1pm-2am' }],
      }
      const eventsByDow = convertScheduleIntoEventsByDayOfWeek(schedule, {
        baseDate: new Date('2023-11-07'),
      })

      expect(eventsByDow.Tuesday).toEqual([
        {
          start: '2023-11-07T13:00:00.000+00:00',
          end: '2023-11-08T02:00:00.000+00:00', // Next day
        },
      ])
    })

    it('handles 24-hour schedule when start and end times are equal (12:00am-12:00am)', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Wednesday: [{ range: '12:00am-12:00am' }],
      }
      const eventsByDow = convertScheduleIntoEventsByDayOfWeek(schedule, {
        baseDate: new Date('2023-11-08'),
      })

      expect(eventsByDow.Wednesday).toEqual([
        {
          start: '2023-11-08T00:00:00.000+00:00',
          end: '2023-11-09T00:00:00.000+00:00', // Full 24 hours
        },
      ])
    })

    it('handles 24-hour schedule with short notation (12am-12am)', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Thursday: [{ range: '12am-12am' }],
      }
      const eventsByDow = convertScheduleIntoEventsByDayOfWeek(schedule, {
        baseDate: new Date('2023-11-09'),
      })

      expect(eventsByDow.Thursday).toEqual([
        {
          start: '2023-11-09T00:00:00.000+00:00',
          end: '2023-11-10T00:00:00.000+00:00', // Full 24 hours
        },
      ])
    })
  })
})

describe('convertScheduleIntoEvents', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-11-07')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  const emptySchedule: ScheduleByDow = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }

  it('returns empty array when there are no schedules', () => {
    const events = convertScheduleIntoEvents(emptySchedule)

    expect(events.length).toBe(0)
  })

  it('returns one event based on the schedule', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9:00am-5:00pm' }],
    }
    const events = convertScheduleIntoEvents(schedule)

    expect(events).toEqual([
      {
        start: '2023-11-06T09:00:00.000+00:00',
        end: '2023-11-06T17:00:00.000+00:00',
      },
    ])
  })

  it('returns 2 events based on the schedule filtering 1 out', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9:00am-5:00pm' }],
      Tuesday: [{ range: '9:00am-5:00pm' }],
      Wednesday: [{ range: '9:00am-5:00pm' }],
    }
    const events = convertScheduleIntoEvents(schedule, {
      dayOfWeekFilter: ['Monday', 'Tuesday'],
    })

    expect(events).toEqual([
      {
        start: '2023-11-06T09:00:00.000+00:00',
        end: '2023-11-06T17:00:00.000+00:00',
      },
      {
        start: '2023-11-07T09:00:00.000+00:00',
        end: '2023-11-07T17:00:00.000+00:00',
      },
    ])
  })

  it('returns 1 events based on the schedule filtering 2 out', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9:00am-5:00pm' }],
      Tuesday: [{ range: '9:00am-5:00pm' }],
      Wednesday: [{ range: '9:00am-5:00pm' }],
    }
    const events = convertScheduleIntoEvents(schedule, {
      dayOfWeekFilter: ['Tuesday'],
    })

    expect(events).toEqual([
      {
        start: '2023-11-07T09:00:00.000+00:00',
        end: '2023-11-07T17:00:00.000+00:00',
      },
    ])
  })

  it('returns no events based on the schedule with day filter', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9:00am-5:00pm' }],
    }
    const events = convertScheduleIntoEvents(schedule, {
      dayOfWeekFilter: ['Tuesday'],
    })

    expect(events).toEqual([])
  })

  it('returns the 3 events with empty days', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9:00am-5:00pm' }],
      Tuesday: [{ range: '9:00am-5:00pm' }],
      Friday: [{ range: '9:00am-5:00pm' }],
    }
    const events = convertScheduleIntoEvents(schedule)

    expect(events).toEqual([
      {
        start: '2023-11-06T09:00:00.000+00:00',
        end: '2023-11-06T17:00:00.000+00:00',
      },
      {
        start: '2023-11-07T09:00:00.000+00:00',
        end: '2023-11-07T17:00:00.000+00:00',
      },
      {
        start: '2023-11-10T09:00:00.000+00:00',
        end: '2023-11-10T17:00:00.000+00:00',
      },
    ])
  })

  it('returns the events based on multiple range for a single day', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9:00am-5:00pm' }],
      Friday: [
        { range: '9:00am-10:00am' },
        { range: '12:00pm-2:00pm' },
        { range: '6:00pm-8:00pm' },
      ],
    }
    const events = convertScheduleIntoEvents(schedule)

    expect(events).toEqual([
      {
        start: '2023-11-06T09:00:00.000+00:00',
        end: '2023-11-06T17:00:00.000+00:00',
      },
      {
        start: '2023-11-10T09:00:00.000+00:00',
        end: '2023-11-10T10:00:00.000+00:00',
      },
      {
        start: '2023-11-10T12:00:00.000+00:00',
        end: '2023-11-10T14:00:00.000+00:00',
      },
      {
        start: '2023-11-10T18:00:00.000+00:00',
        end: '2023-11-10T20:00:00.000+00:00',
      },
    ])
  })

  it('returns with a specific timezone', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9:00am-5:00pm' }],
    }
    const events = convertScheduleIntoEvents(schedule, {
      zone: 'America/Los_Angeles',
    })

    expect(events).toEqual([
      {
        start: '2023-11-06T09:00:00.000-08:00',
        end: '2023-11-06T17:00:00.000-08:00',
      },
    ])
  })

  it('returns with a specific baseDate', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9:00am-5:00pm' }],
    }
    const events = convertScheduleIntoEvents(schedule, {
      baseDate: new Date('2023-11-16'),
    })

    expect(events).toEqual([
      {
        start: '2023-11-13T09:00:00.000+00:00',
        end: '2023-11-13T17:00:00.000+00:00',
      },
    ])
  })

  it('returns events based on schedules time without minutes', () => {
    const schedule: ScheduleByDow = {
      ...emptySchedule,
      Monday: [{ range: '9am-5pm' }],
    }
    const events = convertScheduleIntoEvents(schedule, {
      baseDate: new Date('2023-11-16'),
    })

    expect(events).toEqual([
      {
        start: '2023-11-13T09:00:00.000+00:00',
        end: '2023-11-13T17:00:00.000+00:00',
      },
    ])
  })

  describe('handles midnight-crossing schedules', () => {
    it('handles midnight-crossing schedules with full notation (1:00pm-2:00am)', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Monday: [{ range: '1:00pm-2:00am' }],
      }
      const events = convertScheduleIntoEvents(schedule, {
        baseDate: new Date('2023-11-16'),
      })

      expect(events).toEqual([
        {
          start: '2023-11-13T13:00:00.000+00:00',
          end: '2023-11-14T02:00:00.000+00:00', // Next day
        },
      ])
    })

    it('handles midnight-crossing schedules with short notation (1pm-2am)', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Tuesday: [{ range: '1pm-2am' }],
      }
      const events = convertScheduleIntoEvents(schedule, {
        baseDate: new Date('2023-11-07'),
      })

      expect(events).toEqual([
        {
          start: '2023-11-07T13:00:00.000+00:00',
          end: '2023-11-08T02:00:00.000+00:00', // Next day
        },
      ])
    })

    it('handles 24-hour schedule when start and end times are equal (12:00am-12:00am)', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Wednesday: [{ range: '12:00am-12:00am' }],
      }
      const events = convertScheduleIntoEvents(schedule, {
        baseDate: new Date('2023-11-08'),
      })

      expect(events).toEqual([
        {
          start: '2023-11-08T00:00:00.000+00:00',
          end: '2023-11-09T00:00:00.000+00:00', // Full 24 hours
        },
      ])
    })

    it('handles 24-hour schedule with short notation (12am-12am)', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Thursday: [{ range: '12am-12am' }],
      }
      const events = convertScheduleIntoEvents(schedule, {
        baseDate: new Date('2023-11-09'),
      })

      expect(events).toEqual([
        {
          start: '2023-11-09T00:00:00.000+00:00',
          end: '2023-11-10T00:00:00.000+00:00', // Full 24 hours
        },
      ])
    })
  })

  describe('handle Monday/Sunday as start day', () => {
    it('returns events with the previous Sunday', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Sunday: [{ range: '9:00am-5:00pm' }],
      }
      const events = convertScheduleIntoEvents(schedule, {
        baseDate: new Date('2023-11-16'),
        startingDay: 'sunday',
      })

      expect(events).toEqual([
        {
          start: '2023-11-12T09:00:00.000+00:00',
          end: '2023-11-12T17:00:00.000+00:00',
        },
      ])
    })

    it('returns events with the next Sunday when the start day is Monday', () => {
      const schedule: ScheduleByDow = {
        ...emptySchedule,
        Sunday: [{ range: '9:00am-5:00pm' }],
      }
      const events = convertScheduleIntoEvents(schedule, {
        baseDate: new Date('2023-11-16'),
        startingDay: 'monday',
      })

      expect(events).toEqual([
        {
          start: '2023-11-19T09:00:00.000+00:00',
          end: '2023-11-19T17:00:00.000+00:00',
        },
      ])
    })
  })
})
