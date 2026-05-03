import { templateStr } from '@motion/react-core/strings'
import type {
  ProjectSchema,
  StageDefinitionSchema,
  VariableDefinitionSchema,
  VariableInstanceSchema,
} from '@motion/rpc-types'
import {
  replaceSystemVariableKeys,
  type SystemVariableReplacementValues,
  wrapVariableInDelimiters,
} from '@motion/shared/flows'
import {
  diffBusinessDays,
  formatToReadableWeekDayMonth,
  parseDate,
} from '@motion/utils/dates'

import { DateTime } from 'luxon'

import { type StageWithDates } from '..'

export function isValidStageDefinitionId(
  stageDefinitionId: StageDefinitionSchema['id'] | null,
  project: ProjectSchema
) {
  return (
    stageDefinitionId != null &&
    project.stages.some((s) => s.stageDefinitionId === stageDefinitionId)
  )
}

export function replaceTextVariables(
  text: string,
  variables: VariableDefinitionSchema[],
  variablesValues: Record<string, VariableInstanceSchema>,
  systemVariableValues: SystemVariableReplacementValues
) {
  let result = replaceProjectTextVariableKeys(text, variables, variablesValues)
  result = replaceSystemVariableKeys(result, systemVariableValues)
  return result
}

export function replaceProjectTextVariableKeys(
  textToReplace: string,
  variables: VariableDefinitionSchema[],
  variablesValues: Record<string, VariableInstanceSchema>
) {
  return variables.reduce((result, variable) => {
    if (variable.type === 'text') {
      const wrappedVariableName = wrapVariableInDelimiters(variable.key)

      return result.replaceAll(
        wrappedVariableName,
        variablesValues[variable.id]?.value ?? ''
      )
    }

    return result
  }, textToReplace)
}

export function getDidIncreaseProjectLength(
  project: Pick<ProjectSchema, 'dueDate' | 'startDate'>,
  startDate: string | null,
  dueDate: string | null
) {
  if (
    startDate != null &&
    dueDate != null &&
    project.startDate != null &&
    project.dueDate != null
  ) {
    const originalProjectLength = DateTime.fromISO(project.dueDate).diff(
      DateTime.fromISO(project.startDate),
      'days'
    )
    const newProjectLength = DateTime.fromISO(dueDate).diff(
      DateTime.fromISO(startDate),
      'days'
    )

    return newProjectLength > originalProjectLength
  }

  if (startDate != null && project.startDate != null) {
    return startDate < project.startDate
  }

  if (dueDate != null && project.dueDate != null) {
    return dueDate > project.dueDate
  }

  return false
}

export function getAdjustedProjectDateConfirmationText({
  project,
  projectDueDate,
  projectStartDate,
}: {
  project: Pick<ProjectSchema, 'dueDate' | 'startDate'>
  projectStartDate: string | null
  projectDueDate: string | null
}) {
  const didIncreaseProjectLength = getDidIncreaseProjectLength(
    project,
    projectStartDate,
    projectDueDate
  )

  return templateStr(
    'Are you sure you want to make this project {{operation}} ({{startDate}} - {{dueDate}})?',
    {
      operation: didIncreaseProjectLength ? 'longer' : 'shorter',
      startDate: projectStartDate
        ? formatToReadableWeekDayMonth(projectStartDate)
        : 'N/A',
      dueDate: projectDueDate
        ? formatToReadableWeekDayMonth(projectDueDate)
        : 'N/A',
    }
  )
}

export function getStageChangeText({
  stageWithDates,
  pluralize,
}: {
  stageWithDates: Pick<StageWithDates, 'start' | 'due'>
  pluralize: (
    numDays: number,
    singular: string,
    plural: string
  ) => string | React.ReactNode
}) {
  const { start, due } = stageWithDates
  const numDays = diffBusinessDays(parseDate(start), parseDate(due))

  return templateStr('{{date}} {{numDays}}', {
    date: formatToReadableWeekDayMonth(stageWithDates.due),
    numDays:
      numDays !== undefined
        ? numDays < 1
          ? `(Less than 1 day)`
          : `(${numDays} ${pluralize(
              numDays,
              'business day',
              'business days'
            )})`
        : '',
  })
}

export function getProjectDefDescription(
  description: string | undefined
): string {
  if (description == null || description === '') return '<p></p>'

  return description
}
