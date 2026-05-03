// Define the base type

// import { AIChatToolData } from '@motion/ai-chat'

import { SupportedIntegrationPlatforms } from '../integrations'

export type BaseEvent<T extends string, P> = {
  type: T
  data: P
}

type IdWithWorkspaceId = { id: string; workspaceId: string }

type BlockingTimeslot = {
  id: string
  userId: string
  startTime: string // ISO string
  endTime: string // ISO string
}

type Stage = IdWithWorkspaceId & {
  projectId: string
  dueDate: string
  canceledTime: string | null
  completedTime: string | null
  visitedTime: string | null
  completedDuration: number
  duration: number
  canceledDuration: number
  completedTaskCount: number
  taskCount: number
  canceledTaskCount: number
}

type EtaUpdate = IdWithWorkspaceId & {
  estimatedCompletionTime: string | null
  scheduledStatus: string | null
  deadlineStatus: string
}

type BookingEvents =
  | BaseEvent<
      'booking.template.created',
      { template: { id: string; createdByUserId: string } }
    >
  | BaseEvent<
      'booking.template.updated',
      { template: { id: string; createdByUserId: string } }
    >
  | BaseEvent<
      'booking.template.deleted',
      { template: { id: string; createdByUserId: string } }
    >

type CalendarEvents =
  | BaseEvent<
      'calendar.temporaryEvents',
      {
        calendarId: string
        email: string
        type: string
        userId: string
        events: unknown[]
      }
    >
  | BaseEvent<
      'calendar.updated',
      { calendarId: string; email: string; type: string; userId: string }
    >
  | BaseEvent<'calendarEntry.created', { calendar: { id: string } }>
  | BaseEvent<'calendarEntry.updated', { calendar: { id: string } }>
  | BaseEvent<'calendarEntry.deleted', { calendar: { id: string } }>
  | BaseEvent<
      'blockingTimeslot.create',
      {
        blockingTimeslot: BlockingTimeslot
      }
    >
  | BaseEvent<'blockingTimeslot.update', { blockingTimeslot: BlockingTimeslot }>

type TeamTaskEvents =
  | BaseEvent<
      'workspace.tasksScheduled',
      {
        workspaceId: string
        mutations: {
          create: string[]
          update: string[]
          delete: string[]
        }
      }
    >
  | BaseEvent<
      'workspace.task.create',
      { task: IdWithWorkspaceId & { projectId: string | null } }
    >
  | BaseEvent<
      'workspace.task.update',
      { task: IdWithWorkspaceId & { projectId: string | null } }
    >
  | BaseEvent<
      'workspace.task.delete',
      { task: IdWithWorkspaceId & { projectId: string | null } }
    >
  | BaseEvent<
      'workspace.tasks.bulk.deleted',
      {
        workspaceId: string
        taskIds: string[]
        results: {
          total: number
          failures: number
        }
        requesterId: string
      }
    >
  | BaseEvent<
      'workspace.tasks.bulk.updated',
      {
        workspaceId: string
        taskIds: string[]
        results: {
          total: number
          failures: number
          failedTaskIds: string[]
        }
        requesterId?: string
      }
    >

type RecurringTaskEvents =
  | BaseEvent<'workspace.recurringTask.create', { task: IdWithWorkspaceId }>
  | BaseEvent<'workspace.recurringTask.update', { task: IdWithWorkspaceId }>
  | BaseEvent<'workspace.recurringTask.delete', { task: IdWithWorkspaceId }>

type ProjectEvents =
  | BaseEvent<'workspace.project.create', { project: IdWithWorkspaceId }>
  | BaseEvent<'workspace.project.update', { project: IdWithWorkspaceId }>
  | BaseEvent<'workspace.project.delete', { project: IdWithWorkspaceId }>
  | BaseEvent<
      'workspace.projects.bulk.deleted',
      {
        workspaceId: string
        projectIds: string[]
        results: {
          taskResults: {
            total: number
            failures: number
          }
          projectResults: {
            total: number
            failures: number
          }
        }
        requesterId: string
      }
    >
  | BaseEvent<
      'workspace.projects.bulk.updated',
      {
        workspaceId: string
        projectIds: string[]
        results: {
          total: number
          failures: number
          failedProjectIds: string[]
        }
        requesterId: string
      }
    >
  | BaseEvent<
      'workspace.project.stats.update',
      {
        project: IdWithWorkspaceId & {
          completedDuration: number
          duration: number
          canceledDuration: number
          completedTaskCount: number
          taskCount: number
          canceledTaskCount: number
        }
      }
    >
  | BaseEvent<'workspace.project.eta.update', { project: EtaUpdate }>

