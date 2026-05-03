import { type EventConferenceType } from '@motion/shared/common'
import {
  type CalendarEventSchemaV2,
  type CalendarProviderTypeSchema,
  type ChunkTaskSchema,
  type MeetingInsightsSchema,
  type ScheduledBlockingTimeslotSchema,
  type ScheduledEventSchema,
  type ScheduledTaskChunkSchema,
  type ScheduledTaskSchema,
  type TaskSchema,
} from '@motion/zod/client'

export interface DesktopSettings {
  openAtLaunch?: boolean
  shortcuts: {
    addTask: string
    openCalendar: string
    openProjectManager: string
    openScheduler: string
  }
}

export type DesktopDistribution = 'microsoft' | 'github' | 'apple'

export type Tab = {
  id: string
  title: string
  active: boolean
}

// We're redefining the types here because proxied types are defined in motion-extension
// Would need to move a lot of other proxied types to generic package if need be
export type ScheduledTaskSchemaWithRelations = ScheduledTaskSchema & {
  task?: TaskSchema
}

export type ScheduledEventSchemaWithRelations = ScheduledEventSchema & {
  event?: CalendarEventSchemaV2
}

export type ScheduledTaskChunkSchemaWithRelations = ScheduledTaskChunkSchema & {
  task?: ChunkTaskSchema
}

export type ScheduledEntityWithRelations =
  | ScheduledTaskSchemaWithRelations
  | ScheduledEventSchemaWithRelations
  | ScheduledTaskChunkSchemaWithRelations
  | ScheduledBlockingTimeslotSchema

export type OpenEventPayload = {
  providerId: string
  start: string
  end: string
}

export type OpenNewPayload = {
  type: 'task' | 'event' | 'project' | 'doc'
}

// Copied from rpc/types
export type EmailAccount = {
  id: string
  userId: string
  email: string
  name: string | null
  providerType: CalendarProviderTypeSchema
  profilePictureUrl?: string
} & any

export type UserConferenceSettingsPayload = {
  defaultConferenceType: EventConferenceType | null
  hasZoomAccount: boolean
  hasPhoneNumber: boolean
  hasCustomLocation: boolean
  hostEmailAccount: EmailAccount | null
  canEnableNotetaker: boolean
  defaultNotetakerEnabled: boolean
  hasAIWorkflows: boolean
}

export type QuickMeetingCreatePayload = {
  conferenceProvider: EventConferenceType
  addNotetaker: boolean
}

export type QuickMeetingCreatedPayload = {
  eventId: string
}

export type QuickMeetingErrorPayload = {
  error: string
}

export type MeetingInsightsRecord = Record<string, MeetingInsightsSchema>

export type MeetingInsightsPayload = {
  meetingInsights: MeetingInsightsRecord
}

export type NoteTakerPayload = {
  meetingInsightsId: string
}

export type OpenEventNotePayload = {
  noteId: string
}

export type AppBarSettings = {
  showTrayText: boolean
}
