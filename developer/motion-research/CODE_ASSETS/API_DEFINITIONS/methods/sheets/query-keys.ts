import { createKey, typedKey } from '@motion/rpc'

import { type RouteTypes } from '../types'

const createSheetRowsKey =
  typedKey<RouteTypes<'SheetRowsController_getSheetRows'>['response']>().define

const createSheetColumnsKey =
  typedKey<RouteTypes<'SheetColumnsController_getSheetColumns'>['response']>()
    .define

const createSheetsKey =
  typedKey<RouteTypes<'SheetsController_getSheetsQuery'>['response']>().define

export const queryKeys = {
  sheet: (sheetId: string) => createKey(['v2', 'sheets', sheetId, 'meta']),
  sheetsQuery: () => createSheetsKey(['v2', 'sheets', 'query']),
  sheetColumns: (sheetId: string) =>
    createSheetColumnsKey(['v2', 'sheets', sheetId, 'columns']),
  sheetRows: (sheetId: string) =>
    createSheetRowsKey(['v2', 'sheets', sheetId, 'rows', 'all']),
  sheetRowQuery: (
    body: RouteTypes<'SheetRowsController_getSheetRowsQuery'>['request']
  ) => {
    return typedKey<
      RouteTypes<'SheetRowsController_getSheetRowsQuery'>['response']
    >().define(['v2', 'sheets', body.sheetId, 'rows', 'query'])
  },
  sheetColumnQuery: (
    body: RouteTypes<'SheetColumnsController_getSheetColumnsQuery'>['request']
  ) => {
    return typedKey<
      RouteTypes<'SheetColumnsController_getSheetColumnsQuery'>['response']
    >().define(['v2', 'sheets', body.sheetId, 'columns', 'query'])
  },
}
