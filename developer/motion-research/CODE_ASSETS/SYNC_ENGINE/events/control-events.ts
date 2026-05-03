import z from 'zod/v4'

import {
  BootstrapIncludesSchema,
  BootstrapStrategySchema,
} from '../dtos/bootstrap'
import { createSyncEvent } from '../utils/create-events'

export const ResetStore = createSyncEvent(
  'control.reset-store',
  1,
  z.object({})
)

export const BootstrapCompleted = createSyncEvent(
  'control.bootstrap-completed',
  1,
  z.object({
    strategy: BootstrapStrategySchema,
    modelTypes: z.array(BootstrapIncludesSchema),
    modelCounts: z.record(z.string(), z.number()),
    duration: z.number().optional(),
  })
)

export const ControlEvents = [ResetStore, BootstrapCompleted]
export type ControlEvents = z.output<(typeof ControlEvents)[number]>
