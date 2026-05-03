/**
 * The values here map to the expected api property
 * values being toggled in the backend.
 */
export enum NotificationPreferenceId {
  BrowserMeetingReminder = 'browserMeetingReminder',
  BrowserTaskReminder = 'browserTaskReminder',
  BrowserMentionedInComment = 'browserMentionedInComment',
  BrowserMentionedInNote = 'browserMentionedInNote',
  BrowserTaskAssignedToYou = 'browserTaskAssignedToYou',
  BrowserTaskStatusChanged = 'browserTaskStatusChanged',
  BrowserAIAgents = 'browserAIAgents',
  BrowserAIFailure = 'browserAIFailure',

  EmailTaskAssignedToYou = 'emailTaskAssignedToYou',
  EmailTaskStatusChanged = 'emailTaskStatusChanged',
  EmailMentionedInComment = 'emailMentionedInComment',
  EmailMentionedInNote = 'emailMentionedInNote',
  EmailTaskArchived = 'emailTaskArchived',
  EmailTaskCreated = 'emailTaskCreated',
  EmailFlows = 'emailFlows',
  EmailAIAgents = 'emailAIAgents',
  EmailAIFailure = 'emailAIFailure',
  EmailBulkOperations = 'emailBulkOperations',

  MobileTaskAssignedToYou = 'mobileTaskAssignedToYou',
  MobileTaskStatusChanged = 'mobileTaskStatusChanged',
  MobileMentionedInComment = 'mobileMentionedInComment',
  MobileMentionedInNote = 'mobileMentionedInNote',
  MobileTaskAutoArchived = 'mobileTaskArchived',
  MobileAIAgents = 'mobileAIAgents',
  MobileAIFailure = 'mobileAIFailure',

  InboxTaskAssignedToYou = 'inboxTaskAssignedToYou',
  InboxTaskStatusChanged = 'inboxTaskStatusChanged',
  InboxMentionedInComment = 'inboxMentionedInComment',
  InboxMentionedInNote = 'inboxMentionedInNote',
  InboxFlows = 'inboxFlows',
  InboxAIAgents = 'inboxAIAgents',
  InboxAIFailure = 'inboxAIFailure',
}

export type NotificationPreferenceEntry = {
  id: NotificationPreferenceId
  title: string
}

export const browserNotifications: NotificationPreferenceEntry[] = [
  {
    id: NotificationPreferenceId.BrowserMeetingReminder,
    title: 'Meeting Reminders',
  },
  {
    id: NotificationPreferenceId.BrowserTaskReminder,
    title: 'Task Reminders',
  },
  {
    id: NotificationPreferenceId.BrowserMentionedInComment,
    title: 'Mentioned in comment',
  },
  {
    id: NotificationPreferenceId.BrowserMentionedInNote,
    title: 'Mentioned in document',
  },
  {
    id: NotificationPreferenceId.BrowserTaskAssignedToYou,
    title: 'Task assigned to you',
  },
  {
    id: NotificationPreferenceId.BrowserTaskStatusChanged,
    title: 'Task Status changed',
  },
  {
    id: NotificationPreferenceId.BrowserAIAgents,
    title: 'AI employee notifications',
  },
  {
    id: NotificationPreferenceId.BrowserAIFailure,
    title: 'AI employee failure',
  },
]

export const emailNotifications: NotificationPreferenceEntry[] = [
  {
    id: NotificationPreferenceId.EmailTaskAssignedToYou,
    title: 'Task assigned to you',
  },
  {
    id: NotificationPreferenceId.EmailTaskStatusChanged,
    title: 'Task Status changed',
  },
  {
    id: NotificationPreferenceId.EmailAIAgents,
    title: 'AI employee notifications',
  },
  {
    id: NotificationPreferenceId.EmailAIFailure,
    title: 'AI employee failure',
  },
  {
    id: NotificationPreferenceId.EmailMentionedInComment,
    title: 'Mentioned in comment',
  },
  {
    id: NotificationPreferenceId.EmailMentionedInNote,
    title: 'Mentioned in document',
  },
  {
    id: NotificationPreferenceId.EmailTaskArchived,
    title: 'Task auto-archived',
  },
  {
    id: NotificationPreferenceId.EmailTaskCreated,
    title: 'Task Created with Siri',
  },
  {
    id: NotificationPreferenceId.EmailFlows,
    title: 'Project stage changes',
  },
  {
    id: NotificationPreferenceId.EmailBulkOperations,
    title: 'Bulk operation performed',
  },
]

export const mobileNotifications: NotificationPreferenceEntry[] = [
  {
    id: NotificationPreferenceId.MobileTaskAssignedToYou,
    title: 'Task assigned to you',
  },
  {
    id: NotificationPreferenceId.MobileTaskStatusChanged,
    title: 'Task Status changed',
  },
  {
    id: NotificationPreferenceId.MobileAIAgents,
    title: 'AI employee notifications',
  },
  {
    id: NotificationPreferenceId.MobileAIFailure,
    title: 'AI employee failure',
  },
  {
    id: NotificationPreferenceId.MobileMentionedInComment,
    title: 'Mentioned in comment',
  },
  {
    id: NotificationPreferenceId.MobileMentionedInNote,
    title: 'Mentioned in document',
  },
]

export const inboxNotifications: NotificationPreferenceEntry[] = [
  {
    id: NotificationPreferenceId.InboxTaskAssignedToYou,
    title: 'Task assigned to you',
  },
  {
    id: NotificationPreferenceId.InboxTaskStatusChanged,
    title: 'Task Status changed',
  },
  {
    id: NotificationPreferenceId.InboxMentionedInComment,
    title: 'Mentioned in comment',
  },
  {
    id: NotificationPreferenceId.InboxMentionedInNote,
    title: 'Mentioned in document',
  },
  {
    id: NotificationPreferenceId.InboxFlows,
    title: 'Project stage changes',
  },
  {
    id: NotificationPreferenceId.InboxAIAgents,
    title: 'AI employee notifications',
  },
  {
    id: NotificationPreferenceId.InboxAIFailure,
    title: 'AI employee failure',
  },
]
