import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../../types'

type GetRecordsShapes = RouteTypes<'RecordShape_GetAllEntityShapes'>
export const getRecordsShapes = defineApi<
  GetRecordsShapes['request'],
  GetRecordsShapes['response']
>().using({
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/crm/shapes`,
  key: () => queryKeys.recordsShapes(),
})
