import { EventConferenceTypes, ShortTextSchema } from '@motion/shared/common'

import { z } from 'zod/v4'

import { BaseSchema } from './base'

import { IsoDateTimeSchema } from '../common'

export const AttendeeStatusSchema = z.enum([
  'needsAction',
  'declined',
  'tentative',
  'accepted',
])

export const EventStatusSchema = z.enum(['BUSY', 'FREE'])

export const EventTypeSchema = z.enum([
  'UNKNOWN',
  'BOOKING',
  'EXTERNAL_EVENT',
  'NORMAL',
  'RECURRING_EVENT',
  'TASK',
])

export const EventVisibilitySchema = z.enum([
  'CONFIDENTIAL',
  'DEFAULT',
  'PUBLIC',
  'PRIVATE',
])

export const CalendarEventAttendeeSchemaV2 = z.object({
  displayName: z.string().optional(),
  email: z.string(),
  isOptional: z.boolean(),
  isOrganizer: z.boolean(),
  status: AttendeeStatusSchema.optional(),
})

export const CalendarEventOrganizerV2 = z.object({
  displayName: z.string().optional(),
  email: z.string().optional(),
})

export const CalendarEventSchema = BaseSchema.extend({
  /**
   * Whether attendees are hidden (not currently used)
   */
  areAttendeesHidden: z.boolean().nullable(),
  /**
   * Attendees (if any)
   */
  attendees: z.array(CalendarEventAttendeeSchemaV2),
  /**
   * The bookingLinkId for an event created from a booking link
   */
  bookingLinkId: z.string().nullable(),
  /**
   * The external provider ID of the calendar that the event belongs to
   */
  calendarId: z.string().nullable(),
  /**
   * A "unique" calendar ID for the event. For calendars stored in cockroach,
   * this will match `calendarId`. For calendars stored in Firestore, this will
   * contain a computed ID which matches the IDs return via the `/calendars`
   * endpoint.
   */
  calendarUniqueId: z.string().nullable(),
  /**
   * Whether attendees can edit the attendees field (not currently used)
   */
  canAttendeesInvite: z.boolean().nullable(),
  /**
   * Whether attendees can modify the event (not currently used)
   */
  canAttendeesModify: z.boolean().nullable(),
  /**
   * A provider-specific color value.
   */
  colorId: z.string().nullable(),
  /**
   * If the event provider is APPLE, then this is the color hue of the original
   * color value. If the user overrides the colorId, then this will be null.
   */
  // colorHue: z.number().nullable(),
  /**
   * Conference link. Depending on whether this event is `isTemporary` or not,
   * the conference link may take some time to populate.
   */
  conferenceLink: z.string().nullable(),
  /**
   * This is a derived field based on the conference link. The logic for this used to live
   * in the client upon parsing this schema, so we are just moving that logic into the backend
   */
  conferenceType: z.enum(EventConferenceTypes).optional(),
  /**
   * This is the created time of the event. Note: not created time of the DB
   * entry, but actual created time of the event from the provider
   */
  createdTime: IsoDateTimeSchema,
  /**
   * Event description. This may be plaintext or HTML depending on the provider
   */
  // TODO: Disabled for now.  Maybe just use a truncated version in the future
  // description: z.string().nullable(),
  /**
   * Email address that the event belongs to.
   */
  email: z.string(),
  /**
   * End date ISO string
   */
  end: IsoDateTimeSchema,
  /**
   * Whether the event is an all-day event. The times within the start/end dates
   * should be ignored if this is true
   */
  isAllDay: z.boolean(),
  /**
   * Globally unique identifier for the event
   */
  iCalUid: z.string().nullable(),
  /**
   * TODO - not sure if useful
   */
  isCancelled: z.boolean(),
  /**
   * Whether the calendar event is deleted
   */
  isDeleted: z.boolean(),
  /**
   * If true, the event exists in Motion internally, but has not been persisted
   * to the external calendar yet. Certain fields (such as etag) may be null.
   * The ideal state on the frontend would be to prevent editing of these events
   * and show a spinner until calendar-sync updates the sync session with
   * fully persisted events. Once sync is complete, this will flip to false.
   */
  isPendingSync: z.boolean(),
  /**
   * Internal identifier of the event
   */
  id: z.string(),
  /**
   * The event location - the exact value varies on the provider, but is usually
   * a conference link or physical address.
   */
  location: z.string().nullable(),
  /**
   * If the event has attendees, this usually represents the user/email that
   * created the event.
   */
  organizer: CalendarEventOrganizerV2.nullable(),
  /**
   * External provider ID of the calendar event
   */
  providerId: z.string(),
  /**
   * If the `type` is `RECURRING_EVENT`, then this should be populated with an
   * RRULE value
   */
  recurrence: z.string().nullable(),
  /**
   * References the recurring event parent if the current event is an instance
   * of the recurring event
   */
  recurringEventId: z.string().nullable(),
  /**
   * Event status/transparency
   */
  status: EventStatusSchema,
  /**
   * Start date ISO string
   */
  start: IsoDateTimeSchema,

  /**
   * If the `type` of the event is `TASK`, then this should reference the
   * task.
   */
  teamTaskId: z.string().nullable(),
  /**
   * Title of the event
   */
  title: z.string(),
  /**
   * Travel time in minutes after the event
   */
  travelTimeAfter: z.number().nullable(),
  /**
   * Travel time in minutes before the event
   */
  travelTimeBefore: z.number().nullable(),
  /**
   * Type of the event
   */
  type: EventTypeSchema.catch('UNKNOWN'),
  /**
   * URL of the event
   */
  url: z.string().nullable(),
  /**
   * Visibility of the event. In general this affects shared calendars and
   * whether certain events are visible to users with read access
   */
  visibility: EventVisibilitySchema,
  /**
   * The calendar event id of the recurring parent if it exists
   */
  /**
   * The associated meeting task id if it exists
   */
  meetingTaskId: ShortTextSchema.optional(),
})

export type CalendarEventSchema = z.infer<typeof CalendarEventSchema>
