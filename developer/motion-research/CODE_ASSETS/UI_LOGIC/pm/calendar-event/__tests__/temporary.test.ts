import { type TaskSchema } from '@motion/zod/client'

import tk from 'timekeeper'

import {
  createOptimisticScheduledEntityFromTask,
  createTemporaryCalendarEvent,
  createTemporaryScheduledEntity,
} from '../temporary'

describe('createTemporaryCalendarEvent', () => {
  beforeEach(() => {
    const frozenTime = new Date('2024-06-10T18:41:48.844113-04:00')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  it('should create a temporary calendar event', () => {
    const calendarEvent = createTemporaryCalendarEvent('<none>', {
      attendees: [],
      bookingLinkId: '',
      calendarId: 'calendarId',
      colorId: '0',
      conferenceLink: '',
      description: 'description',
      end: 'date-end',
      isAllDay: false,
      organizer: { email: 'organizer@example.com' },
      recurrence: '',
      status: 'FREE',
      start: 'date-start',
      travelTimeAfter: null,
      travelTimeBefore: null,
      visibility: 'DEFAULT',
      title: 'title',
      timezone: 'tz',
      conferenceType: 'none',
    })

    expect(calendarEvent).toMatchObject({
      id: '<none>',
      attendees: [],
      bookingLinkId: '',
      calendarId: 'calendarId',
      colorId: '0',
      conferenceLink: '',
      description: 'description',
      end: 'date-end',
      isAllDay: false,
      organizer: { email: 'organizer@example.com' },
      recurrence: '',
      status: 'FREE',
      start: 'date-start',
      travelTimeAfter: null,
      travelTimeBefore: null,
      visibility: 'DEFAULT',
      title: 'title',
      calendarUniqueId: '',
      areAttendeesHidden: null,
      canAttendeesInvite: null,
      canAttendeesModify: null,
      email: '',
      iCalUid: '',
      isCancelled: false,
      isDeleted: false,
      isPendingSync: false,
      location: null,
      providerId: '',
      recurringEventId: '',
      teamTaskId: null,
      type: 'NORMAL',
      url: '',
      recurringParentId: null,
    })
  })

  it('should create a temporary event scheduled entity', () => {
    const scheduledEntity = createTemporaryScheduledEntity('<none>', {
      attendees: [],
      bookingLinkId: '',
      calendarId: 'calendarId',
      colorId: '0',
      conferenceLink: '',
      description: 'description',
      end: 'date-end',
      isAllDay: false,
      organizer: { email: 'organizer@example.com' },
      recurrence: '',
      status: 'FREE',
      start: 'date-start',
      travelTimeAfter: null,
      travelTimeBefore: null,
      visibility: 'DEFAULT',
      title: 'title',
      timezone: 'tz',
      conferenceType: 'none',
    })

    expect(scheduledEntity).toMatchObject({
      id: '<none>',
      type: 'EVENT',
      calendarIds: ['calendarId'],
      schedule: {
        start: 'date-start',
        end: 'date-end',
        timeless: false,
      },
      conferenceType: 'none',
    })
  })

  it('should create an all day temporary event scheduled entity', () => {
    const scheduledEntity = createTemporaryScheduledEntity('<none>', {
      attendees: [],
      bookingLinkId: '',
      calendarId: 'calendarId',
      colorId: '0',
      conferenceLink: '',
      description: 'description',
      end: '2024-10-19T00:00:00.000Z',
      isAllDay: true,
      organizer: { email: 'organizer@example.com' },
      recurrence: '',
      status: 'FREE',
      start: '2024-10-18T00:00:00.000Z',
      travelTimeAfter: null,
      travelTimeBefore: null,
      visibility: 'DEFAULT',
      title: 'title',
      timezone: 'tz',
      conferenceType: 'none',
    })

    expect(scheduledEntity).toMatchObject({
      id: '<none>',
      type: 'EVENT',
      calendarIds: ['calendarId'],
      schedule: {
        start: '2024-10-18',
        end: '2024-10-19',
        timeless: true,
      },
      conferenceType: 'none',
    })
  })

  it('should create a temporary scheduled entity from a task', () => {
    const scheduledEntity = createOptimisticScheduledEntityFromTask(
      {
        id: '<none>',
        type: 'NORMAL',
        duration: 30,
        scheduledStart: '2024-06-10T18:00:00Z',
        statusId: 'status1',
        assigneeUserId: 'user1',
      } as unknown as TaskSchema,
      'user1'
    )

    expect(scheduledEntity).toMatchObject({
      id: '<none>',
      type: 'TASK',
      schedule: {
        start: '2024-06-10T18:00:00.000+00:00',
        end: '2024-06-10T18:30:00.000+00:00',
        timeless: false,
      },
      pastDue: false,
      completed: false,
      statusId: 'status1',
      unfit: false,
      locked: true,
      scheduleOverriden: false,
      snoozed: false,
      isBlocked: false,
    })
  })
})
