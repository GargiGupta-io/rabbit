import { defineApi, defineMutation } from '@motion/rpc'

import { queryKeys } from './query-keys'

import { type RouteTypes } from '../types'

type CreateSheet = RouteTypes<'SheetsController_createSheet'>
export const createSheet = defineMutation<
  CreateSheet['request'],
  CreateSheet['response']
>().using({
  method: 'POST',
  uri: '/v2/sheets',
  invalidate: () => queryKeys.sheetsQuery(),
})

type GetSheet = RouteTypes<'SheetsController_getSheet'>
export const getSheet = defineApi<
  GetSheet['request'],
  GetSheet['response']
>().using({
  key: (args) => queryKeys.sheet(args.sheetId),
  method: 'GET',
  uri: (args) => `/v2/sheets/${args.sheetId}`,
  enabled: (args) => !!args.sheetId,
})

type UpdateSheet = RouteTypes<'SheetsController_updateSheet'>
export const updateSheet = defineMutation<
  UpdateSheet['request'],
  UpdateSheet['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/sheets/${args.sheetId}`,
  invalidate: (args) => [
    queryKeys.sheetsQuery(),
    queryKeys.sheet(args.sheetId),
  ],
})

type DeleteSheet = RouteTypes<'SheetsController_deleteSheet'>
export const deleteSheet = defineMutation<
  DeleteSheet['request'],
  DeleteSheet['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/sheets/${args.sheetId}`,
  invalidate: (args) => [
    queryKeys.sheetsQuery(),
    queryKeys.sheet(args.sheetId),
  ],
})

type ExportCsv = RouteTypes<'SheetsController_exportCsv'>
export const exportCsv = defineApi<
  ExportCsv['request'],
  ExportCsv['response']
>().using({
  key: (args) => queryKeys.sheet(args.sheetId),
  uri: (args) => `/v2/sheets/${args.sheetId}/export-csv`,
  method: 'GET',
})

type SheetsQuery = RouteTypes<'SheetsController_getSheetsQuery'>
export const sheetsQuery = defineMutation<
  SheetsQuery['request'],
  SheetsQuery['response']
>().using({
  method: 'POST',
  key: () => queryKeys.sheetsQuery(),
  uri: () => `/v2/sheets/query`,
})
