import z from 'zod/v4'

import { AllStreamPositionOutSchema } from '../common/primitives'
import { PushEvent } from '../events'

export const PushEventBatchRequest = z.object({
  events: PushEvent.array(),
})
export type PushEventBatchRequest = z.output<typeof PushEventBatchRequest>

export const PushEventSuccessResponse = z.object({
  id: z.string(),
  success: z.literal(true),
  data: z.any().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})
export type PushEventSuccessResponse = z.output<typeof PushEventSuccessResponse>

export type TransformedError = {
  name: string
  message: string
  stack: string | string[] | undefined
  cause: TransformedError | string | undefined
}

function errorTransform(ex: unknown): undefined | string | TransformedError {
  if (ex == null) return undefined
  if (ex instanceof Error) {
    return {
      ...ex,
      name: ex.name,
      message: ex.message,
      stack: ex.stack ? ex.stack.split('\n') : ex.stack,
      cause: errorTransform(ex.cause),
    }
  }
  return ex.toString()
}

const ErrorSchema = z.unknown().transform(errorTransform)

export const PushEventFailureResponse = z.object({
  id: z.string().optional(),
  success: z.literal(false),
  error: ErrorSchema,
})
export type PushEventFailureResponse = z.output<typeof PushEventFailureResponse>

export const PushEventResponse = z.union([
  PushEventSuccessResponse,
  PushEventFailureResponse,
])
export type PushEventResponseInput = z.input<typeof PushEventResponse>

export const SyncEventPushResponse = z.object({
  events: PushEventResponse.array(),
})
export type SyncEventPushResponse = z.output<typeof SyncEventPushResponse>

export const StreamInfoResponse = z.object({
  position: AllStreamPositionOutSchema,
  streams: z.string().array(),
})
