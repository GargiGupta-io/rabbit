import { z } from 'zod/v4'

import {
  SingleTriggerTargetSchema,
  supportedEventTriggerPlatforms,
  TriggerDataSchema,
} from '../event-triggers'

/**
 * Schema for time-based triggers that execute on a schedule
 */
export const TimeTriggerSchema = z.object({
  /**
   * Mapped to versionGroupId behind the scenes. In the event this is a new trigger, it will be a placeholder id.
   */
  id: z.string(),

  /**
   * The type of trigger used to discriminate between event and time triggers.
   */
  triggerType: z.literal('time'),

  /**
   * The ID of the user who created this trigger.
   */
  createdById: z.string().nullable().optional(),

  /**
   * The type of entity that created this trigger (e.g., 'USER' or 'SYSTEM').
   */
  createdByType: z.string(),

  // ================================ FIELDS FOR SCHEDULING AND ORCHESTRATION ================================

  /**
   * A standard cron expression that defines when this trigger should execute.
   * Uses the 5-field format: minute hour day-of-month month day-of-week
   * Example: "0 9 * * *" (every day at 9:00 AM)
   */
  cronExpression: z.string(),

  /**
   * Additional data that is available during trigger execution. Must be JSON serializable.
   */
  triggerData: TriggerDataSchema.nullable().optional(),

  /**
   * When disabled, we delete the hatchet scheduled run.
   */
  enabled: z.boolean(),

  /**
   * What is executed when the scheduled time arrives.
   * We evaluate the CEL expressions in the given target to get the inputs and then execute that target.
   */
  triggerTargets: z.array(SingleTriggerTargetSchema),

  // ================================ FIELDS FOR GENERATION ================================

  /**
   * Platform identifier - for time triggers this should be 'schedule'
   */
  platform: z.enum(supportedEventTriggerPlatforms),

  /**
   * The userPrompt that was used to generate the cron expression.
   */
  userPrompt: z.string().nullable().optional(),

  /**
   * Maps to "Full Description" in the UI - human-readable description of the schedule
   */
  humanReadableDescription: z.string().nullable().optional(),

  /**
   * The LLM errors that are generated. Most commonly used to indicate that the prompt could not be converted to a valid cron expression.
   */
  humanReadableErrors: z.array(z.string()).nullable().optional(),

  /**
   * The summary of the user prompt.
   */
  userPromptSummary: z.string().optional(),

  /**
   * Whether the timezone is explicitly set in the user prompt.
   * When this is true, we will not update the timezone of the trigger during duplication, copy or update.
   */
  isTimezoneExplicitlySet: z.boolean().optional(),
})

export type TimeTrigger = z.infer<typeof TimeTriggerSchema>
