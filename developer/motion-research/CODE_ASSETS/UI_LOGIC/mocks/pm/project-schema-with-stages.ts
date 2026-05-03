/* c8 ignore start */

import { type ProjectSchema } from '@motion/rpc-types'

import { projectSchemaMock } from './project-schema'
import { stageSchemaMock } from './stage-schema'

export const mockProjectWithStages = {
  ...projectSchemaMock,
  startDate: '2024-01-01T00:00:00.000Z',
  dueDate: '2024-12-31T00:00:00.000Z',
  activeStageDefinitionId: 'stage-2',
  stages: stageSchemaMock,
} as const satisfies ProjectSchema
