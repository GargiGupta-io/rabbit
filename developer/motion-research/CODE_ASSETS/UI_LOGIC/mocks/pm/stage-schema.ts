/* c8 ignore start */

import { type StageSchema } from '@motion/rpc-types'

const baseStage = {
  id: 'stage-1',
  name: 'Stage',
  rank: '0',
  color: 'blue',
  stageDefinitionId: 'stage-1',
  dueDate: '2024-03-31T00:00:00.000Z',
  visited: false,
  completion: 100,
  duration: 30,
  taskCount: 0,
  completedTime: null,
  canceledTime: null,
  completedDuration: 30,
  completedTaskCount: 0,
  canceledDuration: 0,
  canceledTaskCount: 0,
  estimatedCompletionTime: null,
  deadlineStatus: 'none' as const,
  scheduledStatus: 'ON_TRACK' as const,
} satisfies StageSchema

export const stageSchemaMock = [
  {
    ...baseStage,
    id: 'stage-1',
    name: 'Stage 1',
    rank: '0',
    stageDefinitionId: 'stage-1',
    dueDate: '2024-03-31T00:00:00.000Z',
    completedTime: '2024-03-15T00:00:00.000Z',
  },
  {
    ...baseStage,
    id: 'stage-2',
    name: 'Stage 2',
    rank: '1',
    stageDefinitionId: 'stage-2',
    dueDate: '2024-06-30T00:00:00.000Z',
  },
  {
    ...baseStage,
    id: 'stage-3',
    name: 'Stage 3',
    rank: '2',
    stageDefinitionId: 'stage-3',
    dueDate: '2024-09-30T00:00:00.000Z',
    canceledTime: '2024-09-01T00:00:00.000Z',
  },
  {
    ...baseStage,
    id: 'stage-4',
    name: 'Stage 4',
    rank: '3',
    stageDefinitionId: 'stage-4',
    dueDate: '2024-12-31T00:00:00.000Z',
  },
] satisfies StageSchema[]
