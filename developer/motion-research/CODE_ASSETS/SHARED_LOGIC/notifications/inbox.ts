import { z } from 'zod/v4'

/* ──────────────────────────────
   Shared snapshot fields
   ────────────────────────────── */
const SnapshotSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

/* ──────────────────────────────
   Base shapes (reuse across variants)
   ────────────────────────────── */
const BasePayloadSchema = z.object({
  // Common across *all* inbox items
  snapshot: SnapshotSchema,
})

const BaseInboxItemSchema = z.object({
  id: z.string(),
  recipientId: z.string(),
  read: z.boolean(),
  createdTime: z.date(),
})

/* ──────────────────────────────
   Per‑type metadata definitions, this is the dynamic information the client
   uses to render fields like target names/workspace names, the fields
   that need to be computed at runtime because they can change.
   ────────────────────────────── */
const TaskAssignedMetadata = z.object({
  taskId: z.string(),
  assignerUserId: z.string(),
})

const TaskStatusUpdatedMetadata = z.object({
  taskId: z.string(),
  changerUserId: z.string(),
  oldStatus: z.object({
    id: z.string(),
    symbolKey: z.literal('old'),
  }),
  newStatus: z.object({
    id: z.string(),
    symbolKey: z.literal('new'),
  }),
})

const MentionedInTaskCommentMetadata = z.object({
  taskId: z.string(),
  commentId: z.string(),
  threadId: z.string().nullish(),
  mentionerUserId: z.string(),
})

const TaskCommentReactionMetadata = z.object({
  taskId: z.string(),
  commentId: z.string(),
  reactorUserId: z.string(),
  reaction: z.string(),
})

const MentionedInProjectCommentMetadata = z.object({
  projectId: z.string(),
  commentId: z.string(),
  threadId: z.string().nullish(),
  mentionerUserId: z.string(),
})

const ProjectStageStatusUpdatedMetadata = z.object({
  projectId: z.string(),
  stageDefinitionId: z.string(),
  oldStatus: z.object({
    id: z.string(),
    symbolKey: z.literal('old'),
  }),
  newStatus: z.object({
    id: z.string(),
    symbolKey: z.literal('new'),
  }),
})

const ProjectStageEnteredMetadata = z.object({
  projectId: z.string(),
  stageDefinitionId: z.string(),
})

const MentionedInNoteMetadata = z.object({
  noteId: z.string(),
  mentionerUserId: z.string(),
  mentionKey: z.string(),
})

const MentionedInNoteCommentMetadata = z.object({
  noteId: z.string(),
  commentId: z.string(),
  threadId: z.string().nullish(),
  mentionerUserId: z.string(),
})

const MentionedInCrmRecordCommentMetadata = z.object({
  crmTargetId: z.string(),
  crmTargetType: z.enum(['CONTACT', 'COMPANY', 'DEAL']),
  commentId: z.string(),
  threadId: z.string().nullish(),
  mentionerUserId: z.string(),
  workspaceId: z.string(),
})

const CrmRecordCommentReactionMetadata = z.object({
  crmTargetId: z.string(),
  crmTargetType: z.enum(['CONTACT', 'COMPANY', 'DEAL']),
  commentId: z.string(),
  reactorUserId: z.string(),
  reaction: z.string(),
  workspaceId: z.string(),
})

const AIAgentMetadata = z.object({
  agentWorkflowRunId: z.string(),
  employeeId: z.string(),
})

const PostOnboardingMetadata = z.object({
  type: z.enum(['ai-chat', 'ai-employee', 'motion-notetaker']),
})

const MeetingInsightsMetadata = z.object({
  meetingNoteId: z.string(),
})

const CreditUsageMetadata = z.object({
  usageThreshold: z.number(),
})

// Integration error metadata
const IntegrationErrorMetadata = z.object({
  integrationConfigId: z.string(),
  platform: z.string(),
})

const AgentWorkflowDeployedMetadata = z.object({
  deploymentId: z.string(),
  versionGroupId: z.string(),
  requesterUserId: z.string(),
  isIncomplete: z.boolean(),
})

// Form response metadata
const FormResponseMetadata = z.object({
  formId: z.string(),
  formResponseId: z.string(),
})

// Call recording completed metadata
const PhoneCallMetadata = z.object({
  noteId: z.string(),
  phoneNumber: z.string(),
})

// SMS received metadata
const SmsMetadata = z.object({
  noteId: z.string(),
  phoneNumber: z.string(),
})

