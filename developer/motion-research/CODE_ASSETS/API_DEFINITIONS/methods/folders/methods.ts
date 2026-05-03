import {
  defineApi,
  defineMutation,
  optimisticUpdate,
  SKIP_UPDATE,
  updateOnSuccess,
} from '@motion/rpc'
import { merge } from '@motion/utils/core'

import { queryKeys } from './keys'

import type { RouteTypes } from '../types'

type GetFolders = RouteTypes<'FoldersController_getFolders'>

export const getFolders = defineApi<
  GetFolders['request'],
  GetFolders['response']
>().using({
  key: queryKeys.getAll,
  uri: '/v2/folders',
  method: 'GET',
})

type CreateFolder = RouteTypes<'FoldersController_createFolder'>

export const createFolder = defineMutation<
  CreateFolder['request'],
  CreateFolder['response']
>().using({
  uri: '/v2/folders',
  method: 'POST',
  invalidate: [queryKeys.getAll],
})

type UpdateFolder = RouteTypes<'FoldersController_updateFolder'>

export const updateFolder = defineMutation<
  UpdateFolder['request'],
  UpdateFolder['response']
>().using({
  uri: ({ folderId }) => `/v2/folders/${folderId}`,
  method: 'PATCH',
  body: ({ folderId, ...body }) => body,
  effects: [
    optimisticUpdate({
      key: () => queryKeys.getAll,
      merge: (
        { folderId, ...data },
        previousValue: CreateFolder['response'] | undefined
      ) => {
        if (!previousValue) {
          return SKIP_UPDATE
        }

        merge(previousValue.models.folders[folderId], data)

        return previousValue
      },
    }),
    updateOnSuccess({
      key: () => queryKeys.getAll,
      merge: (data, previousValue) => merge(previousValue, data),
    }),
  ],
})

type DeleteFolder = RouteTypes<'FoldersController_deleteFolder'>

export const deleteFolder = defineMutation<
  DeleteFolder['request'],
  DeleteFolder['response']
>().using({
  uri: ({ folderId }) => `/v2/folders/${folderId}`,
  method: 'DELETE',
  body: ({ folderId, ...body }) => body,
  invalidate: [queryKeys.getAll],
})

type AddItemToFolder = RouteTypes<'FoldersController_addItemToFolder'>

export const addItemToFolder = defineMutation<
  AddItemToFolder['request'],
  AddItemToFolder['response']
>().using({
  uri: ({ folderId }) => `/v2/folders/${folderId}/items`,
  method: 'POST',
  invalidate: [queryKeys.getAll],
})

type UpdateItemInFolder = RouteTypes<'FoldersController_updateItemInFolder'>

export const updateItemInFolder = defineMutation<
  UpdateItemInFolder['request'],
  UpdateItemInFolder['response']
>().using({
  /**
   * You may be wondering wtf is that ID. Well, this endpoint doesn't actually
   * need or use the parentFolderId in the URL, as it's inferred from the itemId.
   * You only need to pass parentFolderId if you need to move the item to a new
   * folder, so when you are just changing the order, a parentFolderId is not
   * passed. However, we need to pass something, hence the zeroed-out UUID.
   * Maybe this will be fixed/changed later on, but for now, this is how it is.
   */
  uri: ({ parentFolderId, itemId }) =>
    `/v2/folders/00000000-0000-0000-0000-000000000000/items/${itemId}`,
  method: 'PATCH',
  invalidate: [queryKeys.getAll],
})

type DeleteItemFromFolder = RouteTypes<'FoldersController_deleteItemFromFolder'>

export const deleteItemFromFolder = defineMutation<
  DeleteItemFromFolder['request'],
  DeleteItemFromFolder['response']
>().using({
  uri: ({ itemId, folderId }) => `/v2/folders/${folderId}/items/${itemId}`,
  method: 'DELETE',
  invalidate: [queryKeys.getAll],
})

type FavoriteFolderItem = RouteTypes<'FoldersController_favoriteItem'>

export const favoriteFolderItem = defineMutation<
  FavoriteFolderItem['request'],
  FavoriteFolderItem['response']
>().using({
  uri: ({ itemId, folderId }) =>
    `/v2/folders/${folderId}/items/${itemId}/favorite`,
  method: 'POST',
  invalidate: [queryKeys.getAll],
})
