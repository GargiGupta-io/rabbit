import { defineApi, defineMutation, type HttpError } from '@motion/rpc'

import {
  allSubscriptionKeys,
  combinedSubscriptionKeys,
  queryKeys,
} from './keys'

import { combinedTeamKeys } from '../teams/keys'
import { type RouteTypes } from '../types'

type RefreshSubscription = RouteTypes<'SubscriptionsController_getSubscription'>
export const refresh = defineApi<
  RefreshSubscription['request'],
  RefreshSubscription['response']
>().using({
  key: queryKeys.root,
  uri: '/subscriptions',
  method: 'POST',
})

type ApplyCoupon = RouteTypes<'SubscriptionsController_applyCoupon'>
export const applyCoupon = defineMutation<
  ApplyCoupon['request'],
  ApplyCoupon['response']
>().using({
  uri: `/subscriptions/coupon`,
  method: 'POST',
  invalidate: [...allSubscriptionKeys, ...combinedTeamKeys],
})

type CancelSubscription =
  RouteTypes<'SubscriptionsController_cancelSubscription'>
export const cancelSubscription = defineMutation<
  CancelSubscription['request'],
  CancelSubscription['response']
>().using({
  uri: `/subscriptions/cancel`,
  method: 'POST',
  invalidate: [...allSubscriptionKeys, ...combinedTeamKeys],
})

type UncancelSubscription =
  RouteTypes<'SubscriptionsController_uncancelSubscription'>
export const uncancelSubscription = defineMutation<
  UncancelSubscription['request'],
  UncancelSubscription['response']
>().using({
  uri: `/subscriptions/uncancel`,
  method: 'POST',
  invalidate: [...allSubscriptionKeys, ...combinedTeamKeys],
})

type GetIndividualAndTeam =
  RouteTypes<'SubscriptionsController_getSubscriptions'>
export const getIndividualAndTeamSubscription = defineApi<
  GetIndividualAndTeam['request'],
  GetIndividualAndTeam['response']
>().using({
  uri: `/subscriptions/individual-and-team`,
  method: 'GET',
  key: queryKeys.individualAndTeam,
  queryOptions: {
    staleTime: 600_000,
  },
})

type GetTrialSubscription =
  RouteTypes<'SubscriptionsController_getSubscriptionTrial'>
export const getTrialSubscription = defineApi<
  GetTrialSubscription['request'],
  GetTrialSubscription['response']
>().using({
  uri: `/subscriptions/trial-override`,
  method: 'GET',
  key: queryKeys.trial,
  queryOptions: {
    staleTime: 600_000,
  },
})

type GetTeamPrices = RouteTypes<'SubscriptionsController_getTeamPrices'>
export const getTeamPrices = defineApi<
  GetTeamPrices['request'],
  GetTeamPrices['response']
>().using({
  key: ['prices', 'team'],
  uri: '/subscriptions/prices/team',
  queryOptions: {
    refetchOnMount: false,
    gcTime: Infinity,
    staleTime: 600_000,
  },
})

type GetTeamPricesUnauthorized =
  RouteTypes<'SubscriptionsController_getTeamPricesUnauthorized'>
export const getTeamPricesUnauthorized = defineApi<
  GetTeamPricesUnauthorized['request'],
  GetTeamPricesUnauthorized['response']
>().using({
  key: ['unauthorized', 'prices', 'team'],
  uri: (args) =>
    `/subscriptions/prices/team/unauthorized?email=${encodeURIComponent(
      args.email
    )}`,
  queryOptions: {
    refetchOnMount: false,
    gcTime: Infinity,
    staleTime: 600_000,
  },
})

type CreateStripePortalLink =
  RouteTypes<'SubscriptionsController_createStripePortalLink'>
export const createStripePortalLink = defineMutation<
  CreateStripePortalLink['request'],
  CreateStripePortalLink['response']
>().using({
  uri: `/subscriptions/stripePortalLink`,
  method: 'POST',
  key: ['subscriptions', 'stripePortalLink'],
})

type GetSubscriptionPaymentMethod =
  RouteTypes<'SubscriptionsController_getSubscriptionPaymentMethod'>
