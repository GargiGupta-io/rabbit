import { createKey } from '@motion/rpc'

// For persistent query strings irrespective of the args
export const EMAILS_ROOT_KEYS: Record<string, string> = {
  email: 'email',
  emails: 'emails',
  drafts: 'drafts',
  draft: 'draft',
  syncStatus: 'sync-status',
  accountMetadata: 'account-metadata',
  search: 'search',
  attachmentUrl: 'attachment-url',
  infinite: 'infinite',
  draftAttachments: 'draft-attachments',
  commsItems: 'comms/inbox',
}

export const queryKeys = {
  root: () => createKey('emails'),
  email: (id: string) =>
    createKey(queryKeys.root(), EMAILS_ROOT_KEYS.email, id),
  emails: () => createKey(queryKeys.root()),
  search: (query?: string) =>
    createKey(queryKeys.root(), EMAILS_ROOT_KEYS.search, query || ''),
  drafts: () => createKey(queryKeys.root(), EMAILS_ROOT_KEYS.drafts),
  draft: (id: string) =>
    createKey(
      queryKeys.root(),
      EMAILS_ROOT_KEYS.drafts,
      EMAILS_ROOT_KEYS.draft,
      id
    ),
  draftAttachments: (id: string) =>
    createKey(queryKeys.root(), EMAILS_ROOT_KEYS.draftAttachments, id),
  syncStatus: () => createKey(queryKeys.root(), EMAILS_ROOT_KEYS.syncStatus),
  accountMetadata: () =>
    createKey(queryKeys.root(), EMAILS_ROOT_KEYS.accountMetadata),
  attachmentUrl: (messageId: string, attachmentId: string) =>
    createKey(
      queryKeys.root(),
      EMAILS_ROOT_KEYS.attachmentUrl,
      messageId,
      attachmentId
    ),
  infinite: () => createKey(queryKeys.root(), EMAILS_ROOT_KEYS.infinite),
}
