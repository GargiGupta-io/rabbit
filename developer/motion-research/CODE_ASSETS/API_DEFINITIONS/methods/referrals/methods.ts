import { createKey, defineApi, defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

const QueryKeys = {
  root: () => createKey('referrals'),
  user: () => createKey(QueryKeys.root(), 'user'),
}

export const createReferral = defineMutation<
  RouteTypes<'ReferralsController_create'>['request'],
  RouteTypes<'ReferralsController_create'>['response']
>().using({
  uri: 'referrals/',
  method: 'POST',
  invalidate: QueryKeys.root(),
})

export const getUserReferrals = defineApi<
  RouteTypes<'ReferralsController_getUserReferrals'>['request'],
  RouteTypes<'ReferralsController_getUserReferrals'>['response']
>().using({
  uri: 'referrals/user',
  method: 'GET',
  key: QueryKeys.user(),
})

export const trackAffiliate = defineMutation<
  RouteTypes<'ReferralsController_trackPartnerstackLink'>['request'],
  void
>().using({
  uri: 'referrals/affiliate',
  method: 'POST',
  invalidate: QueryKeys.user(),
})