type ProjectGuestPermissionsEvents = BaseEvent<
  'workspace.project-guest-permissions.update',
  { projectId: string }
>

type WorkspaceEvents =
  | BaseEvent<'workspace.created', { workspace: { id: string } }>
  | BaseEvent<'workspace.updated', { workspace: { id: string } }>
  | BaseEvent<'workspace.deleted', { workspace: { id: string } }>
  | BaseEvent<
      'workspace.member.added',
      {
        member: IdWithWorkspaceId & { userId: string }
      }
    >
  | BaseEvent<
      'workspace.member.updated',
      {
        member: IdWithWorkspaceId & { userId: string }
      }
    >
  | BaseEvent<
      'workspace.member.deleted',
      {
        member: IdWithWorkspaceId & { userId: string }
      }
    >

type StatusEvents =
  | BaseEvent<'workspace.status.create', { status: IdWithWorkspaceId }>
  | BaseEvent<'workspace.status.update', { status: IdWithWorkspaceId }>
  | BaseEvent<'workspace.status.delete', { status: IdWithWorkspaceId }>

type LabelEvents =
  | BaseEvent<'workspace.label.create', { label: IdWithWorkspaceId }>
  | BaseEvent<'workspace.label.update', { label: IdWithWorkspaceId }>
  | BaseEvent<'workspace.label.delete', { label: IdWithWorkspaceId }>

type StageEvents =
  | BaseEvent<'workspace.stage.create', { stage: Stage }>
  | BaseEvent<'workspace.stage.update', { stage: Stage }>
  | BaseEvent<
      'workspace.stage.delete',
      { stage: IdWithWorkspaceId & { projectId: string } }
    >
  | BaseEvent<
      'workspace.stage.visited',
      {
        stage: Stage
        taskIds: string[]
      }
    >
  | BaseEvent<
      'workspace.stage.eta.update',
      { stage: EtaUpdate & { projectId: string } }
    >

type CustomFieldSocketEvent = {
  id: string
  name: string
  type: string
  metadata: any
  workspaceId: string
}
type CustomFieldEvents =
  | BaseEvent<
      'workspace.customField.create',
      {
        customField: CustomFieldSocketEvent
      }
    >
  | BaseEvent<
      'workspace.customField.update',
      {
        customField: CustomFieldSocketEvent
      }
    >
  | BaseEvent<'workspace.customField.delete', { customField: string }>

type FolderEvents =
  | BaseEvent<
      'folder.item.created',
      { folderItem: { id: string; folderId: string } }
    >
  | BaseEvent<
      'folder.item.updated',
      { folderItem: { id: string; folderId: string } }
    >
  | BaseEvent<
      'folder.item.deleted',
      { folderItem: { id: string; folderId: string } }
    >
  | BaseEvent<'folder.created', { folder: { id: string } }>
  | BaseEvent<'folder.updated', { folder: { id: string } }>
  | BaseEvent<'folder.deleted', { folder: { id: string } }>

type UserEvents =
  | BaseEvent<'user-settings.updated', void>
  | BaseEvent<'user.subscription.refresh', void>
  | BaseEvent<'user.email.verified', void>
  | BaseEvent<'onboarding.reset', void>
  | BaseEvent<'emailAccount.created', { emailAccountId: string }>
  | BaseEvent<'emailAccount.needsRefresh', void>
  | BaseEvent<
      'emailAccount.errorOccurred',
      { emailAccountId: string; status: string }
    >
  | BaseEvent<'emailAccount.updated', { emailAccountId: string }>
  | BaseEvent<'emailAccount.deleted', { emailAccountId: string }>
  | BaseEvent<
      'emailAccount.primaryCalendarChanged',
      { emailAccountId: string; primaryCalendarId: string }
    >

type TeamEvents =
  | BaseEvent<'team.memberInvited', { pendingUserId?: string }>
  | BaseEvent<'team.memberJoined', { pendingUserId: string; userId: string }>

type ActivityFeedEvents = BaseEvent<
  'feed.updated',
  { id: string; modelType: 'task' | 'project' | 'note' }
