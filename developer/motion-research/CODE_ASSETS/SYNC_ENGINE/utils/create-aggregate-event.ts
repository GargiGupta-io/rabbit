import z from 'zod/v4'

import { SyncEvent, SyncEventValue } from '../events'
import { AllModelsSchema } from '../models'

export function createAggregateEvent<
  TName extends string,
  const TVersion extends number,
  TSchema extends z.ZodType,
>(name: TName, version: TVersion, data: TSchema) {
  return z.object({
    $version: z.literal(version),
    id: z.string().optional(),
    type: z.literal(name),
    data: z.object({
      data: data,
      models: AllModelsSchema.partial(),
      get captured() {
        return SyncEvent.array()
      },
    }),
    metadata: z.record(z.string(), z.any()).optional(),
  })
}
export type LooseAggregateEvent = {
  $version: number
  id?: string
  type: string
  data: {
    data: any
    models: Partial<AllModelsSchema>
    captured: SyncEventValue[]
  }
  metadata?: Record<string, any>
}
