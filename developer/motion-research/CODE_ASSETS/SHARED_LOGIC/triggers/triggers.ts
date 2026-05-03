import { z } from 'zod/v4'

import { EventTriggerSchema } from '../event-triggers/event-triggers'
import { TimeTriggerSchema } from '../time-triggers/time-triggers'

export const TriggerType = z.enum(['event', 'time'])
export type TriggerType = z.infer<typeof TriggerType>

export const TriggerSchema = z.discriminatedUnion('triggerType', [
  EventTriggerSchema,
  TimeTriggerSchema,
])

export type Trigger = z.infer<typeof TriggerSchema>

export type EventTrigger = z.infer<typeof EventTriggerSchema>
export type TimeTrigger = z.infer<typeof TimeTriggerSchema>
