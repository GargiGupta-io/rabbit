import { createKey, defineApi, defineMutation } from '@motion/rpc'

import type { RouteTypes } from '../types'

const queryKeys = {
  root: () => createKey('tutorials'),
  user: () => createKey(queryKeys.root(), 'user'),
}

export const getTutorialPayload = defineApi<
  RouteTypes<'TutorialsController_getCoursePayload'>['request'],
  RouteTypes<'TutorialsController_getCoursePayload'>['response']
>().using({
  uri: 'tutorials/course-payload',
  method: 'GET',
  key: queryKeys.root(),
  queryOptions: {
    staleTime: 600_000,
  },
})

export const getUserTutorialCompletion = defineApi<
  RouteTypes<'TutorialsController_get'>['request'],
  RouteTypes<'TutorialsController_get'>['response']
>().using({
  uri: 'tutorials',
  method: 'GET',
  key: queryKeys.user(),
})

export const addUserTutorialCompletion = defineMutation<
  RouteTypes<'TutorialsController_addCompletedTutorial'>['request'],
  RouteTypes<'TutorialsController_addCompletedTutorial'>['response']
>().using({
  uri: 'tutorials/complete',
  method: 'POST',
  invalidate: queryKeys.user(),
  body: (args) => args,
})
