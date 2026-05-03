import { defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

export const enqueueSuccessPurchase = defineMutation<
  RouteTypes<'AnalyticsController_enqueueSuccessPurchase'>['request'],
  null
>().using({
  method: 'POST',
  uri: '/v2/analytics/enqueue-success-purchase',
  body: (args) => args,
})
