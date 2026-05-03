import type { ZodUnionToInputUnion, ZodUnionToOutputUnion } from './common'

import type { PushEventInput } from '../all'
import { ModelRegistryToSyncEngineMapping, PushEventMap } from '../mappings'

export type AllPushEventsZod = GetPushEventTypes<typeof PushEventMap>
export type AllPushEvents = ZodUnionToOutputUnion<AllPushEventsZod>
export type AllPushEventsInput = ZodUnionToInputUnion<AllPushEventsZod>

export type PushEventModel = keyof typeof PushEventMap
export type PushEventModelEvent<T extends PushEventModel> =
  keyof (typeof PushEventMap)[T] & string

export type PushEventSchema<
  TModel extends keyof typeof PushEventMap,
  TEvent extends keyof (typeof PushEventMap)[TModel],
> = (typeof PushEventMap)[TModel][TEvent]

export type PushEventType = PushEventInput['type']

export type PushEventPayload<T extends PushEventType> = Extract<
  PushEventInput,
  { type: T }
>['data']

/**
 * Utility type to extract all push event types for a model from PushEventMap
 * Example: PushEventTypesFor<'label'> = 'push.label.create' | 'push.label.update' | 'push.label.delete'
 */
export type PushEventTypesFor<
  TModel extends keyof typeof PushEventMap,
  TOperation extends
    keyof (typeof PushEventMap)[TModel] = keyof (typeof PushEventMap)[TModel],
> = `push.${TModel extends string ? TModel : never}.${TOperation extends string ? TOperation : never}`

export type TypedPushEventFrom<
  TModel extends string,
  TEventType extends string,
> = Extract<AllPushEvents, { type: `push.${TModel}.${TEventType}` }>

export type TypedPushEventDataInput<
  TModel extends string,
  TEventType extends string,
> = Extract<
  AllPushEventsInput,
  { type: `push.${TModel}.${TEventType}` }
>['data']

export type GetPushEventTypes<T extends Record<string, Record<string, any>>> = {
  [ModelName in keyof T]: {
    [EventName in keyof T[ModelName]]: T[ModelName][EventName]
  }[keyof T[ModelName]]
}[keyof T]

export type GetPushEvents<T extends keyof ModelRegistryToSyncEngineMapping> =
  ModelRegistryToSyncEngineMapping[T] extends infer SyncEngineName extends
    PushEventModel
    ? {
        [K in PushEventModelEvent<SyncEngineName>]: (
          payload: TypedPushEventDataInput<SyncEngineName, K>
        ) => {
          type: `push.${SyncEngineName}.${K}`
          payload: TypedPushEventDataInput<SyncEngineName, K>
          timestamp: number
        }
      }
    : never
