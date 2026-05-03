import { defineApi, defineInfiniteQuery } from '@motion/rpc'

import { queryKeys } from './keys'

import type { RouteTypes } from '../../types'

type GetEmailsBase = RouteTypes<'EmailMessage_GetEmails'>
type GetEmails = {
  request: {
    threadId?: string
    receivedAfter?: string
    receivedBefore?: string
    limit?: number
  }
  response: GetEmailsBase['response']
}

type GetDrafts = RouteTypes<'EmailMessage_GetDrafts'>
type GetDraftAttachments = RouteTypes<'EmailDraftAttachment_ListAttachments'>

type GetEmail = RouteTypes<'EmailMessage_GetEmail'>
type GetDraftByThreadId = RouteTypes<'EmailMessage_GetDraftsByThread'>
type GetAttachmentUrl = RouteTypes<'EmailMessage_GetAttachmentUrl'>
type GetDraftAttachmentUrl = RouteTypes<'EmailDraftAttachment_GetAttachmentUrl'>
type GetSyncStatus = RouteTypes<'EmailSync_GetSyncStatus'>
type GetAccountMetadata = RouteTypes<'EmailMessage_GetAccountMetadata'>
type SearchEmails = RouteTypes<'EmailMessage_SearchEmails'>

export const getInfiniteEmails = defineInfiniteQuery<
  GetEmails['request'],
  GetEmails['response']
>().using({
  key: (args) => queryKeys.infinite(),
  uri: (args) => `${__NET_HOST__}/v1/api/emails`,
  getNextPageParam: (lastPage) => {
    const lastId = lastPage.ids.at(-1)
    if (!lastId) return undefined

    const last = lastPage.models.emailMessages[lastId]
    if (!last) return undefined
    return { receivedBefore: last.receivedDate }
  },
  initialPageParam: undefined,
})

// Email data endpoints
export const getEmails = defineApi<
  GetEmails['request'],
  GetEmails['response']
>().using({
  uri: (opts) => {
    const url = new URL(`${__NET_HOST__}/v1/api/emails`)
    if (opts?.threadId) {
      url.searchParams.set('threadId', opts.threadId)
    }
    if (opts?.receivedAfter) {
      url.searchParams.set('receivedAfter', opts.receivedAfter)
    }
    if (opts?.receivedBefore) {
      url.searchParams.set('receivedBefore', opts.receivedBefore)
    }
    if (opts?.limit !== undefined) {
      url.searchParams.set('limit', String(opts.limit))
    }
    return url.toString()
  },
  key: (args) => [...queryKeys.emails(), args?.threadId || 'all'],
})

type GetEmailThread = RouteTypes<'EmailMessage_GetEmailThread'>
export const getEmailThread = defineApi<
  GetEmailThread['request'],
  GetEmailThread['response']
>().using({
  uri: (opts) => `${__NET_HOST__}/v1/api/emails/${opts.id}/thread`,
  key: (args) => queryKeys.email(args.id),
})

export const getDrafts = defineApi<
  GetDrafts['request'],
  GetDrafts['response']
>().using({
  uri: `${__NET_HOST__}/v1/api/emails/drafts`,
  key: (args) => queryKeys.drafts(),
})

export const getEmail = defineApi<
  GetEmail['request'],
  GetEmail['response']
>().using({
  uri: (opts) => `${__NET_HOST__}/v1/api/emails/${opts.id}`,
  key: (args) => queryKeys.email(args.id),
})

export const getDraft = defineApi<
  GetDraftByThreadId['request'],
  GetDraftByThreadId['response']
>().using({
  uri: (opts) =>
    `${__NET_HOST__}/v1/api/emails/drafts/by-thread/${opts.threadId}`,
  key: (args) => queryKeys.draft(args.threadId),
})

export const getDraftAttachments = defineApi<
  GetDraftAttachments['request'],
  GetDraftAttachments['response']
>().using({
  uri: (opts) =>
    `${__NET_HOST__}/v1/api/emails/drafts/${opts.draftId}/attachments`,
  key: (args) => queryKeys.draftAttachments(args.draftId),
})

// Attachment URL endpoint
export const getAttachmentUrl = defineApi<
  GetAttachmentUrl['request'],
  GetAttachmentUrl['response']
>().using({
  uri: (opts) =>
    `${__NET_HOST__}/v1/api/emails/messages/${opts.messageId}/attachments/${opts.attachmentId}/url`,
  key: (opts) => queryKeys.attachmentUrl(opts.messageId, opts.attachmentId),
})

// Attachment URL endpoint
export const getDraftAttachmentUrl = defineApi<
  GetDraftAttachmentUrl['request'],
  GetDraftAttachmentUrl['response']
>().using({
  uri: (opts) =>
    `${__NET_HOST__}/v1/api/emails/drafts/${opts.draftId}/attachments/${opts.attachmentId}/url`,
  key: (opts) => queryKeys.attachmentUrl(opts.draftId, opts.attachmentId),
})

export const getSyncStatus = defineApi<
  GetSyncStatus['request'],
  GetSyncStatus['response']
>().using({
  uri: (opts) => `${__NET_HOST__}/v1/api/email/sync/${opts.workflowId}/status`,
  key: (opts) => [...queryKeys.syncStatus(), opts.workflowId],
})

// Account metadata endpoint
export const getAccountMetadata = defineApi<
  GetAccountMetadata['request'],
  GetAccountMetadata['response']
>().using({
  uri: (opts) => {
    const url = `${__NET_HOST__}/v1/api/emails/account-inbox-metadata`
    return opts.accountId ? `${url}?accountId=${opts.accountId}` : url
  },
  key: (opts) => [...queryKeys.accountMetadata(), opts?.accountId || 'all'],
})

// Email search endpoint
export const searchEmails = defineApi<
  SearchEmails['request'],
  SearchEmails['response']
>().using({
  uri: (opts) => {
    const params = new URLSearchParams()
    if (opts?.query) {
      params.set('query', opts.query)
    }
    if (opts?.maxResults !== undefined) {
      params.set('maxResults', String(opts.maxResults))
    }
    const queryString = params.toString()
    return `${__NET_HOST__}/v1/api/emails/search${queryString ? `?${queryString}` : ''}`
  },
  key: (args) => queryKeys.search(args?.query),
})
