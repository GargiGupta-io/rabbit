import { createStateKey } from '@motion/react-core/shared-state'
import { cloneDeep } from '@motion/utils/core'

import { DEFAULT_FILTER_STATE } from './defaults'
import { deserialize, serialize } from './serialization'
import { type EntityFilterState } from './types'

export const ActiveFilterKey = createStateKey<EntityFilterState>(
  'active-filter',
  {
    defaultValue: cloneDeep(DEFAULT_FILTER_STATE),
    deserialize,
    serialize,
  }
)
