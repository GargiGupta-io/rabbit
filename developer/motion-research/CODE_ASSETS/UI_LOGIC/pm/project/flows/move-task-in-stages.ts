import { move } from '@motion/utils/array'

import { findStageForTask } from './find-stage-for-task'
import {
  type FlowTemplateFormTask,
  type FlowTemplateStage,
} from './form-fields'

export function moveTaskInStages(
  task: FlowTemplateFormTask,
  stages: FlowTemplateStage[],
  toTaskIndex: number,
  toStageIndex?: number
): FlowTemplateStage[] {
  const fromStage = findStageForTask(stages, task.id)
  if (fromStage == null) {
    throw new Error('Task not found in any stage')
  }

  const fromStageIndex = stages.indexOf(fromStage)
  const fromIndex = fromStage.tasks.findIndex((t) => t.id === task.id)

  if (toStageIndex == null) {
    return moveTaskWithinStage(stages, fromStageIndex, fromIndex, toTaskIndex)
  }

  return moveTaskToDifferentStage(
    task,
    stages,
    fromStageIndex,
    toStageIndex,
    toTaskIndex
  )
}

function moveTaskWithinStage(
  stages: FlowTemplateStage[],
  stageIndex: number,
  fromIndex: number,
  toIndex: number
): FlowTemplateStage[] {
  const stagesCopy = structuredClone(stages)
  stagesCopy[stageIndex].tasks = move(
    stages[stageIndex].tasks,
    fromIndex,
    toIndex
  )
  return stagesCopy
}

function moveTaskToDifferentStage(
  task: FlowTemplateFormTask,
  stages: FlowTemplateStage[],
  fromStageIndex: number,
  toStageIndex: number,
  toTaskIndex: number
): FlowTemplateStage[] {
  const stagesCopy = structuredClone(stages)

  stagesCopy[fromStageIndex].tasks = stagesCopy[fromStageIndex].tasks.filter(
    (i) => i.id !== task.id
  )
  stagesCopy[toStageIndex].tasks = stagesCopy[toStageIndex].tasks.toSpliced(
    toTaskIndex,
    0,
    task
  )
  return stagesCopy
}
