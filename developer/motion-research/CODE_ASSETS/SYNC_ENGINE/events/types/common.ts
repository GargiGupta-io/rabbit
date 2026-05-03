import z from 'zod/v4'

export type GetSecondLevelLeafTypes<
  T extends Record<string, Record<string, any>>,
> = {
  [ModelName in keyof T]: {
    [EventName in keyof T[ModelName]]: T[ModelName][EventName]
  }[keyof T[ModelName]]
}[keyof T]

export type ZodUnionToOutputUnion<TUnionOfSchemas extends z.ZodType> =
  TUnionOfSchemas extends z.ZodType ? z.output<TUnionOfSchemas> : never

export type ZodUnionToInputUnion<TUnionOfSchemas extends z.ZodType> =
  TUnionOfSchemas extends z.ZodType ? z.input<TUnionOfSchemas> : never

export type EventDirection = 'sync' | 'push'

export type SyncEngineStream = `${'user' | 'workspace' | 'team'}-${string}`
