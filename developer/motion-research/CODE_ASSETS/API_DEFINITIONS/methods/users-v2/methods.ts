import {
  createKey,
  createLoader,
  defineApi,
  defineMutation,
  optimisticUpdate,
  SKIP_UPDATE,
} from '@motion/rpc'
import { isOverageCapableFeature } from '@motion/shared/feature-tiers'
import { cloneDeep, merge } from '@motion/utils/core'

import { type RouteTypes } from '../types'

export const queryKeys = {
  root: createKey(['v2', 'users']),
  me: () => createKey(queryKeys.root, 'me'),
  mySettings: () => createKey(queryKeys.me(), 'settings'),
  pageViewSettings: () => createKey(queryKeys.me(), 'pageViewSettings'),
  firebaseProviderTypes: () =>
    createKey(queryKeys.me(), 'firebaseProviderTypes'),
  featurePermissions: () => createKey(queryKeys.me(), 'feature-permissions'),
  hasPrivateEmailDomain: () =>
    createKey(queryKeys.me(), 'has-private-email-domain'),
  myGuestTeams: () => createKey(queryKeys.me(), 'guest-teams'),
}

type GetMySettings = RouteTypes<'UsersController_getMySettings'>

type UpdateCtaSettings =
  RouteTypes<'UsersController_updateMySettingsCallToActions'>

type UpdateTimezoneSettings = RouteTypes<'UsersController_updateMyTimezones'>

type UpdateAutoScheduleSettings =
  RouteTypes<'UsersController_updateAutoScheduleSettings'>

type UpdateOnboardingSettings =
  RouteTypes<'UsersController_updateMyOnboardingSettings'>

export const settingsQueryKeysToUpdate = [queryKeys.mySettings()]

export const getMySettings = defineApi<
  GetMySettings['request'],
  GetMySettings['response']
>().using({
  key: () => queryKeys.mySettings(),
  uri: `/v2/users/me/settings`,
  method: 'GET',
  queryOptions: {
    gcTime: Infinity,
    staleTime: 60 * 60 * 1000, // 1 hour
  },
})

export const updateCtaSettings = defineMutation<
  UpdateCtaSettings['request'],
  UpdateCtaSettings['response']
>().using({
  key: () => queryKeys.mySettings(),
  uri: `/v2/users/me/settings/call-to-actions`,
  method: 'PATCH',
  effects: [
    {
      on: 'mutate',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value, prev) => (prev ? { ...prev, ...value } : SKIP_UPDATE),
    },
    {
      on: 'success',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value) => value,
    },
  ],
})

export const updateTimezoneSettings = defineMutation<
  UpdateTimezoneSettings['request'],
  UpdateTimezoneSettings['response']
>().using({
  key: () => queryKeys.mySettings(),
  uri: `/v2/users/me/settings/timezones`,
  method: 'PATCH',
  effects: [
    {
      on: 'mutate',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value, prev) => (prev ? { ...prev, ...value } : SKIP_UPDATE),
    },
    {
      on: 'success',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value) => value,
    },
  ],
})

export const updateAutoScheduleSettings = defineMutation<
  UpdateAutoScheduleSettings['request'],
  UpdateAutoScheduleSettings['response']
>().using({
  key: () => queryKeys.mySettings(),
  uri: `/v2/users/me/settings/auto-schedule`,
  method: 'PATCH',
  effects: [
    {
      on: 'mutate',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value, prev) => (prev ? { ...prev, ...value } : SKIP_UPDATE),
    },
    {
      on: 'success',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value) => value,
    },
  ],
})

export const updateOnboardingSettings = defineMutation<
  UpdateOnboardingSettings['request'],
  UpdateOnboardingSettings['response']
>().using({
  uri: '/v2/users/me/settings/onboarding',
  method: 'PATCH',
  body: (args) => args,
  effects: [
    {
      on: 'mutate',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value, prev) => (prev ? { ...prev, ...value } : SKIP_UPDATE),
    },
    {
      on: 'success',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value) => value,
    },
  ],
})

type UpdateConferenceSettings =
  RouteTypes<'UsersController_updateMyConferenceSettings'>
export const updateConferenceSettings = defineMutation<
  UpdateConferenceSettings['request'],
  UpdateConferenceSettings['response']
