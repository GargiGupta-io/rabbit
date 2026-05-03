import z from 'zod/v4'

import { PushEventMap, SyncEventMap } from './mappings'

// Helper types to extract all event schemas from a map
type EventMapValues<T extends Record<string, Record<string, z.ZodType>>> = {
  [K in keyof T]: T[K][keyof T[K]]
}[keyof T]

// Helper to get all values from an event map as a tuple
function getAllEventValues<T extends Record<string, Record<string, z.ZodType>>>(
  map: T
) {
  const values: EventMapValues<T>[] = []
  for (const category of Object.values(map)) {
    for (const event of Object.values(category)) {
      values.push(event as EventMapValues<T>)
    }
  }
  return values
}

// Build SyncEvent union from SyncEventMap
export const SyncEvent = z.union(getAllEventValues(SyncEventMap))
export type SyncEventValue = z.output<typeof SyncEvent>
export type SyncEventInput = z.input<typeof SyncEvent>

// Build PushEvent union from PushEventMap
export const PushEvent = z.union(getAllEventValues(PushEventMap))
export type PushEventValue = z.output<typeof PushEvent>
export type PushEventInput = z.input<typeof PushEvent>
