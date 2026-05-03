import { omit } from '@motion/utils/core'
import { keys, stripUndefined } from '@motion/utils/object'
import {
  type CalendarEventSchemaV2,
  type CreateCalendarEventSchema,
  type UpdateCalendarEventSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { type EventFormFields } from './form-fields'

import { reduceCustomFieldsValuesFieldArrayToRecord } from '../../../pm/project'
import { type ColorId } from '../../calendar'

export function convertDataFieldsToCreateSchema(
  data: EventFormFields,
  {
    initialSchedulingTask,
    isMainCalendar,
  }: {
    initialSchedulingTask?: null | Pick<CalendarEventSchemaV2, 'id'>
    isMainCalendar?: boolean
  } = {}
): CreateCalendarEventSchema & { calendarId: string } {
  const workspaceData =
    initialSchedulingTask != null &&
    data.workspaceId != null &&
    data.projectId != null
      ? {
          schedulingTaskId: initialSchedulingTask.id,
          workspaceId: data.workspaceId,
          projectId: data.projectId,
          labelIds: data.labelIds,
          customFieldValues: reduceCustomFieldsValuesFieldArrayToRecord(
            data.customFieldValuesFieldArray,
            { omitNull: true }
          ),
        }
      : data.workspaceId != null && data.projectId != null
        ? {
            workspaceId: data.workspaceId,
            projectId: data.projectId,
          }
        : undefined

  const meetingInsightsData =
    data.botEnabled != null &&
    data.sendRecapToAllAttendees != null &&
    isMainCalendar
      ? {
          botEnabled: data.botEnabled,
          sendRecapToAllAttendees: data.sendRecapToAllAttendees,
        }
      : undefined

  let baseData = data

  if (workspaceData != null) {
    baseData = omit(data, keys(workspaceData)) as EventFormFields
  }
  if (meetingInsightsData != null) {
    baseData = omit(baseData, keys(meetingInsightsData)) as EventFormFields
  }

  return stripUndefined({
    ...baseData,
    organizer: {
      email: data.email,
    },
    timezone: DateTime.now().zoneName,
    colorId: (data.colorId as ColorId | null) ?? undefined,
    recurrence: data.recurrence ?? undefined,
    workspaceData,
    meetingInsightsData,
    // In create mode, we always send updates
    sendUpdates: true,
  })
}

export function convertDataFieldsToUpdateSchema(
  data: Partial<EventFormFields>
): UpdateCalendarEventSchema {
  return stripUndefined({
    ...data,
    recurrence: data.recurrence ?? undefined,
  })
}
