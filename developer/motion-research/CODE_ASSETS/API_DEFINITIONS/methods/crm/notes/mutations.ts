import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'
import { type LinkNoteToEntityRequest } from './queries'

import { RouteTypes } from '../../types'

type UnlinkNoteFromEntityRoute = RouteTypes<'Notes_UnlinkNoteFromEntity'>

export type UnlinkNoteFromEntityRequest = UnlinkNoteFromEntityRoute['request']

export const linkNoteToEntity = defineMutation<
  LinkNoteToEntityRequest,
  void
>().using({
  method: 'POST',
  uri: (args) => `${__NET_HOST__}/v1/notes/${args.noteId}/entity-links`,
  body: ({ noteId, ...rest }) => rest,
  invalidate: (args) => [queryKeys.entityNotes(args.entityId)],
})

export const unlinkNoteFromEntity = defineMutation<
  UnlinkNoteFromEntityRequest,
  void
>().using({
  method: 'DELETE',
  uri: (args) => `${__NET_HOST__}/v1/notes/${args.noteId}/entity-links`,
  body: ({ noteId, ...rest }) => rest,
  invalidate: (args) => [queryKeys.entityNotes(args.entityId)],
})
