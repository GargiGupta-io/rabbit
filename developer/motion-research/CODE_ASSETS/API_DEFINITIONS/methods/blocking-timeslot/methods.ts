import { createKey, defineApi, defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

export const create = defineMutation<
  RouteTypes<'BlockingTimeslotController_createBlockingTimeslot'>['request'],
  RouteTypes<'BlockingTimeslotController_createBlockingTimeslot'>['response']
>().using({
  key: createKey('blocking_timeslot'),
  uri: '/blocking_timeslot',
  method: 'POST',
  invalidate: createKey('blocking_timeslot'),
})

export const deleteMany = defineMutation<
  RouteTypes<'BlockingTimeslotController_deleteManyBlockingTimeslots'>['request'],
  void
>().using({
  key: createKey('blocking_timeslot/delete'),
  uri: '/blocking_timeslot/delete',
  method: 'POST',
  invalidate: createKey('blocking_timeslot'),
})

export const get = defineApi<
  RouteTypes<'BlockingTimeslotController_getBlockingTimeslots'>['request'],
  RouteTypes<'BlockingTimeslotController_getBlockingTimeslots'>['response']
>().using({
  key: createKey('blocking_timeslot'),
  uri: 'blocking_timeslot',
})
