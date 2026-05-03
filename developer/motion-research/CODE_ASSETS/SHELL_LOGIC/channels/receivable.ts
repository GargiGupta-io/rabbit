// Channels that are received from the renderer process (web) to the main process (desktop)

import { type ScheduledEntityType } from '@motion/zod/client'

import {
  type AppBarSettings,
  type DesktopSettings,
  type MeetingInsightsPayload,
  type NoteTakerPayload,
  type OpenEventNotePayload,
  type OpenEventPayload,
  type OpenNewPayload,
  type QuickMeetingCreatedPayload,
  type QuickMeetingCreatePayload,
  type QuickMeetingErrorPayload,
  type ScheduledEntityWithRelations,
  type UserConferenceSettingsPayload,
} from './types'

type ShowEventNotificationPayload = {
  id: string
  title: string
  body: string
  conferenceLink?: string
  type: ScheduledEntityType
  providerId?: string
  start?: string
  end?: string
}

type ShowInboxNotificationPayload = {
  id: string
  clickUrl: string
  title: string
  body: string
}

type UpdateSettingsPayload = [settings: DesktopSettings]
type UpdateThemePayload = [theme: 'light' | 'dark']
type UpdateUserSettingsPayload = [settings: Record<string, unknown>]
type SetCurrentUserPayload = [user: Record<string, unknown>]

export type MainChannelReceivablePayloads = {
  'main:showMainWindow': []
  echo: [message: string]
  expandWindow: []
  getInitialData: []
  forceReload: []
  'auth:logout': []
  navigate: [{ direction: 'forward' | 'backward' }]
  removeShortcuts: []
  showNotification: [payload: ShowEventNotificationPayload]
  'notification:showInboxNotification': [payload: ShowInboxNotificationPayload]
  updateSettings: UpdateSettingsPayload
  updateTheme: UpdateThemePayload
  userReady: [{ userEmail: string }]
  'updater:requestUpdateStatus': []
  'updater:updateLater': []
  'updater:updateNow': []
  'main:updateConferenceSettings': [
    conferenceSettings: UserConferenceSettingsPayload,
  ]
  'main:quickMeeting:created': [payload: QuickMeetingCreatedPayload]
  'main:quickMeeting:error': [payload: QuickMeetingErrorPayload]
  'inbox:setBadgeCount': [payload: { unreadCount: number }]
}

export type OptionSpaceChannelReceivablePayloads = {
  cancelOptionSpace: []
  loadScheduleSettings: []
  getInitialData: []
  openTask: [{ taskUrl: string }]
  updateUserSettings: UpdateUserSettingsPayload
  setCurrentUser: SetCurrentUserPayload
}

export type TabChannelReceivablePayloads = {
  'tabs:get': []
  'tabs:select': [tabId: string]
  'tabs:add': []
  'tabs:move': [tabId: string, toIndex: number]
  'tabs:remove': [tabId: string]
  'tabs:navigate': [{ direction: 'forward' | 'backward' }]
  'tabs:didChangeOnlineStatus': [isOnline: boolean]
  'windows:showMainMenu': [payload: { x: number; y: number }]
}

export type AppBarChannelReceivablePayloads = {
  'appBar:sendTodayScheduledEntities': [
    scheduledEntities: ScheduledEntityWithRelations[],
  ]
  'appBar:taskCompleted': [payload: { taskId: string }]
  'appBar:sendMeetingInsights': [meetingInsights: MeetingInsightsPayload]
  'appBar:getInitialData': []
  'appBar:openEvent': [payload: OpenEventPayload]
  'appBar:openTask': [payload: { taskId: string }]
  'appBar:openNew': [payload: OpenNewPayload]
  'appBar:openEventNote': [payload: OpenEventNotePayload]
  'appBar:search': []
  'appBar:completeTask': [payload: { taskId: string }]
  'appBar:joinEvent': [
    payload: {
      conferenceLink: string
      location: 'quick-meeting' | 'event-row'
    },
  ]
  'appBar:quickMeeting:create': [payload: QuickMeetingCreatePayload]
  'appBar:noteTaker:send': [payload: NoteTakerPayload]
  'appBar:noteTaker:remove': [payload: NoteTakerPayload]
  'appBar:noteTaker:joined': [payload: NoteTakerPayload]
  'appBar:noteTaker:error': [payload: NoteTakerPayload & { error: string }]
  'appBar:noteTaker:removed': [payload: NoteTakerPayload]
  'appBar:settings:requestSettings': []
  'appBar:settings:update': [payload: AppBarSettings]
}

