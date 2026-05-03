// Channels that are sent from the main process (desktop) to the renderer process (web)
import { type EventConferenceType } from '@motion/shared/common'

import {
  type AppBarSettings,
  type DesktopDistribution,
  type MeetingInsightsPayload,
  type NoteTakerPayload,
  type OpenEventNotePayload,
  type OpenEventPayload,
  type OpenNewPayload,
  type QuickMeetingCreatedPayload,
  type QuickMeetingErrorPayload,
  type ScheduledEntityWithRelations,
  type Tab,
  type UserConferenceSettingsPayload,
} from './types'

type CanNavigatePayload = {
  canGoBack: boolean
  canGoForward: boolean
}

// Define tuple types for multi-argument payloads
type LogEventPayload = [event: string, properties?: object]

type DidNavigatePayload = {
  tabId: string
  isActive: boolean
  title: string
  url: string
  canGoBack: boolean
  canGoForward: boolean
}

export type MainChannelSendablePayloads = {
  appVersion: [version: string]
  // Have to retain close to the original structure
  // to avoid breaking changes
  hasNativeDesktopTabs: [
    hasNativeDesktopTabs: boolean,
    maxNumberOfTabs: number,
    currentNumberOfTabs: number,
  ]
  desktopDistribution: [distribution: DesktopDistribution]
  canNavigate: [payload: CanNavigatePayload]
  loadCalendar: []
  loadScheduleSettings: []
  loginDesktop: [token: string]
  navigateInApp: [url: string]
  'zoom-oauth': []
  openTask: [taskUrl: string]
  logEvent: LogEventPayload
  updateTheme: ['light' | 'dark']
  'updater:updateAvailable': [
    payload: { currentVersion: string; latestVersion: string },
  ]
  'main:openTask': [payload: { taskId: string }]
  'main:openEvent': [payload: OpenEventPayload]
  'main:openNew': [payload: OpenNewPayload]
  'main:search': []
  'main:completeTask': [payload: { taskId: string }]
  'main:quickMeeting:create': [
    payload: { conferenceProvider: EventConferenceType; addNotetaker: boolean },
  ]
}

export type OptionSpaceChannelSendablePayloads = {
  appVersion: [version: string]
  desktopDistribution: [distribution: DesktopDistribution]
  closeOptionSpace: []
  openOptionSpace: []
  updateUserSettings: [settings: Record<string, unknown>]
  setCurrentUser: [user: Record<string, unknown>]
}

export type TabChannelSendableSendablePayloads = {
  'tabs:set': [tabs: Tab[]]
  'tabs:setMaxTabs': [maxTabs: number]
  'tabs:didNavigate': [payload: DidNavigatePayload]
  'tabs:loadFailed': [didFail: boolean]
}

export type AppBarChannelSendableSendablePayloads = {
  'appBar:setAgenda': [agenda: ScheduledEntityWithRelations[]]
  'appBar:setMeetingInsights': [meetingInsights: MeetingInsightsPayload]
  'appBar:openEventNote': [payload: OpenEventNotePayload]
  'appBar:setConferenceSettings': [payload: UserConferenceSettingsPayload]
  'appBar:taskCompleted': [payload: { taskId: string }]
  'appBar:quickMeeting:created': [payload: QuickMeetingCreatedPayload]
  'appBar:quickMeeting:error': [payload: QuickMeetingErrorPayload]
  'appBar:noteTaker:send': [payload: NoteTakerPayload]
  'appBar:noteTaker:remove': [payload: NoteTakerPayload]
  'appBar:noteTaker:joined': [payload: NoteTakerPayload]
  'appBar:noteTaker:error': [payload: NoteTakerPayload & { error: string }]
  'appBar:noteTaker:removed': [payload: NoteTakerPayload]
  'appBar:settings:init': [payload: AppBarSettings]
}

export type SendableChannelMap = {
  [K in SENDABLE_MAIN_CHANNELS_TYPE]: (
    ...args: MainChannelSendablePayloads[K]
  ) => void
} & {
  [K in SENDABLE_OPTION_SPACE_CHANNELS_TYPE]: (
    ...args: OptionSpaceChannelSendablePayloads[K]
  ) => void
} & {
  [K in SENDABLE_TAB_CHANNELS_TYPE]: (
    ...args: TabChannelSendableSendablePayloads[K]
  ) => void
} & {
  [K in SENDABLE_APP_BAR_CHANNELS_TYPE]: (
    ...args: AppBarChannelSendableSendablePayloads[K]
  ) => void
}

export type SENDABLE_MAIN_CHANNELS_TYPE = keyof MainChannelSendablePayloads
export type SENDABLE_OPTION_SPACE_CHANNELS_TYPE =
  keyof OptionSpaceChannelSendablePayloads
export type SENDABLE_TAB_CHANNELS_TYPE =
  keyof TabChannelSendableSendablePayloads
export type SENDABLE_APP_BAR_CHANNELS_TYPE =
  keyof AppBarChannelSendableSendablePayloads

export type SendableChannel =
  | SENDABLE_MAIN_CHANNELS_TYPE
  | SENDABLE_OPTION_SPACE_CHANNELS_TYPE
  | SENDABLE_TAB_CHANNELS_TYPE
  | SENDABLE_APP_BAR_CHANNELS_TYPE

export const MAIN_SENDABLE_CHANNELS = [
  'appVersion',
  'hasNativeDesktopTabs',
  'desktopDistribution',
  'canNavigate',
  'loadCalendar',
  'loadScheduleSettings',
  'loginDesktop',
  'navigateInApp',
  'zoom-oauth',
  'openTask',
  'logEvent',
  'updateTheme',
  'updater:updateAvailable',
  'main:openTask',
  'main:openEvent',
  'main:openNew',
  'main:search',
  'main:completeTask',
  'main:quickMeeting:create',
] as const satisfies readonly SENDABLE_MAIN_CHANNELS_TYPE[]

export const OPTION_SPACE_SENDABLE_CHANNELS = [
  'appVersion',
  'desktopDistribution',
  'closeOptionSpace',
  'openOptionSpace',
  'updateUserSettings',
  'setCurrentUser',
] as const satisfies readonly SENDABLE_OPTION_SPACE_CHANNELS_TYPE[]

export const TAB_SENDABLE_CHANNELS = [
  'tabs:set',
  'tabs:setMaxTabs',
  'tabs:didNavigate',
  'tabs:loadFailed',
] as const satisfies readonly SENDABLE_TAB_CHANNELS_TYPE[]

export const APP_BAR_SENDABLE_CHANNELS = [
  'appBar:setAgenda',
  'appBar:setMeetingInsights',
  'appBar:openEventNote',
  'appBar:setConferenceSettings',
  'appBar:taskCompleted',
  'appBar:quickMeeting:created',
  'appBar:quickMeeting:error',
  'appBar:noteTaker:send',
  'appBar:noteTaker:remove',
  'appBar:noteTaker:joined',
  'appBar:noteTaker:error',
  'appBar:noteTaker:removed',
  'appBar:settings:init',
] as const satisfies readonly SENDABLE_APP_BAR_CHANNELS_TYPE[]

export const SENDABLE_CHANNELS = [
  ...MAIN_SENDABLE_CHANNELS,
  ...OPTION_SPACE_SENDABLE_CHANNELS,
  ...TAB_SENDABLE_CHANNELS,
  ...APP_BAR_SENDABLE_CHANNELS,
] as const satisfies readonly SendableChannel[]