>

type MiscEvents = BaseEvent<'ff.refetch', void>

type UploadedFile = {
  id: string
  type: 'attachment' | 'description-image'
  fileName: string
  fileSize: number
  mimeType: string
  createdTime: string
  updatedTime: string | null
  createdByUserId: string
  workspaceId: string | null
  taskId: string | null
  projectId: string | null
  recurringTaskId: string | null
  commentId: string | null
  targetType:
    | 'TEAM_TASK'
    | 'PROJECT'
    | 'RECURRING_TASK'
    | 'TASK_DEFINITION'
    | 'PROJECT_DEFINITION'
    | 'NOTE'
    | 'CONTACT'
    | 'COMPANY'
    | 'DEAL'
    | null
  targetId: string | null
}

type UploadedFileEvents =
  | BaseEvent<'uploadedFile.created', { uploadedFile: UploadedFile }>
  | BaseEvent<'uploadedFile.updated', { uploadedFile: UploadedFile }>
  | BaseEvent<'uploadedFile.deleted', { uploadedFile: UploadedFile }>

type DefinitionEvents =
  | BaseEvent<
      'workspace.definition.reconciled',
      {
        workspaceId: string
        definitionId: string
        updatedProjectIds: string[]
        createdStageIds: string[]
        updatedStageIds: string[]
        createdTaskIds: string[]
        updatedTaskIds: string[]
        deletedTaskIds: string[]
      }
    >
  | BaseEvent<
      'workspace.definition.updated',
      {
        workspaceId: string
        definitionId: string
      }
    >
  | BaseEvent<
      'workspace.project.definition.created',
      {
        workspaceId: string
        id: string
      }
    >
  | BaseEvent<
      'workspace.project.definition.updated',
      {
        workspaceId: string
        id: string
      }
    >
  | BaseEvent<
      'workspace.project.definition.deleted',
      {
        workspaceId: string
        id: string
      }
    >
  | BaseEvent<
      'workspace.stage.definition.created',
      {
        workspaceId: string
        id: string
      }
    >
  | BaseEvent<
      'workspace.stage.definition.updated',
      {
        workspaceId: string
        id: string
        referencingProjectDefinitionIds: string[]
      }
    >
  | BaseEvent<
      'workspace.stage.definition.deleted',
      {
        workspaceId: string
        id: string
        referencingProjectDefinitionIds: string[]
      }
    >
  | BaseEvent<
      'workspace.project.definition.reconciled',
      {
        updatedProjectIds: string[]
        createdTaskIds: string[]
        updatedTaskIds: string[]
        deletedTaskIds: string[]
      }
    >

type NoteEvents =
  | BaseEvent<
      'workspace.note.created',
      { note: IdWithWorkspaceId & { projectId?: string } }
    >
  | BaseEvent<'workspace.note.updated', { note: IdWithWorkspaceId }>
  | BaseEvent<'workspace.note.deleted', { note: IdWithWorkspaceId }>

type FeaturePermissionsEvents =
  | BaseEvent<'featurePermissionsOverage.updated', void>
  | BaseEvent<'featurePermissionsUsage.updated', void>
  | BaseEvent<'featurePermissionsTier.updated', void>

type NotetakerEvents =
  | BaseEvent<'meetingInsights.created', { meetingInsights: { id: string } }>
  | BaseEvent<'meetingInsights.updated', { meetingInsights: { id: string } }>
  | BaseEvent<'meetingInsights.deleted', { meetingInsights: { id: string } }>
  | BaseEvent<
      'meetingInsights.status.updated',
      {
        meetingInsights: { id: string }
        meetingBotStatus: string
        statusDetail?: string
      }
    >

type PermissionEvents = BaseEvent<
  'permission.resource.shared',
  {
    sharedResource: {
      id: string
      type: string
    }
  }
>

type IntegrationConfigEvents =
  | BaseEvent<
      'integrationConfig.created',
      {
        integrationConfig: {
          id: string
          platform: SupportedIntegrationPlatforms
        }
      }
    >
  | BaseEvent<
      'integrationConfig.updated',
      {
        integrationConfig: {
          id: string
          platform: SupportedIntegrationPlatforms
        }
      }
    >
  | BaseEvent<
      'integrationConfig.deleted',
      {
        integrationConfig: {
          id: string
          platform: SupportedIntegrationPlatforms
        }
      }
    >

