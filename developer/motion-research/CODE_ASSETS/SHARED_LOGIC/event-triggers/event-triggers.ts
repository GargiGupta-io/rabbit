import { z } from 'zod/v4'

import {
  type SupportedIntegrationPlatforms,
  systemIntegrationPlatforms,
} from '../integrations'

/**
 * Integration platforms that support event triggers
 */
const eventTriggerSupportedIntegrationPlatforms = [
  'google-mail',
  'hubspot',
  'outlook',
  'salesforce',
  'slack',
  'microsoft-teams',
] as const satisfies readonly SupportedIntegrationPlatforms[]

/**
 * 👇 The list of supported event triggers (register yours here).
 */
export const supportedEventTriggerPlatforms = [
  'schedule',
  'webhook-ingestion',
  ...systemIntegrationPlatforms,
  ...eventTriggerSupportedIntegrationPlatforms,
] as const

/**
 * Indicates whether the workflow was initialized manually or via a trigger
 */
export const workflowInitiationMode = [
  'manual',
  ...supportedEventTriggerPlatforms,
] as const

export const EventTriggerPlatformSchema = z.enum(supportedEventTriggerPlatforms)

export type EventTriggerPlatform = z.infer<typeof EventTriggerPlatformSchema>

export const EventTriggerVariableMappingSchema = z.object({
  /**
   * Maps to the agent workflow variable id for StartAgentWorkflowTriggerTargetSchema
   * For WebhookTriggerTargetSchema, we have special 'url' and 'method' variables that must be set or the target will fail during orchestration.
   *
   * Evaluates arbitrary CEL expressions to map the event data and trigger data to the input data.
   * For example, if we want to send subject and body as a dict this could be
   * "{\"subject\": input.subject, \"body\": input.body}"
   */
  id: z.string(),
  valueExpression: z.string(),
})
export type EventTriggerVariableMapping = z.infer<
  typeof EventTriggerVariableMappingSchema
>

/**
 * Webhook-specific variable IDs
 */
export const webhookRequiredVariableIds = ['url', 'method'] as const
export const webhookOptionalVariableIds = [
  'headers',
  'body',
  'queryParams',
] as const
export const webhookVariableIds = [
  ...webhookRequiredVariableIds,
  ...webhookOptionalVariableIds,
] as const

export const WebhookVariableIdSchema = z.enum(webhookVariableIds)
export type WebhookVariableId = z.infer<typeof WebhookVariableIdSchema>

/**
 * Webhook-specific variable mapping that restricts IDs to valid webhook variables
 */
export const WebhookVariableMappingSchema =
  EventTriggerVariableMappingSchema.extend({
    id: WebhookVariableIdSchema,
  })
export type WebhookVariableMapping = z.infer<
  typeof WebhookVariableMappingSchema
>

/**
 * Base schema for all trigger targets
 */
export const BaseTriggerTargetSchema = z.object({
  targetId: z.string(),
  targetType: z.union([
    z.literal('WORKSPACE'),
    z.literal('AGENT_WORKFLOW'),
    z.literal('AGENT_WORKFLOW_INSTANCE'),
    z.literal('SHEET'),
  ]),
  variableMappings: z.array(EventTriggerVariableMappingSchema).optional(),
})
export type BaseTriggerTarget = z.infer<typeof BaseTriggerTargetSchema>

/**
 * Webhook trigger target with strict validation
 *
 * Required variable mappings:
 * - url: The endpoint URL (string)
 * - method: HTTP method - GET, POST, PUT, DELETE, PATCH, etc. (string)
 *
 * Optional variable mappings:
 * - headers: HTTP headers as an object, e.g. {"Content-Type": "application/json", "Authorization": "Bearer token"}
 * - body: Request body for POST/PUT/PATCH requests (will be JSON stringified if object)
 * - queryParams: Query parameters as an object to append to URL
 */
