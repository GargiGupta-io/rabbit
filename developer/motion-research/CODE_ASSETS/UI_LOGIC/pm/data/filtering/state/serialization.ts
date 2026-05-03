import { Schema } from './schema'
import { type EntityFilterState } from './types'
import { toV2, toV3, toV4, toV5, toV6, toV7, toV8, toV9 } from './versions'

import { parse } from '../../../../validation'

export function deserialize(raw: string): EntityFilterState | undefined {
  // @ts-expect-error - type mismatch
  return parse(Schema, raw, migrateFromPrevious)
}

export function serialize(value: EntityFilterState): string {
  return JSON.stringify(value)
}

/* c8 ignore start */
const MIGRATIONS = [
  (obj: any) => obj,
  toV2,
  toV3,
  toV4,
  toV5,
  toV6,
  toV7,
  toV8,
  toV9,
]

function migrateFromPrevious(obj: any): EntityFilterState | undefined {
  if (obj == null) return undefined

  const version = obj.$version ?? 1
  for (let i = version; i < MIGRATIONS.length; i++) {
    obj = MIGRATIONS[i](obj)
    if (obj == null) return undefined
  }

  return obj
}