// Agent workflow event payload types
type AgentWorkflowRunPayload = {
  workflowRunId: string
  workflowId: string
  status: string
  createdTime: string
  completedTime: string | null
}

type AgentStepRunPayload = {
  stepRunId: string
  workflowRunId: string
  stepId: string
  workflowId: string
  status: string
  createdTime: string
  completedTime: string | null
}

type AgentWorkflowDeployedPayload = {
  status: 'success' | 'failure'
  deploymentId?: string
  deployedFromWorkflowId: string
  versionGroupId: string
  workflowName: string
  requesterUserId: string
  deployedUserId: string
  isIncomplete?: boolean
  createdTime?: string
  error?: string
}

// Agent workflow event scopes
type AgentWorkflowScope = 'workspace' | 'user' | 'team'

// Generate all agent workflow events using template literal types
type AgentWorkflowEvents =
  | BaseEvent<
      `${AgentWorkflowScope}.agentWorkflow.workflow.run`,
      AgentWorkflowRunPayload
    >
  | BaseEvent<
      `${AgentWorkflowScope}.agentWorkflow.step.run`,
      AgentStepRunPayload
    >
  | BaseEvent<'agent.workflow.deployed', AgentWorkflowDeployedPayload>

type ViewEvents = BaseEvent<'view.created', { view: { id: string } }>

type LlmChatEvents =
  | BaseEvent<
      'llm.chat.session.updated',
      {
        session: {
          llmChatSessionId: string
          title?: string
          executionStartedTime?: string
        }
      }
    >
  | BaseEvent<
      'llm.chat.session.deleted',
      { session: { llmChatSessionId: string } }
    >
  | BaseEvent<
      'llm.chat.message.streamed',
      {
        sequence: number
        patch: unknown
        llmChatSessionId: string
      }
    >
  | BaseEvent<
      'llm.chat.message.streamed.tool-call',
      {
        sequence: number
        toolName: string
        toolArgs: unknown
        llmChatSessionId: string
      }
    >
  | BaseEvent<
      'llm.chat.message.suggestions.created',
      {
        llmChatSessionId: string
        messageId: string
        suggestions: {
          label: string
          value: string
          type?:
            | 'CREATE_TASK'
            | 'CREATE_PROJECT'
            | 'SAVE_DOC'
            | 'CONFIRM'
            | 'OTHER'
        }[]
      }
    >
  | BaseEvent<
      'llm.chat.message.stream-reset',
      {
        sequence: number
        llmChatSessionId: string
      }
    >
  | BaseEvent<
      'llm.chat.message.created',
      {
        message: {
          id: string
          role: string
          message: string
          status: 'success' | 'error' | 'cancelled' | null
          retryable: boolean | null
          createdTime: string
          updatedTime: string | null
          llmChatSessionId: string
          metadata: object | null
          mentions?: Array<{
            type:
              | 'TASK'
              | 'PROJECT'
              | 'WORKSPACE'
              | 'TEAM'
              | 'USER'
              | 'VIEW'
              | 'NOTE'
              | 'SHEET'
            id: string
            op: 'create' | 'update' | 'delete' | 'read'
          }> | null
        }
      }
    >
  | BaseEvent<
      'llm.chat.session.progress',
      {
        message: string
        llmChatSessionId: string
      }
    >
  | BaseEvent<
      'llm.chat.session.tool-update',
      {
        id: string
        createdTime: string
        message: string
        llmChatSessionId: string
        payload: {
          type: 'agent-workflow'
          data: unknown // FE will validate this as AgentWorkflowDto
        }
      }
    >
  | BaseEvent<
      'llm.chat.message.deleted',
      {
        messageId: string
        llmChatSessionId: string
      }
    >

type AiAgendaEvents = BaseEvent<
  'ai-agenda.note.generated',
  { agenda: { noteId: string } }
>

