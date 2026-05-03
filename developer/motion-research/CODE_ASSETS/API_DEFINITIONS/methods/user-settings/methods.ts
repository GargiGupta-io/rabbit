import { createKey, defineApi, defineMutation, SKIP_UPDATE } from '@motion/rpc'
import { type SaveSettingsDto } from '@motion/rpc-types/dto'

import { type RouteTypes } from '../types'

export const queryKeys = {
  root: createKey('user-settings'),
  firestore: createKey('settings', 'firestore'),
}

type UpdateUserSettings = RouteTypes<'SettingsController_updateUserSettings'>

export const get = defineApi<void, SaveSettingsDto>().using({
  key: queryKeys.root,
  uri: '/settings',
})

export const update = defineMutation<
  UpdateUserSettings['request'],
  UpdateUserSettings['response']
>().using({
  method: 'PATCH',
  uri: '/settings',
  effects: [
    {
      on: 'mutate',
      action: 'update',
      key: () => queryKeys.root,
      merge: (value, prev) => (prev ? { ...prev, ...value } : SKIP_UPDATE),
    },
    {
      on: 'success',
      action: 'update',
      key: () => queryKeys.root,
      merge: (value) => value,
    },
  ],
})

type GetFirestoreSettings =
  RouteTypes<'SettingsController_getFirestoreSettings'>
export const getFirestoreSettings = defineApi<
  void,
  GetFirestoreSettings['response']
>().using({
  key: queryKeys.firestore,
  uri: '/settings/firestore',
})
