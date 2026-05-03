import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import type { RouteTypes } from '../../types'

type CreateBookingLink = RouteTypes<'BookingLinksRoutes_Create'>
type UpdateBookingLink = RouteTypes<'BookingLinksRoutes_Update'>
type DeleteBookingLink = RouteTypes<'BookingLinksRoutes_Delete'>

export const createBookingLink = defineMutation<
  CreateBookingLink['request'],
  CreateBookingLink['response']
>().using({
  uri: `${__NET_HOST__}/v1/booking-links`,
  body: (opts) => opts,
  invalidate: queryKeys.bookingLinks(),
})

export const updateBookingLink = defineMutation<
  UpdateBookingLink['request'],
  UpdateBookingLink['response']
>().using({
  uri: (opts) => `${__NET_HOST__}/v1/booking-links/${opts.id}`,
  body: (opts) => {
    // Extract body from request, excluding path params
    const { id, ...body } = opts
    return body
  },
  invalidate: (opts) => queryKeys.bookingLink(opts.id),
})

export const deleteBookingLink = defineMutation<
  DeleteBookingLink['request'],
  DeleteBookingLink['response']
>().using({
  uri: (opts) => `${__NET_HOST__}/v1/booking-links/${opts.id}`,
  method: 'DELETE',
  invalidate: (opts) => [
    queryKeys.bookingLink(opts.id),
    queryKeys.bookingLinks(),
  ],
})
