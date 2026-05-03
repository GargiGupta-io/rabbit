import { type StageSchema } from '@motion/rpc-types'
import { createNoneId } from '@motion/shared/identifiers'
import { formatToReadableWeekDayMonth } from '@motion/utils/dates'
import {
  type NormalTaskSchema,
  type ProjectSchema,
  type RecurringInstanceSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

type CreateTemporaryProjectProps = Pick<
  ProjectSchema,
  'workspaceId' | 'statusId' | 'managerId' | 'createdByUserId'
> & {
  priorityLevel?: ProjectSchema['priorityLevel']
  labelId?: ProjectSchema['labelIds'][number] | null
  customFieldValues?: ProjectSchema['customFieldValues'] | null
  folderId?: ProjectSchema['folderId']
}
export const createTemporaryProject = ({
  managerId,
  createdByUserId,
  workspaceId,
  statusId,
  priorityLevel,
  labelId,
  customFieldValues = {},
  folderId = null,
}: CreateTemporaryProjectProps): ProjectSchema => {
  const today = DateTime.now().toISO()
  return {
    id: createNoneId(workspaceId),
    type: 'NORMAL',
    managerId,
    workspaceId,
    statusId,
    name: '',
    description: '',
    startDate: today,
    dueDate: getProjectInitialDueDate(),
    priorityLevel: priorityLevel ?? 'MEDIUM',
    labelIds: labelId ? [labelId] : [],
    createdByUserId,
    createdTime: today,
    updatedTime: null,
    customFieldValues: customFieldValues ?? {},
    flowTemplateId: null,
    projectDefinitionId: null,
    activeStageDefinitionId: null,
    stages: [],
    variableInstances: [],
    color: 'gray',
    completedDuration: 0,
    completedTaskCount: 0,
    canceledDuration: 0,
    canceledTaskCount: 0,
    duration: 0,
    taskCount: 0,
    completion: 0,
    uploadedFileIds: [],
    folderId,
    deadlineStatus: null,
    scheduledStatus: null,
    estimatedCompletionTime: null,
  }
}

export function isProject(
  item: NormalTaskSchema | RecurringInstanceSchema | ProjectSchema
): item is ProjectSchema {
  return 'projectDefinitionId' in item
}

export const isNormalProject = (project: ProjectSchema | undefined) =>
  project?.type === 'NORMAL'

export function isProjectWithDates<
  T extends Pick<ProjectSchema, 'startDate' | 'dueDate'>,
>(
  project: T | null | undefined
): project is T & { startDate: string; dueDate: string } {
  return project?.startDate != null && project?.dueDate != null
}

/**
 * Return an initial project due date given the following logic:
 * - If today is Sunday, Monday or Tuesday of week N, then pick Friday of week N+1
 * - If today is Wednesday, Thursday, Friday, Saturday then pick Friday of week N+2
 *
 * @returns string - Full ISO Date time for the project due date
 */
export function getProjectInitialDueDate(): string {
  const now = DateTime.now()
  const weekday = now.get('weekday')

  const dayOffset = weekday === 7 ? 1 : 0

  // Monday, Tuesday or Sunday
  const weekOffset = [1, 2, 7].includes(weekday) ? 1 : 2

  return now
    .plus({ day: dayOffset, week: weekOffset })
    .endOf('week')
    .minus({ day: 2 })
    .toISO()
}

export function getProjectDateText(dateValue: string | null) {
  if (!dateValue) return 'None'

  return formatToReadableWeekDayMonth(dateValue)
}

export function getActiveProjectStage(
  project: Pick<ProjectSchema, 'stages' | 'activeStageDefinitionId'>
): StageSchema | undefined {
  return project.stages.find(
    (s) => s.stageDefinitionId === project.activeStageDefinitionId
  )
}

export function getProjectStageByStageDefinitionId(
  project: Pick<ProjectSchema, 'stages' | 'activeStageDefinitionId'>,
  stageDefinitionId: string
): StageSchema | undefined {
  return project.stages.find((s) => s.stageDefinitionId === stageDefinitionId)
}
