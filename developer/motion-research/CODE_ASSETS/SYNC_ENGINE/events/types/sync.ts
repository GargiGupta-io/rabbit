import {
  GetSecondLevelLeafTypes,
  ZodUnionToInputUnion,
  ZodUnionToOutputUnion,
} from './common'

import { Widen } from '../../utils/zod'
import type { SyncEventInput, SyncEventValue } from '../all'
import { ControlEvents } from '../control-events'
import { SyncEventMap } from '../mappings'

export type AllSyncEventsZod =
  | GetSecondLevelLeafTypes<typeof SyncEventMap>
  | (typeof ControlEvents)[number]
export type AllSyncEvents = ZodUnionToOutputUnion<AllSyncEventsZod>
export type AllSyncEventsInput = ZodUnionToInputUnion<AllSyncEventsZod>

export type TypedSyncEventFrom<
  TModel extends string,
  TEventType extends string,
> = Extract<AllSyncEvents, { type: `${TModel}.${TEventType}` }>

export type TypedSyncEventDataInput<
  TModel extends string,
  TEventType extends string,
> = Widen<
  Extract<AllSyncEventsInput, { type: `${TModel}.${TEventType}` }>['data']
>

export type TypedSyncEvent<TEvent extends string> = Extract<
  SyncEventValue,
  { type: `${TEvent}` }
>
export type TypedSyncEventInput<TEvent extends string> = Widen<
  Extract<SyncEventInput, { type: `${TEvent}` }>
>
export type SyncEventModel = keyof typeof SyncEventMap
export type SyncEventModelEvent<T extends SyncEventModel> =
  keyof (typeof SyncEventMap)[T] & string

export type SyncEventSchema<
  TModel extends keyof typeof SyncEventMap,
  TEvent extends keyof (typeof SyncEventMap)[TModel],
> = (typeof SyncEventMap)[TModel][TEvent]