export const getSubscriptionPaymentMethod = defineApi<
  GetSubscriptionPaymentMethod['request'],
  GetSubscriptionPaymentMethod['response']
>().using({
  uri: (args) => `/subscriptions/${args.subscriptionId}/paymentMethod`,
  method: 'GET',
  key: (args) => ['subscriptions', 'paymentMethod', args.subscriptionId],
  queryOptions: {
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: (retries, error) => {
      const httpError = error as HttpError
      if (httpError.status === 404) {
        return false
      }
      return retries < 3
    },
  },
})

type UpdateDefaultPaymentMethod =
  RouteTypes<'SubscriptionsController_updateDefaultPaymentMethod'>
export const updateDefaultPaymentMethod = defineMutation<
  UpdateDefaultPaymentMethod['request'],
  { err?: string }
>().using({
  uri: '/subscriptions/paymentMethod',
  method: 'POST',
  invalidate: queryKeys.paymentMethod,
})

type UpdateSubscriptionFeatureTier =
  RouteTypes<'SubscriptionsController_updateSubscriptionFeatureTier'>
export const updateSubscriptionFeatureTier = defineMutation<
  UpdateSubscriptionFeatureTier['request'],
  void
>().using({
  uri: '/subscriptions/featureTier',
  method: 'PATCH',
  invalidate: [...combinedSubscriptionKeys, ...combinedTeamKeys],
})

type GetTierPrices = RouteTypes<'SubscriptionsController_getTierPrices'>
export const getTierPrices = defineApi<
  GetTierPrices['request'],
  GetTierPrices['response']
>().using({
  key: ['prices', 'tiers'],
  uri: '/subscriptions/prices/tiers',
  queryOptions: {
    refetchOnMount: false,
    gcTime: Infinity,
    staleTime: 600_000,
  },
})

type GetTierPricesUnauthorized =
  RouteTypes<'SubscriptionsController_getTierPricesUnauthorized'>
export const getTierPricesUnauthorized = defineApi<
  GetTierPricesUnauthorized['request'],
  GetTierPricesUnauthorized['response']
>().using({
  key: ['unauthorized', 'prices', 'tiers'],
  uri: (args) => {
    const baseUri = '/subscriptions/prices/tiers/unauthorized'
    return args.email
      ? `${baseUri}?email=${encodeURIComponent(args.email)}`
      : baseUri
  },
  queryOptions: {
    refetchOnMount: false,
    gcTime: Infinity,
    staleTime: 600_000,
  },
})

type CreateSubscriptionTrial =
  RouteTypes<'SubscriptionsController_createSubscriptionTrial'>
export const createSubscriptionTrial = defineMutation<
  CreateSubscriptionTrial['request'],
  CreateSubscriptionTrial['response']
>().using({
  key: queryKeys.trial,
  uri: '/subscriptions/trial-override',
  method: 'POST',
  invalidate: queryKeys.trial,
})

type UpdateSubscriptionTrial =
  RouteTypes<'SubscriptionsController_updateSubscriptionTrial'>
export const updateSubscriptionTrial = defineMutation<
  UpdateSubscriptionTrial['request'],
  UpdateSubscriptionTrial['response']
>().using({
  uri: '/subscriptions/trial-override',
  method: 'PATCH',
  invalidate: queryKeys.trial,
})

type CancelSubscriptionTrial =
  RouteTypes<'SubscriptionsController_cancelSubscriptionTrial'>
export const cancelSubscriptionTrial = defineMutation<
  CancelSubscriptionTrial['request'],
  void
>().using({
  uri: '/subscriptions/trial-override/cancel',
  method: 'PATCH',
  invalidate: queryKeys.trial,
})

type UncancelSubscriptionTrial =
  RouteTypes<'SubscriptionsController_uncancelSubscriptionTrial'>
export const uncancelSubscriptionTrial = defineMutation<
  UncancelSubscriptionTrial['request'],
  void
>().using({
  uri: '/subscriptions/trial-override/uncancel',
  method: 'PATCH',
  invalidate: queryKeys.trial,
})
