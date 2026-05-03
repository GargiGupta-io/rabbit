import { defineMutation } from '@motion/rpc'

import { RouteTypes } from '../../types'

type CreateConversationMessage =
  RouteTypes<'Conversation_CreateConversationMessage'>

export const createConversationMessage = defineMutation<
  CreateConversationMessage['request'],
  CreateConversationMessage['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `${__NET_HOST__}/v1/communications/conversations/${args.conversationId}/messages`,
  body: ({ conversationId, ...rest }) => rest,
})

type SetAutoResponse = RouteTypes<'Conversation_SetAutoResponse'>

export const setAutoResponse = defineMutation<
  SetAutoResponse['request'],
  SetAutoResponse['response']
>().using({
  method: 'PATCH',
  uri: (args) =>
    `${__NET_HOST__}/v1/communications/conversations/${args.conversationId}/auto-response`,
  body: ({ conversationId, ...rest }) => rest,
})