// CRM email domains shared metadata
const CrmEmailDomainsSharedMetadata = z.object({
  emailDomains: z.array(z.string()),
})

/* ──────────────────────────────
   Concrete variant schemas – extend the base & inject metadata
   ────────────────────────────── */
export const TaskAssignedSchema = BaseInboxItemSchema.extend({
  type: z.literal('task-assigned'),
  payload: BasePayloadSchema.extend({
    metadata: TaskAssignedMetadata,
  }),
})

export const TaskStatusUpdatedSchema = BaseInboxItemSchema.extend({
  type: z.literal('task-status-updated'),
  payload: BasePayloadSchema.extend({
    metadata: TaskStatusUpdatedMetadata,
  }),
})

export const MentionedInTaskCommentSchema = BaseInboxItemSchema.extend({
  type: z.literal('mentioned-in-task-comment'),
  payload: BasePayloadSchema.extend({
    metadata: MentionedInTaskCommentMetadata,
  }),
})

export const TaskCommentReactionSchema = BaseInboxItemSchema.extend({
  type: z.literal('task-comment-reaction'),
  payload: BasePayloadSchema.extend({
    metadata: TaskCommentReactionMetadata,
  }),
})

export const MentionedInProjectCommentSchema = BaseInboxItemSchema.extend({
  type: z.literal('mentioned-in-project-comment'),
  payload: BasePayloadSchema.extend({
    metadata: MentionedInProjectCommentMetadata,
  }),
})

export const ProjectStageStatusUpdatedSchema = BaseInboxItemSchema.extend({
  type: z.literal('project-stage-status-updated'),
  payload: BasePayloadSchema.extend({
    metadata: ProjectStageStatusUpdatedMetadata,
  }),
})

export const ProjectStageEnteredSchema = BaseInboxItemSchema.extend({
  type: z.literal('project-stage-entered'),
  payload: BasePayloadSchema.extend({
    metadata: ProjectStageEnteredMetadata,
  }),
})

export const MentionedInNoteSchema = BaseInboxItemSchema.extend({
  type: z.literal('mentioned-in-note'),
  payload: BasePayloadSchema.extend({
    metadata: MentionedInNoteMetadata,
  }),
})

export const MentionedInNoteCommentSchema = BaseInboxItemSchema.extend({
  type: z.literal('mentioned-in-note-comment'),
  payload: BasePayloadSchema.extend({
    metadata: MentionedInNoteCommentMetadata,
  }),
})

export const MentionedInCrmRecordCommentSchema = BaseInboxItemSchema.extend({
  type: z.literal('mentioned-in-crm-record-comment'),
  payload: BasePayloadSchema.extend({
    metadata: MentionedInCrmRecordCommentMetadata,
  }),
})

export const CrmRecordCommentReactionSchema = BaseInboxItemSchema.extend({
  type: z.literal('crm-record-comment-reaction'),
  payload: BasePayloadSchema.extend({
    metadata: CrmRecordCommentReactionMetadata,
  }),
})

export const AIAgentSchema = BaseInboxItemSchema.extend({
  type: z.literal('ai-agent'),
  payload: BasePayloadSchema.extend({
    status: z.enum(['success', 'failure']).optional(),
    metadata: AIAgentMetadata,
  }),
})

export const PostOnboardingSchema = BaseInboxItemSchema.extend({
  type: z.literal('post-onboarding'),
  payload: BasePayloadSchema.extend({
    metadata: PostOnboardingMetadata,
  }),
})

export const MeetingInsightsSchema = BaseInboxItemSchema.extend({
  type: z.literal('meeting-insights'),
  payload: BasePayloadSchema.extend({
    metadata: MeetingInsightsMetadata,
  }),
})

export const CreditUsageSchema = BaseInboxItemSchema.extend({
  type: z.literal('credit-usage'),
  payload: BasePayloadSchema.extend({
    metadata: CreditUsageMetadata,
  }),
})

export const IntegrationErrorSchema = BaseInboxItemSchema.extend({
  type: z.literal('integration-error'),
  payload: BasePayloadSchema.extend({
    metadata: IntegrationErrorMetadata,
  }),
})

export const AgentWorkflowDeployedSchema = BaseInboxItemSchema.extend({
  type: z.literal('agent-workflow-deployed'),
  payload: BasePayloadSchema.extend({
    metadata: AgentWorkflowDeployedMetadata,
  }),
})