>().using({
  method: 'PATCH',
  uri: '/v2/users/me/settings/conference',
  body: (args) => args,
  effects: [
    {
      on: 'mutate',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value, prev) => (prev ? { ...prev, ...value } : SKIP_UPDATE),
    },
    {
      on: 'success',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value) => value,
    },
  ],
})

type UpdateFolderSettings = RouteTypes<'UsersController_updateFolderSettings'>

export const updateFolderSettings = defineMutation<
  UpdateFolderSettings['request'],
  UpdateFolderSettings['response']
>().using({
  uri: '/v2/users/me/settings/folder-settings',
  method: 'PATCH',
  effects: [
    optimisticUpdate({
      key: () => queryKeys.mySettings(),
      merge: (
        { folderId, folderItemId, ...newFolderState },
        prev: UpdateFolderSettings['response'] | undefined
      ) => {
        if (!prev) return SKIP_UPDATE

        const data = cloneDeep(prev)
        const userSettingsKey = Object.keys(data.models.userSettings)[0]

        if (!userSettingsKey) return SKIP_UPDATE

        const key = folderItemId ?? folderId
        if (!key) {
          throw new Error('Either folderId or folderItemId must be provided')
        }

        const prevFolderState =
          data.models.userSettings[userSettingsKey].folderState[key] ?? {}

        data.models.userSettings[userSettingsKey].folderState[key] = merge(
          prevFolderState,
          newFolderState
        )

        return data
      },
    }),
    {
      on: 'success',
      action: 'update',
      key: () => queryKeys.mySettings(),
      merge: (
        newValue,
        prevValue: UpdateFolderSettings['response'] | undefined,
        { folderId, folderItemId }
      ) => {
        if (!prevValue) return newValue

        const data = cloneDeep(newValue)
        const userSettingsKey = Object.keys(data.models.userSettings)[0]

        if (!userSettingsKey) return newValue

        const key = folderItemId ?? folderId
        if (!key) return

        const prevFolderState = cloneDeep(
          prevValue.models.userSettings[userSettingsKey].folderState
        )
        const modifiedFolderState =
          data.models.userSettings[userSettingsKey].folderState[key]

        if (prevFolderState && modifiedFolderState) {
          data.models.userSettings[userSettingsKey].folderState = merge(
            prevFolderState,
            { [key]: modifiedFolderState }
          )
        }

        return data
      },
    },
  ],
})

type UpdateNotetakerSettings =
  RouteTypes<'UsersController_updateMyNotetakerSettings'>
export const updateNotetakerSettings = defineMutation<
  UpdateNotetakerSettings['request'],
  UpdateNotetakerSettings['response']
>().using({
  method: 'PATCH',
  uri: '/v2/users/me/settings/notetaker',
  body: (args) => args,
  effects: [
    {
      on: 'mutate',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value, prev) => (prev ? { ...prev, ...value } : SKIP_UPDATE),
    },
    {
      on: 'success',
      action: 'update',
      key: (args) => queryKeys.mySettings(),
      merge: (value) => value,
    },
  ],
})

type UpdateTaskDefaultSettings =
  RouteTypes<'UsersController_updateMyTaskDefaultSettings'>

export const updateTaskDefaultSettings = defineMutation<
  UpdateTaskDefaultSettings['request'],
  UpdateTaskDefaultSettings['response']
>().using({
  method: 'PATCH',
  uri: '/v2/users/me/settings/task-defaults',
  body: (args) => args,
})

type UpdateCalendarDisplaySettings =
  RouteTypes<'UsersController_updateCalendarDisplaySettings'>

export const updateCalendarDisplaySettings = defineMutation<
  UpdateCalendarDisplaySettings['request'],
  UpdateCalendarDisplaySettings['response']
>().using({
  method: 'PATCH',
  uri: '/v2/users/me/settings/calendar-display',
  body: (args) => args,
})

type GetCurrentUser = RouteTypes<'UsersController_getCurrentUser'>
export const getCurrentUser = defineApi<
  GetCurrentUser['request'],
  GetCurrentUser['response']
>().using({
  key: queryKeys.me,
  method: 'GET',
  uri: '/v2/users/me',
  queryOptions: {
    staleTime: 30 * 60 * 1000, // 30 min
  },
})

