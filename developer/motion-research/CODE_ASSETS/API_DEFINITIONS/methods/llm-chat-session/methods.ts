import { createKey, defineApi, defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

export const queryKeys = {
  root: createKey(['v2', 'llm-chat-session']),
  llmChatSessionById: (args: { id: string }) =>
    createKey([...queryKeys.root, args.id]),
}

type QueryLlmChatSessions =
  RouteTypes<'LlmChatSessionsController_querySessions'>
export const queryLlmChatSessions = defineApi<
  QueryLlmChatSessions['request'],
  QueryLlmChatSessions['response']
>().using({
  key: (args) => [queryKeys.root, args],
  uri: () => `/v2/llm-chat/sessions/query`,
  method: 'POST',
})

type GetLlmChatSession = RouteTypes<'LlmChatSessionsController_getSession'>
export const getLlmChatSession = defineApi<
  GetLlmChatSession['request'],
  GetLlmChatSession['response']
>().using({
  key: (args) => queryKeys.llmChatSessionById(args),
  uri: (args) => `/v2/llm-chat/sessions/${args.id}`,
})

type CreateLlmChatSession =
  RouteTypes<'LlmChatSessionsController_createSession'>
export const createLlmChatSession = defineMutation<
  CreateLlmChatSession['request'],
  CreateLlmChatSession['response']
>().using({
  method: 'POST',
  uri: () => `/v2/llm-chat/sessions`,
})

type CreateLlmChatMessage =
  RouteTypes<'LlmChatSessionsController_createMessage'>
export const createLlmChatMessage = defineMutation<
  CreateLlmChatMessage['request'],
  CreateLlmChatMessage['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/llm-chat/sessions/${args.id}/messages`,
})

type UpdateLlmChatMessageFeedback =
  RouteTypes<'LlmChatSessionsController_updateMessageFeedback'>
export const updateLlmChatMessageFeedback = defineMutation<
  UpdateLlmChatMessageFeedback['request'],
  UpdateLlmChatMessageFeedback['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `/v2/llm-chat/sessions/${args.id}/messages/${args.messageId}/feedback`,
})

type ExecuteLlmChatSession =
  RouteTypes<'LlmChatSessionsController_executeSession'>
export const executeLlmChatSession = defineMutation<
  ExecuteLlmChatSession['request'],
  ExecuteLlmChatSession['response']
>().using({
  method: 'POST',
  uri: () => `/v2/llm-chat/sessions/execute`,
})

type StopLlmChatSession = RouteTypes<'LlmChatSessionsController_stopSession'>
export const stopLlmChatSession = defineMutation<
  StopLlmChatSession['request'],
  StopLlmChatSession['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/llm-chat/sessions/${args.id}/stop`,
})

type UpdateLlmChatSession =
  RouteTypes<'LlmChatSessionsController_updateSession'>
export const updateLlmChatSession = defineMutation<
  UpdateLlmChatSession['request'],
  UpdateLlmChatSession['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/llm-chat/sessions/${args.id}`,
})

type DeleteLlmChatSession =
  RouteTypes<'LlmChatSessionsController_deleteSession'>
export const deleteLlmChatSession = defineMutation<
  DeleteLlmChatSession['request'],
  DeleteLlmChatSession['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/llm-chat/sessions/${args.id}`,
})

type GetUserCreditUsage =
  RouteTypes<'LlmChatSessionsController_userCreditUsage'>
export const getUserCreditUsage = defineApi<
  GetUserCreditUsage['request'],
  GetUserCreditUsage['response']
>().using({
  method: 'GET',
  key: () => createKey([...queryKeys.root, 'user-credit-usage']),
  uri: () => `/v2/llm-chat/sessions/user-credit-usage`,
})

type GetAccountCreditUsage =
  RouteTypes<'LlmChatSessionsController_accountCreditUsage'>
export const getAccountCreditUsage = defineApi<
  GetAccountCreditUsage['request'],
  GetAccountCreditUsage['response']
>().using({
  method: 'GET',
  key: () => createKey([...queryKeys.root, 'account-credit-usage']),
  uri: () => `/v2/llm-chat/sessions/account-credit-usage`,
})

type RetryLlmChatSession =
  RouteTypes<'LlmChatSessionsController_retryFromMessage'>
export const retryLlmChatSession = defineMutation<
  RetryLlmChatSession['request'],
  RetryLlmChatSession['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/llm-chat/sessions/${args.id}/retry`,
})
