import { createKey, defineApi } from '@motion/rpc'

import { type RouteTypes } from '../types'

type GetCoupon = RouteTypes<'StripeController_getCoupon'>
export const getCoupon = defineApi<GetCoupon['request'], any>().using({
  key: (args) => createKey('stripe', 'coupon', args.couponId),
  uri: (args) => `/stripe/coupon/${args.couponId}`,
})

type GetPrice = RouteTypes<'StripeController_getPrice'>
export const getPrice = defineApi<
  GetPrice['request'],
  GetPrice['response']
>().using({
  key: (args) => createKey('stripe', 'price', args.priceId),
  uri: (args) => `/stripe/price/${args.priceId}`,
})