export type ReceivableChannelMap = {
  [K in RECEIVABLE_MAIN_CHANNELS_TYPE]: (
    ...args: MainChannelReceivablePayloads[K]
  ) => void
} & {
  [K in RECEIVABLE_OPTION_SPACE_CHANNELS_TYPE]: (
    ...args: OptionSpaceChannelReceivablePayloads[K]
  ) => void
} & {
  [K in RECEIVABLE_TAB_CHANNELS_TYPE]: (
    ...args: TabChannelReceivablePayloads[K]
  ) => void
} & {
  [K in RECEIVABLE_APP_BAR_CHANNELS_TYPE]: (
    ...args: AppBarChannelReceivablePayloads[K]
  ) => void
}

export type RECEIVABLE_MAIN_CHANNELS_TYPE = keyof MainChannelReceivablePayloads
export type RECEIVABLE_OPTION_SPACE_CHANNELS_TYPE =
  keyof OptionSpaceChannelReceivablePayloads
export type RECEIVABLE_TAB_CHANNELS_TYPE = keyof TabChannelReceivablePayloads
export type RECEIVABLE_APP_BAR_CHANNELS_TYPE =
  keyof AppBarChannelReceivablePayloads
export type ReceivableChannel =
  | RECEIVABLE_MAIN_CHANNELS_TYPE
  | RECEIVABLE_OPTION_SPACE_CHANNELS_TYPE
  | RECEIVABLE_TAB_CHANNELS_TYPE
  | RECEIVABLE_APP_BAR_CHANNELS_TYPE

export const MAIN_RECEIVABLE_CHANNELS = [
  'main:showMainWindow',
  'echo',
  'expandWindow',
  'getInitialData',
  'forceReload',
  'auth:logout',
  'navigate',
  'removeShortcuts',
  'showNotification',
  'notification:showInboxNotification',
  'updateSettings',
  'updateTheme',
  'userReady',
  'updater:requestUpdateStatus',
  'updater:updateLater',
  'updater:updateNow',
  'main:updateConferenceSettings',
  'main:quickMeeting:created',
  'main:quickMeeting:error',
  'inbox:setBadgeCount',
] as const satisfies readonly RECEIVABLE_MAIN_CHANNELS_TYPE[]

export const OPTION_SPACE_RECEIVABLE_CHANNELS = [
  'cancelOptionSpace',
  'loadScheduleSettings',
  'getInitialData',
  'openTask',
  'updateUserSettings',
  'setCurrentUser',
] as const satisfies readonly RECEIVABLE_OPTION_SPACE_CHANNELS_TYPE[]

export const TAB_RECEIVABLE_CHANNELS = [
  'tabs:get',
  'tabs:select',
  'tabs:add',
  'tabs:move',
  'tabs:remove',
  'tabs:navigate',
  'tabs:didChangeOnlineStatus',
  'windows:showMainMenu',
] as const satisfies readonly RECEIVABLE_TAB_CHANNELS_TYPE[]

export const APP_BAR_RECEIVABLE_CHANNELS = [
  'appBar:taskCompleted',
  'appBar:sendTodayScheduledEntities',
  'appBar:sendMeetingInsights',
  'appBar:getInitialData',
  'appBar:openEvent',
  'appBar:openTask',
  'appBar:openNew',
  'appBar:search',
  'appBar:completeTask',
  'appBar:joinEvent',
  'appBar:quickMeeting:create',
  'appBar:noteTaker:send',
  'appBar:noteTaker:remove',
  'appBar:noteTaker:joined',
  'appBar:noteTaker:error',
  'appBar:noteTaker:removed',
  'appBar:openEventNote',
  'appBar:settings:requestSettings',
  'appBar:settings:update',
] as const satisfies readonly RECEIVABLE_APP_BAR_CHANNELS_TYPE[]

export const RECEIVABLE_CHANNELS = [
  ...MAIN_RECEIVABLE_CHANNELS,
  ...OPTION_SPACE_RECEIVABLE_CHANNELS,
  ...TAB_RECEIVABLE_CHANNELS,
  ...APP_BAR_RECEIVABLE_CHANNELS,
] as const satisfies readonly ReceivableChannel[]
