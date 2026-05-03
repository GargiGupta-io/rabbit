import { type EventConferenceType } from '@motion/rpc-types'
import { type EmailAccount } from '@motion/rpc-types/legacy'
import { parseDate, roundTime, shiftDateToZone } from '@motion/utils/dates'
import {
  type CalendarEventSchemaV2,
  type NormalTaskSchema,
  type RecurringTaskSchema,
  type TaskSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { type NotetakerFields } from './form-fields'
import { getValidConferenceTypeForProvider } from './handle-guests-change'

import {
  type AllAvailableCustomFieldSchema,
  mapCustomFieldToFieldArrayWithValue,
} from '../../../pm'
import { type ColorId } from '../../calendar'

export type InitialFormOptions = {
  isLoading?: boolean
  event?: CalendarEventSchemaV2 | null | undefined
  task?: NormalTaskSchema | null | undefined
}

export function getInitialEventFormData({
  mainCalendarId,
  mainEmailAccount,
  settingConferenceType,
  eventRecurringParent,
  workspaceCustomFields,
  defaultValues = {},
  options,
}: {
  mainCalendarId: string | null | undefined
  mainEmailAccount?: Pick<EmailAccount, 'email' | 'providerType'>
  settingConferenceType: EventConferenceType
  eventRecurringParent?: Pick<CalendarEventSchemaV2, 'recurrence'> | null
  workspaceCustomFields: AllAvailableCustomFieldSchema[]
  defaultValues?: Partial<CalendarEventSchemaV2 & NotetakerFields>
  options: InitialFormOptions
}) {
  const { id: eventId, start, end, isAllDay, attendees, title } = defaultValues
  const { isLoading = false, event, task } = options

  const startStr =
    event != null
      ? event.isAllDay
        ? shiftDateToZone(event.start, 'utc').toISODate()
        : event.start
      : (start ?? roundTime(DateTime.now(), 15).toISO())
  const endStr =
    event != null
      ? event.isAllDay
        ? shiftDateToZone(event.end, 'utc').toISODate()
        : event.end
      : (end ?? parseDate(startStr).plus({ minutes: 30 }).toISO())

  const finalAttendees = attendees ?? event?.attendees ?? []

  // Check if there are any guests (non-organizer attendees)
  const hasGuests = finalAttendees.some((attendee) => !attendee.isOrganizer)

  // For existing events, preserve the conference type from the event or defaultValues
  // to prevent it from being recalculated during updates like RSVP.
  // Only use the default logic (based on guests) for new events.
  const isExistingEvent = eventId != null || event?.id != null

  let finalConferenceType: EventConferenceType
  if (isAllDay) {
    finalConferenceType = 'none'
  } else if (isExistingEvent) {
    // For existing events, preserve the conference type - don't recalculate
    finalConferenceType =
      event?.conferenceType ?? defaultValues.conferenceType ?? 'none'
  } else {
    // For new events, use event's conference type, defaultValues, or calculate based on guests
    finalConferenceType =
      event?.conferenceType ??
      defaultValues.conferenceType ??
      (hasGuests
        ? getValidConferenceTypeForProvider(
            settingConferenceType,
            mainEmailAccount?.providerType ?? 'GOOGLE'
          )
        : 'none')
  }

  return {
    isLoading: isLoading,

    // Event fields
    id: eventId,
    calendarId: event?.calendarId ?? mainCalendarId ?? '',
    colorId: (event?.colorId ?? null) as ColorId | null,
    email: event?.email ?? mainEmailAccount?.email ?? '',
    isAllDay: isAllDay ?? event?.isAllDay ?? false,
    start: startStr,
    end: endStr,
    recurrence: eventRecurringParent?.recurrence ?? event?.recurrence ?? null,
    status: isAllDay ? 'FREE' : (event?.status ?? 'BUSY'),
    title: title ?? event?.title ?? '',
    description: event?.description ?? '',
    conferenceLink: event?.conferenceLink ?? null,
    conferenceType: finalConferenceType,
    location: event?.location ?? null,
    travelTimeAfter: event?.travelTimeAfter ?? null,
    travelTimeBefore: event?.travelTimeBefore ?? null,
    visibility: event?.visibility ?? 'DEFAULT',
    attendees: finalAttendees,

    // Meeting task fields
    workspaceId: getTaskPropValue(task, 'workspaceId', null),
    projectId: getTaskPropValue(task, 'projectId', null),
    stageDefinitionId: getTaskPropValue(task, 'stageDefinitionId', null),
    labelIds: getTaskPropValue(task, 'labelIds', [] as string[]),
    customFieldValuesFieldArray: workspaceCustomFields.map((field) =>
      mapCustomFieldToFieldArrayWithValue(
        field,
        getTaskPropValue(task, 'customFieldValues', {})
      )
    ),

    // Notetaker fields
    botEnabled: defaultValues.botEnabled ?? false,
    sendRecapToAllAttendees: defaultValues.sendRecapToAllAttendees ?? false,
  }
}

function getTaskPropValue<T extends keyof NormalTaskSchema, F>(
  item: TaskSchema | RecurringTaskSchema | null | undefined,
  prop: T,
  fallback: F
) {
  if (!item) return fallback

  if (item.type === 'NORMAL') {
    return item[prop] ?? fallback
  }

  return fallback
}
