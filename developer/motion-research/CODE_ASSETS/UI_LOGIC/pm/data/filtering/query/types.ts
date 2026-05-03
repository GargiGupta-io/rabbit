import { type DeepPartial } from '@motion/utils/types'

import {
  type ProjectFilter,
  type TaskFilter,
  type WorkspaceFilter,
} from '../state'

export type DataFilters = {
  tasks: TaskFilter
  projects: ProjectFilter
  workspaces: WorkspaceFilter
}

export type PartialDataFilters = DeepPartial<DataFilters>
