import {
  type AdjustmentResults,
  getDefaultRelativeInterval,
  isSystemVariableKey,
  isVirtualVariableKey,
  type TaskDefinitionRelativeInterval,
  wrapVariableInDelimiters,
} from '@motion/shared/flows'
import { createPlaceholderId } from '@motion/shared/identifiers'
import { DEFAULT_DURATION, getValidMinimumDuration } from '@motion/shared/pm'
import { omit, uniqueId } from '@motion/utils/core'
import { isWeekend, parseDate } from '@motion/utils/dates'
import {
  type ProjectDefinitionSchema,
  type ProjectSchema,
  type StageDefinitionSchema,
  type StageSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import {
  type FlowTemplateStage,
  type TaskDefinitionFormRelativeInterval,
} from './form-fields'
import { getProjectDefDescription } from './utils'

import {
  type AllAvailableCustomFieldSchema,
  mapCustomFieldToFieldArrayWithValue,
} from '../../custom-fields'
import { type StageArg } from '../form-fields'
import { reduceCustomFieldsValuesFieldArrayToRecord } from '../updates'

export function isStagePriorToActiveStage(
  project: ProjectSchema,
  stageDefinitionId: StageDefinitionSchema['id']
) {
  const stageIndex = project.stages.findIndex(
    (s) => s.stageDefinitionId === stageDefinitionId
  )
  const projectActiveStageIndex = project.stages.findIndex(
    (s) => s.stageDefinitionId === project.activeStageDefinitionId
  )
  return stageIndex < projectActiveStageIndex
}

export const isEnabledStage = <
  T extends
    | Pick<StageArg, 'canceledTime' | 'skipped'>
    | AdjustmentResults['stages'][number],
>(
  stage: T
): boolean =>
  ('skipped' in stage && !stage.skipped) ||
  ('canceledTime' in stage && stage.canceledTime == null) ||
  ('canceled' in stage && !stage.canceled)

export function isStageActive(
  project: ProjectSchema | null | undefined,
  stageDefinitionId: StageDefinitionSchema['id'] | null | undefined
) {
  return (
    project != null &&
    stageDefinitionId != null &&
    stageDefinitionId === project.activeStageDefinitionId
  )
}

export function isStageCompleted(stage: StageSchema): boolean {
  return stage.completedTime != null
}

export function isStageCanceled(stage: StageSchema): boolean {
  return stage.canceledTime != null
}

export function isValidStageDeadline(
  date: DateTime,
  projectStageId: StageSchema['id'],
  project: Pick<ProjectSchema, 'startDate' | 'dueDate'> & {
    stages: Pick<ProjectSchema['stages'][number], 'dueDate' | 'id'>[]
  }
) {
  const projectStartDate = project.startDate
    ? DateTime.fromISO(project.startDate)
    : null
  const projectDueDate = project.dueDate
    ? DateTime.fromISO(project.dueDate)
    : null

  // Date is before or after the project start/end
  if (projectStartDate != null && date < projectStartDate) return false
  if (projectDueDate != null && date > projectDueDate) return false

  // Otherwise we check based on the previous/next stage
  const stageIndex = project.stages.findIndex((s) => s.id === projectStageId)
  if (stageIndex === -1) return false

  const lowerBound =
    stageIndex === 0
      ? projectStartDate
      : DateTime.fromISO(project.stages[stageIndex - 1].dueDate)

  const upperBound =
    stageIndex === project.stages.length - 1
      ? projectDueDate
      : DateTime.fromISO(project.stages[stageIndex + 1].dueDate)

  if (lowerBound != null && date < lowerBound) return false
  if (upperBound != null && date > upperBound) return false

  return true
}

export function getProjectStageFromDefinitionId(
  project: ProjectSchema | null | undefined,
  stageDefinitionId: StageDefinitionSchema['id'] | null | undefined
): StageSchema | undefined {
  return project?.stages.find((s) => s.stageDefinitionId === stageDefinitionId)
}

export const isNextActiveProjectStage = (
  project: ProjectSchema | null | undefined,
  stageDefinitionId: StageDefinitionSchema['id']
): boolean => {
  if (!project) return false

  const activeStages = project.stages.filter(isEnabledStage)
  const currentStageIndex = activeStages.findIndex(
    (s) => s.stageDefinitionId === project.activeStageDefinitionId
  )
  if (currentStageIndex === -1) return false

  const nextStage: StageSchema | undefined = activeStages[currentStageIndex + 1]
  return nextStage?.stageDefinitionId === stageDefinitionId
}

export function getNextActiveStage(
  project: ProjectSchema | null | undefined
): StageSchema | undefined {
  if (!project) return undefined

  const activeStages = project.stages.filter(isEnabledStage)
  const currentStageIndex = activeStages.findIndex(
    (s) => s.stageDefinitionId === project.activeStageDefinitionId
  )

  if (currentStageIndex === -1) return undefined

  return activeStages[currentStageIndex + 1]
}

/*
 * Returns the next stage in the project after the stage with the given stageDefinitionId
 */
export function getNextStage(
  project: ProjectSchema | null | undefined,
  stageDefinitionId: StageDefinitionSchema['id']
): StageSchema | undefined {
  if (!project) return undefined

  const activeStages = project.stages.filter(isEnabledStage)
  const stageIndex = activeStages.findIndex(
    (s) => s.stageDefinitionId === stageDefinitionId
  )

  if (stageIndex === -1 || stageIndex === activeStages.length - 1)
    return undefined

  return activeStages[stageIndex + 1]
}

export function getPreviousEnabledStage(
  project: ProjectSchema | null | undefined,
  stageDefinitionId: StageDefinitionSchema['id']
): StageSchema | undefined {
  if (!project) return undefined

  const activeStages = project.stages.filter(isEnabledStage)
  const currentStageIndex = activeStages.findIndex(
    (s) => s.stageDefinitionId === stageDefinitionId
  )

  if (currentStageIndex <= 0) return undefined

  return activeStages[currentStageIndex - 1]
}

export function getPreviousStage(
  project: ProjectSchema | null | undefined,
  stageDefinitionId: string
): StageSchema | undefined {
  const stageIndex = project?.stages.findIndex(
    (s) => s.stageDefinitionId === stageDefinitionId
  )

  if (stageIndex == null || stageIndex === 0) return undefined

  return project?.stages[stageIndex - 1]
}

export function getStageStartDate(
  projectStartDate: DateTime,
  previousStageDueDate: string | undefined
): DateTime {
  if (previousStageDueDate == null) {
    // Include the project start date in the duration calculation
    // by "starting" the project in the calculation one business day before
    let date = projectStartDate.minus({ days: 1 })
    while (isWeekend(date)) {
      date = date.minus({ days: 1 })
    }
    return date
  }
  return parseDate(previousStageDueDate)
}

export type StageVariant = 'completed' | 'skipped' | 'default'

export function getStageVariant(
  projectStage: Partial<Pick<StageSchema, 'completedTime' | 'canceledTime'>>
): StageVariant {
  if (projectStage.completedTime != null) {
    return 'completed'
  }

  if (projectStage.canceledTime != null) {
    return 'skipped'
  }

  return 'default'
}

export type StageTense = 'past' | 'current' | 'future'

export const getStageTense = (
  project: ProjectSchema,
  stageDefinitionId: StageDefinitionSchema['id']
): StageTense => {
  if (isStageActive(project, stageDefinitionId)) {
    return 'current'
  }

  if (isStagePriorToActiveStage(project, stageDefinitionId)) {
    return 'past'
  }

  return 'future'
}

export const DEFAULT_RELATIVE_START = getDefaultRelativeInterval('STAGE_START')
export const DEFAULT_RELATIVE_DEADLINE = getDefaultRelativeInterval('STAGE_DUE')

type ConvertStageDefinitionToFormStageOpts = {
  stage: StageDefinitionSchema
  workspaceCustomFields: AllAvailableCustomFieldSchema[]
  addPlaceholderTaskIds?: boolean
}
export const convertStageDefinitionToFormStage = (
  opts: ConvertStageDefinitionToFormStageOpts
): FlowTemplateStage => ({
  ...opts.stage,
  duration: opts.stage.duration,
  tasks: opts.stage.tasks.map((task) => ({
    ...omit(task, [
      'customFieldValues',
      'uploadedFileIds',
      'deadlineType',
      'description',
      'startRelativeInterval',
      'dueRelativeInterval',
    ]),
    ...(opts.addPlaceholderTaskIds
      ? { id: createPlaceholderId(uniqueId('task')) }
      : {}),
    startRelativeInterval: convertRelativeIntervalToFormRelativeInterval(
      task.startRelativeInterval ?? getDefaultRelativeInterval('STAGE_START')
    ),
    dueRelativeInterval: convertRelativeIntervalToFormRelativeInterval(
      task.dueRelativeInterval ?? getDefaultRelativeInterval('STAGE_DUE')
    ),
    customFieldValuesFieldArray: opts.workspaceCustomFields.map((field) =>
      mapCustomFieldToFieldArrayWithValue(field, task.customFieldValues)
    ),
    deadlineType: task.deadlineType ?? 'SOFT',
    uploadedFileIds: task.uploadedFileIds ?? [],
    description: getProjectDefDescription(task.description),
    duration: task.duration ?? DEFAULT_DURATION,
    minimumDuration: getValidMinimumDuration(
      task.duration,
      task.minimumDuration
    ),
  })),
})

export function convertFormStagesToStageDefinition(
  stages: FlowTemplateStage[],
  originalTaskOrderMap: Record<string, readonly [string, number]>
): StageDefinitionSchema[] {
  return stages.map((stage) => {
    const stageWithCleanedVariables = stripVirtualAndSystemVariables(stage)

    return {
      ...stage,
      variables: stageWithCleanedVariables.variables,
      duration: stage.duration,
      tasks: stage.tasks.map((task) => {
        // Check if task exists in originalTaskOrderMap and is in a different stage
        const originalIndices = originalTaskOrderMap[task.id]
        const needsNewId = originalIndices && originalIndices[0] !== stage.id

        return {
          ...omit(task, [
            'customFieldValuesFieldArray',
            'uploadedFileIds',
            'startRelativeInterval',
            'dueRelativeInterval',
          ]),
          // Reset ID if task is in a different stage
          ...(needsNewId ? { id: createPlaceholderId(uniqueId('task')) } : {}),
          customFieldValues: reduceCustomFieldsValuesFieldArrayToRecord(
            task.customFieldValuesFieldArray ?? [],
            { omitNull: true }
          ),
          uploadedFileIds: task.uploadedFileIds ?? [],
          startRelativeInterval: convertFormRelativeIntervalToRelativeInterval(
            task.startRelativeInterval
          ),
          dueRelativeInterval: convertFormRelativeIntervalToRelativeInterval(
            task.dueRelativeInterval
          ),
        }
      }),
    }
  })
}

export function stripVirtualAndSystemVariables<
  T extends Pick<
    StageDefinitionSchema | FlowTemplateStage,
    'variables' | 'tasks'
  >,
>(stageDefinition: T): T {
  const parsedVariables = stageDefinition.variables
    .filter(
      (variable) =>
        !isSystemVariableKey(variable.key) &&
        !isVirtualVariableKey(variable.key)
    )
    .map((variable) => omit(variable, ['used']))

  return {
    ...stageDefinition,
    variables: parsedVariables,
  }
}

export const isStageUnfit = (stage: StageSchema) => {
  return stage.scheduledStatus?.startsWith('UNFIT') ?? false
}

export const convertFormRelativeIntervalToRelativeInterval = (
  interval: TaskDefinitionFormRelativeInterval
): TaskDefinitionRelativeInterval => {
  return {
    ...interval,
    duration: {
      unit: interval.duration.unit,
      value: interval.duration.value * interval.duration.sign,
    },
  }
}

export const convertRelativeIntervalToFormRelativeInterval = (
  interval: TaskDefinitionRelativeInterval
): TaskDefinitionFormRelativeInterval => {
  const sign =
    interval.referenceType === 'STAGE_DUE'
      ? -1
      : interval.duration.value >= 0
        ? 1
        : -1

  return {
    ...interval,
    duration: {
      ...interval.duration,
      value: Math.abs(interval.duration.value),
      sign,
    },
  }
}

export type IsVariableUsedInStageArgs = {
  stage: Pick<StageDefinitionSchema, 'tasks'>
  variableKey: string
  type: 'text' | 'role'
}
/**
 * Checks whether a variable is used in a stage's tasks
 * @param stage The stage to check
 * @param variableKey The variable key to look for
 * @param type The type of variable to check for ('text' | 'role')
 * @returns boolean indicating whether the variable is used
 */
export function isVariableUsedInStage({
  stage,
  variableKey,
  type,
}: IsVariableUsedInStageArgs): boolean {
  const wrappedVariable = wrapVariableInDelimiters(variableKey)

  return stage.tasks.some((task) => {
    if (type === 'role') {
      // Check if the variable is used as an assignee
      return task.assigneeVariableKey === variableKey
    }

    // Check if the variable is used in name or description
    const nameMatches = task.name.includes(wrappedVariable)
    const descriptionMatches = task.description.includes(wrappedVariable)

    return nameMatches || descriptionMatches
  })
}

export type IsVariableTypeUsedInDefinitionArgs = {
  projectDefinition?: ProjectDefinitionSchema | null
  type: 'text' | 'role'
}
export function isVariableTypeUsedInDefinition({
  projectDefinition,
  type,
}: IsVariableTypeUsedInDefinitionArgs): boolean {
  if (!projectDefinition || projectDefinition.stages.length === 0) return false

  // have to filter based on both definition and stage variables because of
  // virtual variables being loaded in the pwt modal :skull:
  const projectDefinitionVariables = projectDefinition.variables.filter(
    (variable) =>
      type === 'text' ? variable.type === 'text' : variable.type === 'person'
  )

  return projectDefinition.stages.some((stage) => {
    const variables = [
      ...stage.variables.filter((variable) =>
        type === 'text' ? variable.type === 'text' : variable.type === 'person'
      ),
      ...projectDefinitionVariables,
    ]

    return variables.some((variable) =>
      isVariableUsedInStage({
        stage,
        variableKey: variable.key,
        type,
      })
    )
  })
}
