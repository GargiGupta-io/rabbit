import { z } from 'zod/v4'

// Default inbox filter value - used consistently across frontend and backend
export const DEFAULT_INBOX_FILTER = 'unread'

// Shared enum for inbox filter options
export const InboxFilterSchema = z.enum([DEFAULT_INBOX_FILTER, 'all'])
export type InboxFilter = z.infer<typeof InboxFilterSchema>

export const UserNotificationPreferencesSchema = z.object({
  id: z.string(),
  userId: z.string(),
  browserTaskAssignedToYou: z.boolean(),
  browserTaskStatusChanged: z.boolean(),
  browserMentionedInComment: z.boolean(),
  browserMentionedInNote: z.boolean(),
  browserMeetingReminder: z.boolean(),
  browserTaskReminder: z.boolean(),
  browserAIAgents: z.boolean(),
  browserAIFailure: z.boolean(),
  emailTaskAssignedToYou: z.boolean(),
  emailTaskStatusChanged: z.boolean(),
  emailMentionedInComment: z.boolean(),
  emailMentionedInNote: z.boolean(),
  emailTaskArchived: z.boolean(),
  emailTaskCreated: z.boolean(),
  emailFlows: z.boolean(),
  emailAIAgents: z.boolean(),
  emailBulkOperations: z.boolean(),
  emailAIFailure: z.boolean(),
  mobileTaskAssignedToYou: z.boolean(),
  mobileTaskStatusChanged: z.boolean(),
  mobileMentionedInComment: z.boolean(),
  mobileMentionedInNote: z.boolean(),
  mobileTaskArchived: z.boolean(),
  mobileTaskCreated: z.boolean(),
  mobileTaskReminder: z.boolean(),
  mobileAIAgents: z.boolean(),
  mobileAIFailure: z.boolean(),
  inboxTaskAssignedToYou: z.boolean(),
  inboxTaskStatusChanged: z.boolean(),
  inboxMentionedInComment: z.boolean(),
  inboxMentionedInNote: z.boolean(),
  inboxFlows: z.boolean(),
  inboxAIAgents: z.boolean(),
  inboxAIFailure: z.boolean(),
  defaultInboxFilter: InboxFilterSchema,
})

export type UserNotificationPreferences = z.infer<
  typeof UserNotificationPreferencesSchema
>
