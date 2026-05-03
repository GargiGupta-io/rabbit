import {
  defineApi,
  defineMutation,
  optimisticUpdate,
  SKIP_UPDATE,
  updateOnSuccess,
} from '@motion/rpc'

import { queryKeys } from './query-keys'

import { type RouteTypes } from '../types'

type GetSheetRows = RouteTypes<'SheetRowsController_getSheetRows'>
export const getSheetRows = defineApi<
  GetSheetRows['request'],
  GetSheetRows['response']
>().using({
  key: (args) => queryKeys.sheetRows(args.sheetId),
  method: 'GET',
  uri: (args) => `/v2/sheets/${args.sheetId}/rows`,
  enabled: (args) => !!args.sheetId,
})

type SheetRowQuery = RouteTypes<'SheetRowsController_getSheetRowsQuery'>
export const sheetRowQuery = defineMutation<
  SheetRowQuery['request'],
  SheetRowQuery['response']
>().using({
  method: 'POST',
  key: (args) => queryKeys.sheetRowQuery(args),
  uri: (args) => `/v2/sheets/${args.sheetId}/rows/query`,
})

type CreateSheetRow = RouteTypes<'SheetRowsController_createSheetRow'>
export const createSheetRow = defineMutation<
  CreateSheetRow['request'],
  CreateSheetRow['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/sheets/${args.sheetId}/rows`,
  // Hint: We don't invalidate here because WebSocket will take care of it
  effects: [
    updateOnSuccess({
      key: (args) => queryKeys.sheetRows(args.sheetId),
      merge: (value, prev) => {
        if (!prev) return value
        prev.ids = Array.from(new Set([...prev.ids, value.id]))
        prev.models[prev.meta.model][value.id] =
          value.models[value.meta.model][value.id]
        return prev
      },
    }),
  ],
})

type UpdateSheetRow = RouteTypes<'SheetRowsController_updateSheetRow'>
export const updateSheetRow = defineMutation<
  UpdateSheetRow['request'],
  UpdateSheetRow['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/sheets/${args.sheetId}/rows/${args.rowId}`,
  // Hint: We don't invalidate here because WebSocket will take care of it
  effects: [
    updateOnSuccess({
      key: (args) => queryKeys.sheetRows(args.sheetId),
      merge(value, prev) {
        if (!prev) return value
        return {
          ...prev,
          models: {
            sheetRows: {
              ...prev.models.sheetRows,
              ...value.models.sheetRows,
            },
          },
        }
      },
    }),
    optimisticUpdate({
      key: (args) => queryKeys.sheetRows(args.sheetId),
      merge: (value, prev) => {
        if (!prev || !value.data || !('data' in value.data)) return SKIP_UPDATE

        return {
          ...prev,
          models: {
            sheetRows: {
              ...prev.models.sheetRows,
              [value.rowId]: {
                ...prev.models.sheetRows[value.rowId],
                data: {
                  ...prev.models.sheetRows[value.rowId].data,
                  ...value.data.data,
                },
              },
            },
          },
        }
      },
    }),
  ],
})

type DeleteSheetRow = RouteTypes<'SheetRowsController_deleteSheetRow'>
export const deleteSheetRow = defineMutation<
  DeleteSheetRow['request'],
  DeleteSheetRow['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/sheets/${args.sheetId}/rows/${args.rowId}`,
  invalidate: (args) => queryKeys.sheetRows(args.sheetId),
})

type BulkDeleteSheetRows = RouteTypes<'SheetRowsController_bulkDeleteSheetRows'>
export const bulkDeleteSheetRows = defineMutation<
  BulkDeleteSheetRows['request'],
  BulkDeleteSheetRows['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/sheets/${args.sheetId}/rows/bulk-delete`,
  invalidate: (args) => queryKeys.sheetRows(args.sheetId),
})
