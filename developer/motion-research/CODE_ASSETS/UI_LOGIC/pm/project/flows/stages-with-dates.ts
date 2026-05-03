import {
  type AdjustedStage,
  StageAdjuster,
  StageAdjusterStrategy,
} from '@motion/shared/flows'
import { parseDate } from '@motion/utils/dates'
import { type ProjectSchema, type StageSchema } from '@motion/zod/client'

import { isEnabledStage } from './stages'

import { type StageArg } from '../form-fields'

/*
 * Given a list of stages, and a project start and due date, return the stages with the correct stage start and end dates
 */
export function getEnabledStagesWithDates<
  T extends Pick<StageArg, 'dueDate' | 'canceledTime'>,
>(
  stages: T[],
  { start, due }: { start: string | null; due: string | null }
): { start: string; due: string; stage: T }[] {
  const enabledStages = stages.filter(isEnabledStage)

  // If there is a start date provided, use that as the start date for the first stage, otherwise use the stage due date
  const getStageStart = (index: number) => {
    if (index === 0) {
      return start ?? enabledStages[index].dueDate
    }

    return enabledStages[index - 1].dueDate
  }

  // If there is a due date provided, use that as the due date for the last stage
  const getStageEnd = (index: number) => {
    if (index === enabledStages.length - 1 && due) {
      return due
    }

    return enabledStages[index].dueDate
  }

  return enabledStages.map((stage, index) => {
    const stageStart = getStageStart(index)
    const stageEnd = getStageEnd(index)

    return {
      stage,
      start: parseDate(stageStart).toISODate(),
      due: parseDate(stageEnd).toISODate(),
    }
  })
}

export type StageWithDates = {
  start: string
  due: string
  stage: Pick<StageSchema, 'id' | 'dueDate' | 'stageDefinitionId'>
}

const organizeStages = (
  mergedStagesWithDates: StageWithDates[],
  previousStagesWithDates: StageWithDates[]
) => {
  // Organize stages into changed and unchanged
  return mergedStagesWithDates.reduce(
    (acc, stageWithDates, index) => {
      let maybeUpdatedStage = stageWithDates
      let previousStage = previousStagesWithDates[index]

      if (
        maybeUpdatedStage.start !== previousStage.start ||
        maybeUpdatedStage.due !== previousStage.due
      ) {
        acc.changed.push(maybeUpdatedStage)
      } else {
        acc.unchanged.push(maybeUpdatedStage)
      }

      return acc // Add this line to return the accumulator
    },
    {
      unchanged: [],
      changed: [],
    } as Record<'unchanged' | 'changed', StageWithDates[]>
  )
}

export function getUpdatedStages({
  project,
  startDate,
  dueDate,
}: {
  project: Pick<
    ProjectSchema,
    'startDate' | 'dueDate' | 'stages' | 'activeStageDefinitionId'
  >
  startDate?: string
  dueDate?: string
}) {
  let stagesWithDates: StageWithDates[] = []
  let updatedStages: Record<'unchanged' | 'changed', StageWithDates[]> = {
    unchanged: [],
    changed: [],
  }

  const adjuster = new StageAdjuster({
    startDate: project.startDate,
    dueDate: project.dueDate,
    activeStageDefinitionId: project.activeStageDefinitionId,
    stages: project.stages.map((stage) => ({
      ...stage,
      canceled: !!stage.canceledTime,
      completed: !!stage.completedTime,
    })),
  })

  if (startDate) {
    adjuster.prepareProjectAdjustment({
      strategy: StageAdjusterStrategy.DISTRIBUTE,
      target: 'start',
      value: startDate,
    })
  }

  if (dueDate) {
    adjuster.prepareProjectAdjustment({
      strategy: StageAdjusterStrategy.DISTRIBUTE,
      target: 'due',
      value: dueDate,
    })
  }

  const adjustedStages = adjuster
    .calculateResult()
    .stages.filter(
      (s): s is Extract<AdjustedStage, { status: 'update' }> =>
        s.status === 'update'
    )
    .map((stage) => ({
      ...stage,
      id: stage.stageDefinitionId,
      dueDate: stage.dueDate.toISOString(),
    }))

  stagesWithDates = getEnabledStagesWithDates(adjustedStages, {
    start: startDate || project.startDate,
    due: dueDate || project.dueDate,
  })

  const previousStagesWithDates = getEnabledStagesWithDates(project.stages, {
    start: project.startDate,
    due: project.dueDate,
  })

  updatedStages = organizeStages(stagesWithDates, previousStagesWithDates)

  return {
    stagesWithDates,
    updatedStages,
  }
}