export const FormResponseSchema = BaseInboxItemSchema.extend({
  type: z.literal('form-response'),
  payload: BasePayloadSchema.extend({
    metadata: FormResponseMetadata,
  }),
})

export const PhoneCallSchema = BaseInboxItemSchema.extend({
  type: z.literal('phone-call'),
  payload: BasePayloadSchema.extend({
    metadata: PhoneCallMetadata,
  }),
})

export const SmsSchema = BaseInboxItemSchema.extend({
  type: z.literal('sms'),
  payload: BasePayloadSchema.extend({
    metadata: SmsMetadata,
  }),
})

export const CrmEmailDomainsSharedSchema = BaseInboxItemSchema.extend({
  type: z.literal('crm-email-domains-shared'),
  payload: BasePayloadSchema.extend({
    metadata: CrmEmailDomainsSharedMetadata,
  }),
})

/* ──────────────────────────────
   Discriminated union & helpers (single source of truth)
   ────────────────────────────── */
const variants = [
  TaskAssignedSchema,
  TaskStatusUpdatedSchema,
  MentionedInTaskCommentSchema,
  TaskCommentReactionSchema,
  MentionedInProjectCommentSchema,
  ProjectStageStatusUpdatedSchema,
  ProjectStageEnteredSchema,
  MentionedInNoteSchema,
  MentionedInNoteCommentSchema,
  MentionedInCrmRecordCommentSchema,
  CrmRecordCommentReactionSchema,
  AIAgentSchema,
  PostOnboardingSchema,
  MeetingInsightsSchema,
  IntegrationErrorSchema,
  CreditUsageSchema,
  AgentWorkflowDeployedSchema,
  FormResponseSchema,
  PhoneCallSchema,
  SmsSchema,
  CrmEmailDomainsSharedSchema,
] as const

export const InboxItemSchema = z.discriminatedUnion('type', variants)
export type InboxItemSchema = z.infer<typeof InboxItemSchema>

export const InboxItemType = z.enum(
  variants.map((v) => v.shape.type.value) as [
    (typeof variants)[number]['shape']['type']['value'],
    ...string[],
  ]
)

export type TaskAssignedInboxItem = z.infer<typeof TaskAssignedSchema>
export type TaskStatusUpdatedInboxItem = z.infer<typeof TaskStatusUpdatedSchema>
export type MentionedInTaskCommentInboxItem = z.infer<
  typeof MentionedInTaskCommentSchema
>
export type TaskCommentReactionInboxItem = z.infer<
  typeof TaskCommentReactionSchema
>
export type MentionedInProjectCommentInboxItem = z.infer<
  typeof MentionedInProjectCommentSchema
>
export type ProjectStageStatusUpdatedInboxItem = z.infer<
  typeof ProjectStageStatusUpdatedSchema
>
export type ProjectStageEnteredInboxItem = z.infer<
  typeof ProjectStageEnteredSchema
>
export type MentionedInNoteInboxItem = z.infer<typeof MentionedInNoteSchema>
export type MentionedInNoteCommentInboxItem = z.infer<
  typeof MentionedInNoteCommentSchema
>
export type MentionedInCrmRecordCommentInboxItem = z.infer<
  typeof MentionedInCrmRecordCommentSchema
>
export type CrmRecordCommentReactionInboxItem = z.infer<
  typeof CrmRecordCommentReactionSchema
>
export type AIAgentInboxItem = z.infer<typeof AIAgentSchema>
export type PostOnboardingInboxItem = z.infer<typeof PostOnboardingSchema>
export type MeetingInsightsInboxItem = z.infer<typeof MeetingInsightsSchema>
export type CreditUsageInboxItem = z.infer<typeof CreditUsageSchema>
export type AgentWorkflowDeployedInboxItem = z.infer<
  typeof AgentWorkflowDeployedSchema
>
export type FormResponseInboxItem = z.infer<typeof FormResponseSchema>
export type PhoneCallInboxItem = z.infer<typeof PhoneCallSchema>
export type SmsInboxItem = z.infer<typeof SmsSchema>
export type CrmEmailDomainsSharedInboxItem = z.infer<
  typeof CrmEmailDomainsSharedSchema
>
export type InboxItem = z.infer<typeof InboxItemSchema>
export type InboxItemTypeLiteral = z.infer<typeof InboxItemType>
export type IntegrationErrorInboxItem = z.infer<typeof IntegrationErrorSchema>