type AllPageViewSettings = RouteTypes<'UsersController_getAllPageViewSettings'>
export const getAllPageViewSettings = defineApi<
  AllPageViewSettings['request'],
  AllPageViewSettings['response']
>().using({
  key: queryKeys.pageViewSettings,
  method: 'GET',
  uri: '/v2/users/me/settings/page-view',
})

type UpsertPageViewsSettings =
  RouteTypes<'UsersController_upsertPageViewSettings'>
export const upsertPageViewsSettings = defineMutation<
  UpsertPageViewsSettings['request'],
  UpsertPageViewsSettings['response']
>().using({
  method: 'PUT',
  uri: (args) => `/v2/users/me/settings/page-view/${args.type}/${args.id}`,
  body: ({ id, type, ...args }) => args,
})

type GetUserFirebaseProviderTypes =
  RouteTypes<'UsersController_getFirebaseProviderTypes'>
export const getUserFirebaseProviderTypes = defineApi<
  GetUserFirebaseProviderTypes['request'],
  GetUserFirebaseProviderTypes['response']
>().using({
  key: queryKeys.firebaseProviderTypes,
  method: 'GET',
  uri: '/v2/users/me/settings/firebase-provider-types',
  queryOptions: {
    staleTime: 30 * 60 * 1000, // 30 min
  },
})

type GetFeaturePermissions = RouteTypes<'UsersController_getFeaturePermissions'>
export const getFeaturePermissions = defineApi<
  GetFeaturePermissions['request'],
  GetFeaturePermissions['response']
>().using({
  key: queryKeys.featurePermissions,
  method: 'GET',
  uri: '/v2/users/me/feature-permissions',
  queryOptions: {
    staleTime: 5 * 60 * 1000, // 5 min
  },
})

type UpdateOverageLimits = RouteTypes<'UsersController_updateOverageLimits'>
export const updateOverageLimits = defineMutation<
  UpdateOverageLimits['request'],
  UpdateOverageLimits['response']
>().using({
  method: 'PATCH',
  uri: '/v2/users/me/feature-permissions/overage-limits',
  body: (args) => args,
  effects: [
    {
      on: 'mutate',
      action: 'update',
      key: (args) => queryKeys.featurePermissions(),
      merge: (value, prev) => {
        if (!isExpectedFeaturePermissionsCache(prev) || prev.ids.length !== 1) {
          return SKIP_UPDATE
        }
        const result = cloneDeep(prev)
        const id = result.ids[0]
        Object.entries(value).forEach(([k, v]) => {
          if (isOverageCapableFeature(k) && v != null) {
            result.models.userFeaturePermissionOverageLimits[id][k] = v
          }
        })
        return result
      },
    },
    {
      on: 'success',
      action: 'update',
      key: (args) => queryKeys.featurePermissions(),
      merge: (value) => value,
    },
  ],
})

const isExpectedFeaturePermissionsCache = (
  u: unknown
): u is UpdateOverageLimits['response'] => {
  return !!(
    u &&
    typeof u === 'object' &&
    'models' in u &&
    u.models &&
    typeof u.models === 'object' &&
    'userFeaturePermissionOverageLimits' in u.models &&
    u.models.userFeaturePermissionOverageLimits &&
    typeof u.models.userFeaturePermissionOverageLimits === 'object'
  )
}

export const featurePermissionsLoader = createLoader(getFeaturePermissions)

type UpdateSidebarDisplaySettings =
  RouteTypes<'UsersController_updateSidebarDisplaySettings'>

export const updateSidebarDisplaySettings = defineMutation<
  UpdateSidebarDisplaySettings['request'],
  UpdateSidebarDisplaySettings['response']
>().using({
  uri: '/v2/users/me/settings/sidebar-display',
  method: 'PATCH',
})

type GetMyGuestTeams = RouteTypes<'UsersController_getMyGuestTeams'>
export const getMyGuestTeams = defineApi<
  GetMyGuestTeams['request'],
  GetMyGuestTeams['response']
>().using({
  uri: '/v2/users/me/guest-teams',
  method: 'GET',
  key: () => queryKeys.myGuestTeams(),
})
