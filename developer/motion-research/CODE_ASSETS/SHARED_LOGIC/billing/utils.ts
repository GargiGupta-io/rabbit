import { ACTIVE_SUBSCRIPTION_STATUSES } from './constants'

export const isActiveStatus = (
  status?: string
): status is (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number] => {
  if (!status) return false
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(status)
}

export const quantityFromSubscription = (subscription: {
  items?: { data?: { quantity?: number }[] }
}): number =>
  subscription?.items?.data?.reduce(
    (acc, item) => acc + (item.quantity ?? 0),
    0
  ) ?? 0

export const isSubscriptionMonthly = (subscription: {
  items?: { data: { plan: { interval: string } }[] }
}): boolean => subscription?.items?.data[0]?.plan?.interval === 'month'

export const iapTransactionIdFromSubscription = (subscription: {
  metadata?: { iap_transaction_id?: string }
}): string | null => subscription.metadata?.iap_transaction_id ?? null
