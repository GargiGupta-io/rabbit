import { defineApi, defineMutation } from '@motion/rpc'

import { combinedSubscriptionKeys, queryKeys } from '../subscriptions'
import { combinedTeamKeys } from '../teams/keys'
import { RouteTypes } from '../types'

type GetSubscriptions = RouteTypes<'SubscriptionsController_getSubscriptionsV2'>
export const getSubscriptions = defineApi<
  GetSubscriptions['request'],
  GetSubscriptions['response']
>().using({
  key: queryKeys.rootV2,
  uri: '/v2/subscriptions',
  method: 'GET',
  queryOptions: {
    staleTime: 30 * 60 * 1000, // 30 min
  },
})

type CreateIndividualSubscription =
  RouteTypes<'SubscriptionsController_createIndividualSubscriptionV2'>
export const createIndividualSubscription = defineMutation<
  CreateIndividualSubscription['request'],
  CreateIndividualSubscription['response']
>().using({
  uri: '/v2/subscriptions/individual',
  method: 'POST',
  invalidate: combinedSubscriptionKeys,
})

type CreateSetupIntent = RouteTypes<'SubscriptionsController_createSetupIntent'>
export const createSetupIntent = defineMutation<
  CreateSetupIntent['request'],
  CreateSetupIntent['response']
>().using({
  uri: (args) =>
    `/v2/subscriptions/setup-intent?markSalesQualified=${args.markSalesQualified}`,
  method: 'POST',
})

type CreatePaymentIntentUnauthenticated =
  RouteTypes<'SubscriptionsController_createPaymentIntentUnauthenticated'>
export const createPaymentIntentUnauthenticated = defineMutation<
  CreatePaymentIntentUnauthenticated['request'],
  CreatePaymentIntentUnauthenticated['response']
>().using({
  uri: '/v2/subscriptions/payment-intent/unauthenticated',
  body: (args) => args,
  method: 'POST',
})

type CancelSubscription =
  RouteTypes<'SubscriptionsController_cancelSubscriptionV2'>
export const cancelSubscription = defineMutation<
  CancelSubscription['request'],
  CancelSubscription['response']
>().using({
  uri: (args) => `/v2/subscriptions/${args.subscriptionId}/cancel`,
  method: 'PATCH',
  invalidate: [...combinedSubscriptionKeys, ...combinedTeamKeys],
})

type UncancelSubscription =
  RouteTypes<'SubscriptionsController_uncancelSubscriptionV2'>
export const uncancelSubscription = defineMutation<
  UncancelSubscription['request'],
  UncancelSubscription['response']
>().using({
  uri: (args) => `/v2/subscriptions/${args.subscriptionId}/uncancel`,
  method: 'PATCH',
  invalidate: [...combinedSubscriptionKeys, ...combinedTeamKeys],
})

type UpdateSubscriptionWithTier =
  RouteTypes<'SubscriptionsController_updateSubscriptionWithTier'>
export const updateSubscriptionWithTier = defineMutation<
  UpdateSubscriptionWithTier['request'],
  UpdateSubscriptionWithTier['response']
>().using({
  uri: (args) => `/v2/subscriptions/${args.subscriptionId}`,
  method: 'PATCH',
  invalidate: [...combinedSubscriptionKeys, ...combinedTeamKeys],
})

type GetTierCheckoutInfo =
  RouteTypes<'SubscriptionsController_getTierCheckoutInfo'>
export const getTierCheckoutInfo = defineApi<
  GetTierCheckoutInfo['request'],
  GetTierCheckoutInfo['response']
>().using({
  key: ['checkout-info'],
  uri: '/v2/subscriptions/checkout-info',
  queryOptions: {
    refetchOnMount: false,
    gcTime: Infinity,
    staleTime: 600_000,
  },
})

type GetTierCheckoutInfoUnauthenticated =
  RouteTypes<'SubscriptionsController_getTierCheckoutInfoUnauthenticated'>
export const getTierCheckoutInfoUnauthenticated = defineApi<
  GetTierCheckoutInfoUnauthenticated['request'],
  GetTierCheckoutInfoUnauthenticated['response']
>().using({
  key: ['checkout-info', 'unauthenticated'],
  uri: (args) => {
    const baseUri = '/v2/subscriptions/checkout-info/unauthenticated'
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

type UpgradeFromLegacy = RouteTypes<'SubscriptionsController_upgradeFromLegacy'>
export const upgradeFromLegacy = defineMutation<
  UpgradeFromLegacy['request'],
  UpgradeFromLegacy['response']
>().using({
  uri: (args) => `/v2/subscriptions/${args.subscriptionId}/upgrade-from-legacy`,
  method: 'POST',
  invalidate: [...combinedSubscriptionKeys, ...combinedTeamKeys],
})

type AiCreditsRate = RouteTypes<'SubscriptionsController_aiCreditsRate'>
export const aiCreditsRate = defineApi<
  AiCreditsRate['request'],
  AiCreditsRate['response']
>().using({
  key: (args) => queryKeys.aiCreditsRate(args.subscriptionId),
  uri: (args) => `/v2/subscriptions/${args.subscriptionId}/ai-credits-rates`,
  method: 'GET',
})

type GetPreviewInvoice = RouteTypes<'SubscriptionsController_previewInvoice'>
export const getPreviewInvoice = defineApi<
  GetPreviewInvoice['request'],
  GetPreviewInvoice['response']
>().using({
  key: (args) => queryKeys.previewInvoice(args.subscriptionId),
  uri: (args) => `/v2/subscriptions/${args.subscriptionId}/preview-invoice`,
  queryOptions: {
    refetchOnMount: false,
    gcTime: Infinity,
    staleTime: 600_000,
  },
  method: 'GET',
})
