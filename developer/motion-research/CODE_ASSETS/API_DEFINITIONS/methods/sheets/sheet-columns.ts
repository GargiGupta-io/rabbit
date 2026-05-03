import {
  defineApi,
  defineMutation,
  optimisticUpdate,
  SKIP_UPDATE,
  updateOnSuccess,
} from '@motion/rpc'
import { SheetColumnSchema } from '@motion/zod/client'

import { queryKeys } from './query-keys'

import { type RouteTypes } from '../types'

type GetSheetColumns = RouteTypes<'SheetColumnsController_getSheetColumns'>
export const getSheetColumns = defineApi<
  GetSheetColumns['request'],
  GetSheetColumns['response']
>().using({
  key: (args) => queryKeys.sheetColumns(args.sheetId),
  method: 'GET',
  uri: (args) => `/v2/sheets/${args.sheetId}/columns`,
  enabled: (args) => !!args.sheetId,
})

type SheetColumnQuery =
  RouteTypes<'SheetColumnsController_getSheetColumnsQuery'>
export const sheetColumnQuery = defineMutation<
  SheetColumnQuery['request'],
  SheetColumnQuery['response']
>().using({
  method: 'POST',
  key: (args) => queryKeys.sheetColumnQuery(args),
  uri: (args) => `/v2/sheets/${args.sheetId}/columns/query`,
})

type CreateSheetColumn = RouteTypes<'SheetColumnsController_createSheetColumn'>
export const createSheetColumn = defineMutation<
  CreateSheetColumn['request'],
  CreateSheetColumn['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/sheets/${args.sheetId}/columns`,
  // Hint: We don't invalidate here because WebSocket will take care of it
  effects: [
    updateOnSuccess({
      key: (args) => queryKeys.sheetColumns(args.sheetId),
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

type UpdateSheetColumn = RouteTypes<'SheetColumnsController_updateSheetColumn'>
export const updateSheetColumn = defineMutation<
  UpdateSheetColumn['request'],
  UpdateSheetColumn['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/sheets/${args.sheetId}/columns/${args.columnId}`,
  // Hint: We don't invalidate here because WebSocket will take care of it
  effects: [
    optimisticUpdate({
      key: (args) => queryKeys.sheetColumns(args.sheetId),
      merge: (value, prev) => {
        if (!prev) return SKIP_UPDATE
        return {
          ...prev,
          models: {
            sheetColumns: {
              ...prev.models.sheetColumns,
              [value.columnId]: {
                ...prev.models.sheetColumns[value.columnId],
                ...value.data,
              },
            },
          },
        }
      },
    }),
  ],
})

type DeleteSheetColumn = RouteTypes<'SheetColumnsController_deleteSheetColumn'>
export const deleteSheetColumn = defineMutation<
  DeleteSheetColumn['request'],
  DeleteSheetColumn['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/sheets/${args.sheetId}/columns/${args.columnId}`,
  invalidate: (args) => [
    queryKeys.sheetColumns(args.sheetId),
    queryKeys.sheetRows(args.sheetId),
  ],
})

type CreateSheetColumnRun =
  RouteTypes<'SheetColumnsController_createSheetColumnRun'>
export const createSheetColumnRun = defineMutation<
  CreateSheetColumnRun['request'] & {
    columnType: SheetColumnSchema['type']
  },
  CreateSheetColumnRun['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/sheets/${args.sheetId}/columns/${args.columnId}/run`,
  // Hint: We don't invalidate here because WebSocket will take care of it
  effects: [
    optimisticUpdate({
      key: (args) => queryKeys.sheetRows(args.sheetId),
      merge: (value, prev) => {
        if (!prev) return SKIP_UPDATE
        for (const rowId of value.data.rowIds) {
          const row = prev.models.sheetRows[rowId]
          const cell = row.data[value.columnId]
          if (value.columnType === 'agent_workflow') {
            // If cell already exists, update its status
            if (cell?.type === 'agent_workflow') {
              row.data[value.columnId] = {
                ...cell,
                status: 'pending',
                runId: null,
              }
              // If cell didn't exist, initialize it
            } else {
              row.data[value.columnId] = {
                type: 'agent_workflow',
                status: 'pending',
                syncStatus: 'unknown',
                runId: null,
              }
            }
          } else if (value.columnType === 'agent_step') {
            // If cell already exists, update its status
            if (cell?.type === 'agent_step') {
              row.data[value.columnId] = {
                ...cell,
                status: 'pending',
              }
              // If cell didn't exist, initialize it
            } else {
              row.data[value.columnId] = {
                type: 'agent_step',
                status: 'pending',
                value: null,
                syncStatus: 'unknown',
              }
            }
          }
        }
        return prev
      },
    }),
  ],
})
