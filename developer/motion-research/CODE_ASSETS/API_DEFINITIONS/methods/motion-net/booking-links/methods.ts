import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import type { RouteTypes } from '../../types'

type GetBookingLinks = RouteTypes<'BookingLinksRoutes_Query'>
type GetBookingLink = RouteTypes<'BookingLinksRoutes_GetById'>

export const getBookingLinks = defineApi<
  GetBookingLinks['request'],
  GetBookingLinks['response']
>().using({
  uri: `${__NET_HOST__}/v1/booking-links`,
  key: (args) => queryKeys.bookingLinks(),
})

export const getBookingLink = defineApi<
  GetBookingLink['request'],
  GetBookingLink['response']
>().using({
  uri: (opts) => `${__NET_HOST__}/v1/booking-links/${opts.id}`,
  key: (args) => queryKeys.bookingLink(args.id),
})
