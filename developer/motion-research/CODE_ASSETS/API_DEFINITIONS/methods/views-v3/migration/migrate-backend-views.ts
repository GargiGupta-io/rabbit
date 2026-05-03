import { MultipleViewResponseV3Schema } from '@motion/zod/client'

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
  data: MultipleViewResponseV3Schema
): MultipleViewResponseV3Schema {
  for (let i = 1; i < MIGRATIONS.length; i++) {
    data.models = MIGRATIONS[i](data.models)
  }

  return data
}
