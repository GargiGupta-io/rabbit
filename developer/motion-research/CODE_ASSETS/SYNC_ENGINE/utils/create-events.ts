import { v7 as uuid } from 'uuid'
import z from 'zod/v4'

import { Widen } from './zod'

import { AllModelsSchema } from '../models/all'

export function createPushEvent<
  TName extends string,
  const TVersion extends number,
  TSchema extends z.ZodType,
>(name: TName, version: TVersion, schema: TSchema) {
  return z.object({
    $version: z.literal(version),
    id: z
      .string()
      .optional()
      .default(() => uuid()),
    type: z.literal(`push.${name}`),
    data: schema,
    metadata: z.record(z.string(), z.any()).optional(),
  })
}

export function createSyncEvent<
  TName extends string,
  const TVersion extends number,
  TSchema extends z.ZodType,
>(name: TName, version: TVersion, schema: TSchema) {
  return z.object({
    $version: z.literal(version),
    id: z.string().optional(),
    type: z.literal(name),
    data: schema,
    metadata: z.record(z.string(), z.any()).optional(),
  })
}

export function createModelSyncEvent<
  TName extends string,
  const TVersion extends number,
  TModels extends (keyof AllModelsSchema & string)[],
  TPartialModels extends (keyof AllModelsSchema & string)[] = [],
>(
  name: TName,
  version: TVersion,
  models: TModels,
  partialModels: TPartialModels = [] as unknown as TPartialModels
) {
  const modelSelect = [...models, ...partialModels].reduce(
    (acc, cur) => {
      // @ts-expect-error - typecheck in interface
      acc[cur] = true
      return acc
    },
    {} as z.core.util.Exactly<
      z.core.util.Mask<TModels[number] | TPartialModels[number]>,
      TModels[number] | TPartialModels[number]
    >
  )

  const requiredModelSelect = models.reduce(
    (acc, cur) => {
      // @ts-expect-error - typecheck in interface
      acc[cur] = true
      return acc
    },
    {} as z.core.util.Exactly<
      z.core.util.Mask<TModels[number]>,
      TModels[number]
    >
  )

  const partialModelSelect = partialModels.reduce(
    (acc, cur) => {
      // @ts-expect-error - typecheck in interface
      acc[cur] = true
      return acc
    },
    {} as z.core.util.Exactly<
      z.core.util.Mask<TPartialModels[number]>,
      TPartialModels[number]
    >
  )

  return z.object({
    $version: z.literal(version),
    id: z.string().optional(),
    type: z.literal(name),
    data: z.object({
      models: AllModelsSchema.pick(modelSelect)
        .partial(partialModelSelect)
        .required(requiredModelSelect),
    }),
    metadata: z.record(z.string(), z.any()).optional(),
  })
}

export type LooseSyncEventSchema = z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>
    $version: z.ZodLiteral<number>
    type: z.ZodLiteral<string>
    data: z.ZodObject
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>
  },
  z.core.$strip
>
export type SyncEventData<T extends LooseSyncEventSchema> = Widen<
  z.input<T>['data']
>
export type SyncEventStrictData<T extends LooseSyncEventSchema> =
  z.output<T>['data']

export type LooseModelSyncEventSchema = z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>
    $version: z.ZodLiteral<number>
    type: z.ZodLiteral<string>
    data: z.ZodObject<
      {
        models: z.ZodObject
      },
      z.core.$strip
    >
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>
  },
  z.core.$strip
>

export type ModelSyncEventModelNames<T extends LooseSyncEventSchema> =
  T extends LooseModelSyncEventSchema
    ? keyof z.infer<T>['data']['models']
    : never

export function getSyncEventType(schema: LooseSyncEventSchema) {
  const eventProperty = schema.shape.type
  if (eventProperty.def.type !== 'literal') {
    return null
  }

  return eventProperty.def.values[0] as string
}

export type LoosePushEventSchema = z.ZodObject<
  {
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>
    $version: z.ZodLiteral<number>
    type: z.ZodLiteral<string>
    data: z.ZodObject
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>
  },
  z.core.$strip
>

export type EventTypeName<T extends LoosePushEventSchema> =
  T['def']['shape']['type']['value']

export function getPushEventType(foo: LoosePushEventSchema) {
  const eventProperty = foo.shape.type
  if (eventProperty.def.type !== 'literal') {
    return null
  }

  return eventProperty.def.values[0] as string
}
