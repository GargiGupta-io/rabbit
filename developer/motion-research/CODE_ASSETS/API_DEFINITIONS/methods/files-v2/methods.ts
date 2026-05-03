import { createKey, defineApi, defineMutation } from '@motion/rpc'
import {
  type UploadedFileSchema,
  type UploadFileRequest,
} from '@motion/rpc-types'

import { type RouteTypes } from '../types'

export const queryKeys = {
  root: createKey(['v2', 'files']),
  uploadFile: ({
    targetId,
    targetType,
  }: Pick<UploadFileRequest, 'targetId' | 'targetType'>) =>
    createKey(['v2', 'files', 'uploadFiles', targetId ?? '', targetType ?? '']),
}

type GetFile = RouteTypes<'FilesController_getFileById'>
export const getFile = defineApi<
  GetFile['request'],
  GetFile['response']
>().using({
  key: (args) => [queryKeys.root, args.id],
  uri: (args) => `/v2/files/${args.id}`,
  method: 'GET',
})

type UpdateFile = RouteTypes<'FilesController_updateFile'>
export const updateFile = defineMutation<
  UpdateFile['request'],
  UpdateFile['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/files/${args.id}`,
})

type DeleteFile = RouteTypes<'FilesController_deleteFile'>
export const deleteFile = defineMutation<
  DeleteFile['request'] & Pick<UploadedFileSchema, 'targetId' | 'targetType'>,
  void
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/files/${args.id}`,
})

type DownloadFile = RouteTypes<'FilesController_getFile'>
export const downloadFile = defineApi<DownloadFile['request'], Blob>().using({
  key: (args) => [queryKeys.root, args.id],
  uri: (args) => `/v2/files/${args.id}/download`,
  method: 'GET',
})
