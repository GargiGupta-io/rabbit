import { safeJsonParse } from '@motion/utils/object'

import {
  type BaseIssue,
  type BaseSchema,
  type InferOutput,
  safeParse,
} from 'valibot'

declare var __IS_DEV__: boolean

type MergeFn<T> = (invalidData: object | undefined) => T | undefined
export function parse<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  text: string | undefined,
  merge: MergeFn<InferOutput<TSchema>>
): InferOutput<TSchema> | undefined {
  const obj = safeJsonParse(text)
  if (!obj) {
    return undefined
  }

  const result = safeParse(schema, obj)
  if (result.success) {
    return result.output
  }

  const migrated = merge(obj)
  const validated = safeParse(schema, migrated)
  if (validated.success) {
    return validated.output
  }

  if (typeof __IS_DEV__ !== 'undefined' && __IS_DEV__) {
    // eslint-disable-next-line no-console
    console.warn('Failed to migrate state')
  }

  return undefined
}
