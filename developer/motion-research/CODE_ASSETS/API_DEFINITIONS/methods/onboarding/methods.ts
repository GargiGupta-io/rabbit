import { createKey, defineApi, defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

export type UpdateOnboardingResponse =
  RouteTypes<'OnboardingController_updateOnboardingResponse'>

export const updateOnboardingResponse = defineMutation<
  UpdateOnboardingResponse['request'],
  UpdateOnboardingResponse['response']
>().using({
  uri: '/onboarding/response',
  method: 'PATCH',
  body: (args) => args,
})

export type GetProjectSuggestions =
  RouteTypes<'OnboardingController_getProjectSuggestions'>

export const getProjectSuggestions = defineApi<
  GetProjectSuggestions['request'],
  GetProjectSuggestions['response']
>().using({
  key: () => createKey(['onboarding', 'project-suggestions']),
  uri: '/onboarding/project-suggestions',
  queryOptions: {
    staleTime: 5 * 60 * 1000, // 5 minutes
  },
})

export type GenerateProjectDescription =
  RouteTypes<'OnboardingController_generateProjectDescription'>

export const generateProjectDescription = defineMutation<
  GenerateProjectDescription['request'],
  GenerateProjectDescription['response']
>().using({
  uri: '/onboarding/project-description',
  method: 'POST',
  body: (args) => args,
})