type NotificationEvents =
  | BaseEvent<
      'inbox-item.created',
      {
        inboxItem: {
          id: string
          type: string
          recipientId: string
          payload: unknown
          read: boolean
          createdTime: string
        }
      }
    >
  | BaseEvent<
      'inbox-item.marked-read',
      {
        inboxItem: {
          id: string
          read: boolean
        }
      }
    >
  | BaseEvent<
      'inbox-items.marked-read',
      {
        itemIds: string[]
        read: boolean
      }
    >
  | BaseEvent<'all-inbox-items.marked-read', { read: boolean }>
  | BaseEvent<
      'user-notification-preferences.updated',
      {
        userNotificationPreferences: {
          userId: string
          browserTaskAssignedToYou: boolean
          browserTaskStatusChanged: boolean
          browserMentionedInComment: boolean
          browserMentionedInNote: boolean
          browserMeetingReminder: boolean
          browserTaskReminder: boolean
          browserAIAgents: boolean
          emailTaskAssignedToYou: boolean
          emailTaskStatusChanged: boolean
          emailMentionedInComment: boolean
          emailMentionedInNote: boolean
          emailTaskArchived: boolean
          emailTaskCreated: boolean
          emailFlows: boolean
          emailAIAgents: boolean
          emailBulkOperations: boolean
          mobileTaskAssignedToYou: boolean
          mobileTaskStatusChanged: boolean
          mobileMentionedInComment: boolean
          mobileMentionedInNote: boolean
          mobileTaskArchived: boolean
          mobileTaskCreated: boolean
          mobileTaskReminder: boolean
          mobileAIAgents: boolean
          inboxTaskAssignedToYou: boolean
          inboxTaskStatusChanged: boolean
          inboxMentionedInComment: boolean
          inboxMentionedInNote: boolean
          inboxFlows: boolean
          inboxAIAgents: boolean
        }
      }
    >

type SenderDto = {
  email: string
  name: string | null
}

type EmailAttachmentDto = {
  attachmentId: string
  filename: string
  mimeType: string
  size: number
  signedUrl?: string | null
  isInline: boolean
  contentId?: string | null
}

type EmailBodyDto = {
  size?: number | null
  data?: string | null
  attachmentId?: string | null
}

type EmailHeaderDto = {
  name: string
  value: string
}

type EmailPartDto = {
  partId: string
  mimeType: string
  filename: string
  headers: EmailHeaderDto[]
  body: EmailBodyDto
  parts?: EmailPartDto[] | null
  attachments?: EmailAttachmentDto[] | null
}

type EmailMessage = {
  id: string
  threadId: string
  subject: string
  snippet: string
  from: SenderDto
  to: SenderDto[]
  cc: SenderDto[]
  bcc: SenderDto[]
  labelIds: string[]
  payload: EmailPartDto
  receivedDate: string
  sentDate: string | null
  isRead: boolean
  isFlagged: boolean
  importance: string | null
  emailAccountId: string
}

type EmailThread = {
  id: string
  emailIds: string[]
}

type EmailEvents =
  | BaseEvent<
      'email-changes',
      {
        emailAddress: string
        addedEmails: EmailMessage[]
        updatedEmails: Array<{
          id: string
          labelIds: string[]
          isRead: boolean
        }>
        deletedEmailIds: string[]
        updatedThreads: EmailThread[]
      }
    >
  | BaseEvent<
      'email-bootstrap-failed',
      {
        emailAccountId: string
        emailAddress: string
        error: string
        message: string
        workflowId: string
      }
    >
  | BaseEvent<
      'email-bootstrap-started',
      {
        emailAccountId: string
        emailAddress: string
        totalEmails: number
        workflowId: string
      }
    >
  | BaseEvent<
      'email-bootstrap-progress',
      {
        emailAccountId: string
        emailAddress: string
        processedEmails: number
        totalEmails: number
        progressPercentage: number
        workflowId: string
      }
    >
  | BaseEvent<
      'email-bootstrap-completed',
      {
        emailAccountId: string
        emailAddress: string
        processedEmails: number
        totalEmails: number
        progressPercentage: number
        workflowId: string
      }
    >

type CommsItemEvents =
  | BaseEvent<
      'comms-item-created',
      {
        commsItemId: string
        targetType: string
        targetId: string
        timestamp: number
        models: Record<string, unknown> // AllModels from backend with PascalCase keys
      }
    >
  | BaseEvent<
      'comms-item-updated',
      {
        commsItemId: string
        targetType: string
        targetId: string
        timestamp: number
        models: Record<string, unknown> // AllModels from backend with PascalCase keys
      }
    >

