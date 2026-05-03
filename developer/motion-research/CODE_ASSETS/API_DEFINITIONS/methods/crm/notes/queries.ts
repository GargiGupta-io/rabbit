import { type SingleModelListResponse } from '@motion/motion-net-types'
import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../../types'

type GetNotesForEntityRoute = RouteTypes<'Notes_GetNotesForEntity'>

export type GetNotesForEntityRequest = GetNotesForEntityRoute['request']

type LinkNoteToEntityRoute = RouteTypes<'Notes_LinkNoteToEntity'>

export type LinkNoteToEntityRequest = LinkNoteToEntityRoute['request']

export const getNotesForEntity = defineApi<
  GetNotesForEntityRequest,
  SingleModelListResponse
>().using({
  method: 'GET',
  uri: (args: GetNotesForEntityRequest) =>
    `${__NET_HOST__}/v1/notes/entity/${args.entityId}`,
  key: ({ entityId }) => queryKeys.entityNotes(entityId),
})
