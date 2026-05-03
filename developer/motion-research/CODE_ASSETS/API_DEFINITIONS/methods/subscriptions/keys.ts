import { createKey } from '@motion/rpc'

const root = createKey('subscriptions')
const rootV2 = createKey(['v2', 'subscriptions'])

export const queryKeys = {
  root,
  individualAndTeam: [
    ...root,
    {
      individual: true,
      team: true,
    },
  ],
  paymentMethod: createKey(root, 'paymentMethod'),
  trial: createKey(root, 'trial'),
  rootV2,
  creditsPreview: createKey(rootV2, 'creditsPreview'),
  aiCreditsRate: (subId: string) => createKey(rootV2, subId),
  previewInvoice: (subId: string) => createKey(rootV2, subId, 'previewInvoice'),
}

export const combinedSubscriptionKeys = [
  queryKeys.individualAndTeam,
  queryKeys.rootV2,
]
export const allSubscriptionKeys = [
  queryKeys.root,
  queryKeys.individualAndTeam,
  queryKeys.rootV2,
]
