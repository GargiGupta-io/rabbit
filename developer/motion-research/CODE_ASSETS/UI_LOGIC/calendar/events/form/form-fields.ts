import {
  type CalendarEventSchemaV2,
  type NormalTaskSchema,
} from '@motion/rpc-types'
import { type EventConferenceType } from '@motion/shared/common'

import { type CustomFieldFieldArrayValue } from '../../../pm/custom-fields'
import { type ColorId } from '../../calendar'

type EventFields = Pick<
  CalendarEventSchemaV2,
  | 'calendarId'
  | 'email'
  | 'isAllDay'
  | 'start'
  | 'end'
  | 'status'
  | 'title'
  | 'conferenceLink'
  | 'location'
  | 'travelTimeAfter'
  | 'travelTimeBefore'
  | 'recurrence'
  | 'visibility'
  | 'attendees'
> & {
  id: CalendarEventSchemaV2['id'] | undefined
  description: NonNullable<CalendarEventSchemaV2['description']>
  colorId: ColorId | null
  conferenceType: EventConferenceType
}

type MeetingTaskFields = {
  workspaceId: NormalTaskSchema['workspaceId'] | null
  projectId: NormalTaskSchema['projectId'] | null
  stageDefinitionId: NormalTaskSchema['stageDefinitionId'] | null
  labelIds: NormalTaskSchema['labelIds']
  customFieldValuesFieldArray: CustomFieldFieldArrayValue[]
}

export type NotetakerFields = {
  botEnabled: boolean
  sendRecapToAllAttendees: boolean
}

export type EventFormFields = EventFields &
  MeetingTaskFields &
  NotetakerFields & {
    // Metadata fields
    isLoading: boolean
  }

export type MeetingUrlSearchParams = {
  mTask: NormalTaskSchema['id']
}