type SheetEvents =
  | BaseEvent<
      'workspace.sheet.rows.created',
      {
        sheetId: string
        rowIds: string[]
      }
    >
  | BaseEvent<
      'workspace.sheet.rows.updated',
      {
        sheetId: string
        rowIds: string[]
      }
    >
  | BaseEvent<
      'workspace.sheet.rows.deleted',
      {
        sheetId: string
        rowIds: string[]
      }
    >
  | BaseEvent<
      'workspace.sheet.columns.created',
      {
        sheetId: string
        columnIds: string[]
      }
    >
  | BaseEvent<
      'workspace.sheet.columns.updated',
      {
        sheetId: string
        columnIds: string[]
      }
    >
  | BaseEvent<
      'workspace.sheet.columns.deleted',
      {
        sheetId: string
        columnIds: string[]
      }
    >
  | BaseEvent<
      'workspace.sheet.created',
      {
        sheetId: string
      }
    >
  | BaseEvent<
      'workspace.sheet.updated',
      {
        sheetId: string
      }
    >
  | BaseEvent<
      'workspace.sheet.deleted',
      {
        sheetId: string
      }
    >

// Structured preview types for CRM contact import selection UI
export type ContactPreview = {
  email: string
  firstName: string
  lastName: string
  jobTitle?: string | null
  phoneNumber?: string | null
}

export type CompanyPreview = {
  name: string
  domain: string
  website?: string | null
  description?: string | null
  nameInferred: boolean
  contacts: ContactPreview[]
  recentSubjects?: string[]
}

// Skip categories for domains - LLM-classified + system categories
export type SkipCategory =
  | 'vendor' // Services/tools selling TO the user
  | 'investor' // VCs, angels, funds
  | 'recruiter' // Job/recruiting related
  | 'automated' // Transactional emails (noreply@, etc.)
  | 'personal' // Friends, family
  | 'partner' // Marketing partners, collaborators
  | 'internal' // Related company domains
  | 'other' // Other non-sales
  | 'existing' // All contacts already in CRM (system)
  | 'no_outbound' // No outbound emails (system)
  | 'public' // Public email domain (gmail.com, yahoo.com, etc.)

export type SkippedDomainPreview = {
  domain: string
  category: SkipCategory
  detail?: string | null
}

type CrmContactImportEvents = BaseEvent<
  'crm-contact-import-completed',
  {
    email: string
    status: string
    // Timing
    durationSeconds: number
    // Stats
    domainsProcessed: number
    domainsSuccessful: number
    domainsFailed: number
    domainsSkippedNonSales: number
    domainsSkippedAllExisting: number
    domainsSkippedPublic: number
    domainsSkippedNoOutbound: number
    companiesCreated: number
    companiesExisting: number
    contactsCreated: number
    contactsSkippedExisting: number
    // Debug details
    companies: string[]
    contacts: string[]
    skippedContactsExisting: string[]
    // Structured skipped domains grouped by category
    skippedDomains: SkippedDomainPreview[]
    // Company name sources (shows LLM inference working)
    companiesInferred: string[]
    companiesFromDomain: string[]
    // Structured previews for selection UI
    companyPreviews: CompanyPreview[]
  }
>

export type SocketEvent =
  | ActivityFeedEvents
  | BookingEvents
  | CalendarEvents
  | CommsItemEvents
  | CrmContactImportEvents
  | CustomFieldEvents
  | EmailEvents
  | FolderEvents
  | LabelEvents
  | MiscEvents
  | NotificationEvents
  | PermissionEvents
  | ProjectEvents
  | ProjectGuestPermissionsEvents
  | RecurringTaskEvents
  | StageEvents
  | StatusEvents
  | TeamEvents
  | TeamTaskEvents
  | UploadedFileEvents
  | UserEvents
  | WorkspaceEvents
  | DefinitionEvents
  | NoteEvents
  | FeaturePermissionsEvents
  | NotetakerEvents
  | AgentWorkflowEvents
  | ViewEvents
  | LlmChatEvents
  | AiAgendaEvents
  | IntegrationConfigEvents
  | SheetEvents

export type SocketEventType = SocketEvent['type']

export type SocketEventData<T extends SocketEventType> = Extract<
  SocketEvent,
  { type: T }
>['data']

export type SocketEventPayload<T extends SocketEventType> = {
  type: T
} & (SocketEventData<T> extends void ? object : SocketEventData<T>) &
  Record<string, unknown>