export const WebhookTriggerTargetSchema = BaseTriggerTargetSchema.extend({
  type: z.literal('webhook'),
  targetType: z.literal('WORKSPACE'),
  // Override variableMappings to use webhook-specific schema and add validation
  variableMappings: z
    .array(WebhookVariableMappingSchema)
    .superRefine((mappings, ctx) => {
      const mappingIds = mappings.map((m) => m.id)

      // Check for required IDs
      for (const requiredId of webhookRequiredVariableIds) {
        if (!mappingIds.includes(requiredId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Webhook triggers must include '${requiredId}' in variableMappings`,
          })
        }
      }

      // Check for duplicate IDs
      const uniqueIds = new Set(mappingIds)
      if (uniqueIds.size !== mappingIds.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate variable mapping IDs are not allowed',
        })
      }
    }),
})
export type WebhookTriggerTarget = z.infer<typeof WebhookTriggerTargetSchema>

export const StartAgentWorkflowTriggerTargetSchema =
  BaseTriggerTargetSchema.extend({
    type: z.literal('start-agent-workflow'),
    targetType: z.literal('AGENT_WORKFLOW'),
  })
export type StartAgentWorkflowTriggerTarget = z.infer<
  typeof StartAgentWorkflowTriggerTargetSchema
>

export const StartAgentWorkflowInstanceTriggerTargetSchema =
  BaseTriggerTargetSchema.extend({
    type: z.literal('start-agent-workflow-instance'),
    targetType: z.literal('AGENT_WORKFLOW_INSTANCE'),
  })
export type StartAgentWorkflowInstanceTriggerTarget = z.infer<
  typeof StartAgentWorkflowInstanceTriggerTargetSchema
>

export const AddSheetWebhookRowTriggerTargetSchema =
  BaseTriggerTargetSchema.extend({
    type: z.literal('add-sheet-webhook-row'),
    targetType: z.literal('SHEET'),
  })
export type AddSheetWebhookRowTriggerTarget = z.infer<
  typeof AddSheetWebhookRowTriggerTargetSchema
>

export const SingleTriggerTargetSchema = z.discriminatedUnion('type', [
  WebhookTriggerTargetSchema,
  StartAgentWorkflowTriggerTargetSchema,
  StartAgentWorkflowInstanceTriggerTargetSchema,
  AddSheetWebhookRowTriggerTargetSchema,
])
export type SingleTriggerTarget = z.infer<typeof SingleTriggerTargetSchema>

export const TriggerTargetSchema = z.object({
  targets: z.array(SingleTriggerTargetSchema),
})
export type TriggerTarget = z.infer<typeof TriggerTargetSchema>

export const TriggerDataSchema = z.record(z.string(), z.any())

export const supportedEventTriggerScopeTypes = [
  'WORKSPACE', // This trigger is listening to events from a Motion Workspace
  'INTEGRATION', // This trigger is listening to events from an Integration
  'AGENT_WORKFLOW', // This trigger is listening to events from an Agent Workflow
  'USER', // This trigger is listening to events from a User, currently used for Notetaker.
  'SHEET', // This trigger is listening to events from a Sheet
] as const
export const EventTriggerScopeTypeSchema = z.enum(
  supportedEventTriggerScopeTypes
)
export type EventTriggerScopeTypeSchema = z.infer<
  typeof EventTriggerScopeTypeSchema
>

export const EventTriggerSchema = z.object({
  /**
   * Mapped to versionGroupId behind the scenes. In the event this is a new trigger, it will be a placeholder id.
   */
  id: z.string(),

  /**
   * The type of trigger used to discriminate between event and time triggers.
   */
  triggerType: z.literal('event'),

  /**
   * The ID of the user who created this trigger.
   */
  createdById: z.string().nullable().optional(),

  /**
   * The type of entity that created this trigger (e.g., 'USER' or 'SYSTEM').
   */
  createdByType: z.string(),

  // ================================ FIELDS FOR FILTERING AND ORCHESTRATION ================================

  /**
   * This maps to what is needed for hatchet filters. See https://blog.hatchet.run/home/run-on-event
   * What is this event trigger subscribing to? Can be a integration config id or a workspace id.
   * The filter expression is evaluated against every event in the eventScope.
   */
  eventScopeId: z.string(),
  /**
   * Determines what the eventScopeId is referencing and what this trigger is listening to.
   */
  eventScopeType: EventTriggerScopeTypeSchema,

  /**
   * An arbitrary CEL expression that is evaluated against every event in the eventScope.
   * Must evaluate to a boolean.
   * Example: input.to == 'foo@bar.com' && input.subject.startsWith('[important]')
   */
  filterExpression: z.string(),

  /**
   * Additional data that is available during filter evaluation. Must be JSON serializable.
   * Not currently used in the product.
   */
  triggerData: TriggerDataSchema.nullable().optional(),

  /**
   * When disabled, we delete the hatchet filter.
   */
  enabled: z.boolean(),

  /**
   * What is executed when the filter expression evaluates to true.
   * We evaluate the CEL expressions in the given target to get the inputs (mapping event+trigger data) and then execute that target.
   * See trigger-orchestration.workflow.ts
   */
  triggerTargets: z.array(SingleTriggerTargetSchema),

  // ================================ FIELDS FOR GENERATION ================================

  /**
   * Is not used during filter evaluation, only during generation to determine the event schemas to pass to the llm to generate the filter expression.
   */
  platform: z.enum(supportedEventTriggerPlatforms),

  /**
   * An optional predicate ID for the action that this trigger is associated with.
   * This is primarily used on the front-end to help when generating or editing
   * the trigger by providing valid actions to the user.
   *
   * See: `triggers.config.ts`
   */
  predicateId: z.string().nullable().optional(),

  /**
   * The userPrompt that was used to generate the filter expression.
   * In the product, we currently don't have a way to build EventTriggers without a user prompt.
   * But we may have triggers generated by the AI without a userPrompt, so keeping these nullable.
   */
  userPrompt: z.string().nullable().optional(),

  /**
   * Maps to "Full Description" in the UI
   */
  humanReadableDescription: z.string().nullable().optional(),

  /**
   * The LLM errors that are generated. Most commonly used to indicate that the prompt references fields that don't exist.
   */
  humanReadableErrors: z.array(z.string()).nullable().optional(),

  /**
   * The summary of the user prompt.
   */
  userPromptSummary: z.string().optional(),
})
export type EventTrigger = z.infer<typeof EventTriggerSchema>

/**
 * ============================================================================
 * AGENT WORKFLOW TYPES
 * ============================================================================
 * The following types are duplicated from @motion/agents to avoid a circular
 * dependency between @motion/triggers and @motion/agents packages.
 *
 * Event triggers need to execute agent workflows, but agents also need to
 * reference event triggers, creating a circular dependency. By placing these
 * shared types in the @motion/shared package, both packages can import them
 * without creating a cycle.
 * ============================================================================
 */

/**
 * Schema for agent variable scope types used in event triggers
 */
export const AgentVariableScopeTypeSchema = z.enum(['WORKFLOW', 'STEP'])
export type AgentVariableScopeType = z.infer<
  typeof AgentVariableScopeTypeSchema
>

/**
 * A variable value used in agent workflows
 * This type is used by event triggers when orchestrating workflow execution
 */
export const AgentVariableValueSchema = z.object({
  /**
   * The ID of this variable like `__output` or `email_address`
   */
  id: z.string(),
  /**
   * The captured value for this variable
   */
  value: z.string(),
  /**
   * The ID of the scope that this variable is associated with
   */
  runScopeId: z.string(),
  /**
   * A discriminator for the scope that this variable is associated with
   */
  runScopeType: AgentVariableScopeTypeSchema,
  /**
   * The display ID of the run scope for this variable
   */
  runScopeDisplayId: z.string(),
})
export type AgentVariableValue = z.infer<typeof AgentVariableValueSchema>

export const AgentWorkflowInitiationModeSchema = z.enum(workflowInitiationMode)
export type AgentWorkflowInitiationModeSchema = z.infer<
  typeof AgentWorkflowInitiationModeSchema
>

/**
 * Parameters to initialize an async agent workflow run from event triggers
 */
export const AgentWorkflowAsyncInitParamsSchema = z.object({
  /**
   * The ID of the AgentWorkflow to execute
   */
  agentWorkflowId: z.string(),
  /**
   * The initial variables required to start the workflow
   */
  initialVariables: z.array(AgentVariableValueSchema),
  /**
   * The ID of the user initiating the workflow run
   */
  initiatingUserId: z.string(),
  /**
   * Whether this is a test run
   */
  isTestRun: z.boolean().optional(),
  /**
   * The mode of initiation for the workflow
   */
  initiationMode: AgentWorkflowInitiationModeSchema.optional(),
})
export type AgentWorkflowAsyncInitParams = z.infer<
  typeof AgentWorkflowAsyncInitParamsSchema
>

/**
 * Status values for trigger orchestration
 */
export type TriggerOrchestrationStatus =
  | 'processing_targets'
  | 'no_targets_to_process'
  | 'completed_processing_targets'
  | 'no_event_trigger'

/**
 * Error information for failed trigger orchestration
 */
export interface TriggerOrchestrationError {
  target: SingleTriggerTarget
  error: Error
}
