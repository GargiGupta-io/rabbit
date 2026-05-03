import {
  type CalendarEventSchemaV2,
  type CreateCalendarEventRequest,
  type CreateCalendarEventResponse,
  type RecurringTaskSchema,
  type ScheduledEntitySchema,
  type TaskSchema,
} from '@motion/rpc-types'
import { extractDateIgnoringTimezone } from '@motion/utils/dates'

import { DateTime } from 'luxon'

import { isReminderTask } from '../task'

export const createTemporaryCalendarEvent = (
  id: string,
  calendarEvent: CreateCalendarEventRequest & { calendarId: string }
): CalendarEventSchemaV2 => {
  return {
    id,
    attendees: calendarEvent.attendees,
    bookingLinkId: calendarEvent.bookingLinkId ?? null,
    calendarId: calendarEvent.calendarId,
    colorId: calendarEvent.colorId ?? null,
    conferenceLink: calendarEvent.conferenceLink ?? null,
    conferenceType: calendarEvent.conferenceType ?? null,
    createdTime: new Date().toISOString(),
    description: calendarEvent.description ?? null,
    end: calendarEvent.end,
    isAllDay: calendarEvent.isAllDay,
    organizer: calendarEvent.organizer ?? null,
    recurrence: calendarEvent.recurrence ?? null,
    status: calendarEvent.status,
    start: calendarEvent.start,
    travelTimeAfter: calendarEvent.travelTimeAfter ?? null,
    travelTimeBefore: calendarEvent.travelTimeBefore ?? null,
    visibility: calendarEvent.visibility,
    title: calendarEvent.title ?? null,
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
    syncSession: { id: 'none', createdTime: new Date().toISOString() },
  }
}

export const createTemporaryScheduledEntity = (
  id: string,
  calendarEvent: CreateCalendarEventRequest | CreateCalendarEventResponse
): ScheduledEntitySchema => {
  return {
    id,
    type: 'EVENT',
    calendarIds:
      'calendarId' in calendarEvent ? [calendarEvent.calendarId] : [],
    schedule: {
      start: calendarEvent.isAllDay
        ? extractDateIgnoringTimezone(calendarEvent.start)
        : calendarEvent.start,
      end: calendarEvent.isAllDay
        ? extractDateIgnoringTimezone(calendarEvent.end)
        : calendarEvent.end,
      timeless: calendarEvent.isAllDay,
    },
    conferenceType:
      'conferenceType' in calendarEvent
        ? (calendarEvent.conferenceType ?? 'none')
        : 'none',
  }
}

export const createOptimisticScheduledEntityFromTask = (
  task: TaskSchema | RecurringTaskSchema,
  currentUserId: string
): ScheduledEntitySchema | undefined => {
  if (task.type !== 'NORMAL' || task.assigneeUserId !== currentUserId)
    return undefined

  const isReminder = isReminderTask(task)
  const start = isReminder ? task.dueDate : task.scheduledStart

  if (!start) return undefined

  return {
    id: task.id,
    type: 'TASK',
    schedule: {
      start: DateTime.fromISO(start).toISO(),
      end: DateTime.fromISO(start)
        .plus({ minutes: task.duration ?? 0 })
        .toISO(),
      timeless: task.duration === 0,
    },
    pastDue: false,
    completed: false,
    statusId: task.statusId,
    unfit: false,
    locked: true,
    scheduleOverriden: false,
    snoozed: false,
    isBlocked: false,
  }
}
