import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import type { RouteTypes } from '../../types'

type SendEmail = RouteTypes<'EmailMessage_SendEmail'>
type BatchUpdate = RouteTypes<'EmailMessage_BatchUpdate'>
type UpsertDraft = RouteTypes<'EmailMessage_UpsertDraft'>
type DeleteDraft = RouteTypes<'EmailMessage_DeleteDraft'>
type DeleteDraftAttachment = RouteTypes<'EmailDraftAttachment_DeleteAttachment'>

type StartSync = RouteTypes<'EmailSync_StartSync'>

export const sendEmail = defineMutation<
  SendEmail['request'],
  SendEmail['response']
>().using({
  uri: `${__NET_HOST__}/v1/api/emails/send`,
  body: (opts) => opts,
  invalidate: queryKeys.emails(),
})

export const upsertDraft = defineMutation<
  UpsertDraft['request'],
  UpsertDraft['response']
>().using({
  uri: `${__NET_HOST__}/v1/api/emails/drafts`,
  body: (opts) => opts,
  invalidate: (opts) =>
    opts.id ? queryKeys.draft(opts.id) : queryKeys.drafts(),
})

export const deleteDraft = defineMutation<
  DeleteDraft['request'],
  DeleteDraft['response']
>().using({
  uri: (opts) => `${__NET_HOST__}/v1/api/emails/drafts/${opts.id}`,
  method: 'DELETE',
  invalidate: (opts) => queryKeys.draft(opts.id),
})

// Batch update mutation
export const batchUpdate = defineMutation<
  BatchUpdate['request'],
  BatchUpdate['response']
>().using({
  uri: `${__NET_HOST__}/v1/api/emails/batch`,
  body: (opts) => opts,
  invalidate: queryKeys.emails(),
})

export const startSync = defineMutation<
  StartSync['request'],
  StartSync['response']
>().using({
  uri: `${__NET_HOST__}/v1/api/email/sync`,
  body: (opts) => opts,
  invalidate: queryKeys.syncStatus(),
})

export const deleteDraftAttachment = defineMutation<
  DeleteDraftAttachment['request'],
  DeleteDraftAttachment['response']
>().using({
  uri: (opts) =>
    `${__NET_HOST__}/v1/api/emails/drafts/${opts.draftId}/attachments/${opts.attachmentId}`,
  method: 'DELETE',
  invalidate: (opts) => [
    queryKeys.draftAttachments(opts.draftId),
    queryKeys.draft(opts.draftId),
  ],
})
