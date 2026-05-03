import { type MultipleViewResponseSchema } from '@motion/zod/client'

import {
  addArchivedFilter,
  addCanceledFilter,
  migrateTaskFields,
} from './migrations'

/* c8 ignore next */
const MIGRATIONS = [
  (obj: any) => obj,
  migrateTaskFields,
  addArchivedFilter,
  addCanceledFilter,
]

export function migrateBackendViews(
  data: MultipleViewResponseSchema
): MultipleViewResponseSchema {
  for (let i = 1; i < MIGRATIONS.length; i++) {
    data.models = MIGRATIONS[i](data.models)
  }

  return data
}
