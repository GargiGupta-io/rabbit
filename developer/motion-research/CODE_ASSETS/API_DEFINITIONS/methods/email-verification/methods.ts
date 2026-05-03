import { createKey, defineApi, defineMutation } from '@motion/rpc'

import type { RouteTypes } from '../types'

export const queryKeys = {
  status: () => createKey('email-verification-status'),
}

export const startEmailVerification = defineMutation<
  RouteTypes<'EmailVerificationController_startEmailVerification'>['request'],
  { sent: boolean }
>().using({
  uri: '/email-verification',
  method: 'POST',
  body: (args) => args,
})

type StartEmailVerificationUnauthenticated =
  RouteTypes<'EmailVerificationController_startEmailVerificationUnauthenticated'>
export const startEmailVerificationUnauthenticated = defineMutation<
  StartEmailVerificationUnauthenticated['request'],
  StartEmailVerificationUnauthenticated['response']
>().using({
  uri: '/email-verification/unauthenticated',
  method: 'POST',
  body: (args) => args,
})

export const verifyEmailVerification = defineMutation<
  RouteTypes<'EmailVerificationController_verifyEmailVerification'>['request'],
  RouteTypes<'EmailVerificationController_verifyEmailVerification'>['response']
>().using({
  uri: '/email-verification/verify',
  method: 'POST',
  body: (args) => args,
  invalidate: queryKeys.status(),
})

type VerifyEmailVerificationUnauthenticated =
  RouteTypes<'EmailVerificationController_verifyEmailVerificationUnauthenticated'>
export const verifyEmailVerificationUnauthenticated = defineMutation<
  VerifyEmailVerificationUnauthenticated['request'],
  VerifyEmailVerificationUnauthenticated['response']
>().using({
  uri: '/email-verification/verify/unauthenticated',
  method: 'POST',
  body: (args) => args,
  invalidate: queryKeys.status(),
})

export const getEmailVerificationStatus = defineApi<
  RouteTypes<'EmailVerificationController_getEmailVerificationStatus'>['request'],
  RouteTypes<'EmailVerificationController_getEmailVerificationStatus'>['response']
>().using({
  uri: '/email-verification',
  method: 'GET',
  key: queryKeys.status(),
})

type GetEmailVerificationStatusUnauthenticated =
  RouteTypes<'EmailVerificationController_getEmailVerificationStatusUnauthenticated'>
export const getEmailVerificationStatusUnauthenticated = defineApi<
  GetEmailVerificationStatusUnauthenticated['request'],
  GetEmailVerificationStatusUnauthenticated['response']
>().using({
  uri: (args) =>
    `/email-verification/unauthenticated?email=${encodeURIComponent(args.email)}`,
  method: 'GET',
  key: queryKeys.status(),
})
