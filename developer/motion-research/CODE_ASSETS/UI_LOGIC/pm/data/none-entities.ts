/* c8 ignore start */
import { createNoneId } from '@motion/shared/identifiers'
import {
  type FolderSchema,
  type LabelSchema,
  type ProjectDefinitionSchema,
  type ProjectSchema,
  type StageDefinitionSchema,
  type StageSchema,
  type UserInfoSchema,
  type WorkspaceSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

export const NONE_STAGE_DEFINITION_ID = createNoneId('stage-definition')

export const NONE_STAGE_ID = createNoneId('stage')

export function isNoneStageDefinitionId(id: string): boolean {
  return id === NONE_STAGE_DEFINITION_ID
}

export function isNoneStageId(id: string): boolean {
  return id === NONE_STAGE_ID
}

export function createNoneLabel(workspaceId: string): LabelSchema {
  return {
    id: createNoneId(workspaceId),
    name: 'No Label',
    workspaceId,
    sortPosition: '00000',
    color: '',
    deleted: false,
  }
}

export function createNoLabelsInWorkspaces(
  workspaceIds: WorkspaceSchema['id'][]
) {
  return workspaceIds.reduce<Record<LabelSchema['id'], LabelSchema>>(
    (acc, workspaceId) => {
      const label = createNoneLabel(workspaceId)
      acc[label.id] = label
      return acc
    },
    {}
  )
}

const FAKE_DATE = DateTime.now().setZone('utc').toISO()

export function createNoneProject(workspaceId: string): ProjectSchema {
  return {
    id: createNoneId(workspaceId),
    name: 'No project',
    workspaceId,
    labelIds: [],
    priorityLevel: 'MEDIUM' as const,
    type: 'NORMAL' as const,
    createdByUserId: '',
    statusId: '',
    description: '',
    dueDate: null,
    managerId: null,
    createdTime: FAKE_DATE,
    updatedTime: FAKE_DATE,
    customFieldValues: {},
    flowTemplateId: null,
    startDate: null,
    activeStageDefinitionId: null,
    projectDefinitionId: null,
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
    folderId: null,
    deadlineStatus: 'none',
    scheduledStatus: null,
    estimatedCompletionTime: null,
  }
}

export function createNoProjectsInWorkspaces(
  workspaceIds: WorkspaceSchema['id'][]
) {
  return workspaceIds.reduce<Record<ProjectSchema['id'], ProjectSchema>>(
    (acc, workspaceId) => {
      const project = createNoneProject(workspaceId)
      acc[project.id] = project
      return acc
    },
    {}
  )
}

export function createNoneUser(workspaceId: string): UserInfoSchema {
  return {
    id: createNoneId(workspaceId),
    email: 'No User',
    name: 'Unassigned',
    isPlaceholder: false,
    hasActiveSubscription: false,
    deleted: false,
    picture: null,
    onboardingComplete: true,
  }
}

export function createUnassignedUser(): UserInfoSchema {
  return {
    id: createNoneId('unassigned'),
    email: '',
    name: 'Unassigned',
    isPlaceholder: false,
    hasActiveSubscription: false,
    deleted: false,
    picture: null,
    onboardingComplete: true,
  }
}

export function createNoneStage(): StageSchema {
  return {
    id: NONE_STAGE_ID,
    name: 'No Stage',
    color: 'gray',
    rank: '0',
    dueDate: FAKE_DATE,
    duration: 0,
    completion: 0,
    taskCount: 0,
    visited: true,
    canceledTime: null,
    completedTime: null,
    stageDefinitionId: NONE_STAGE_DEFINITION_ID,
    completedDuration: 0,
    completedTaskCount: 0,
    canceledDuration: 0,
    canceledTaskCount: 0,
    deadlineStatus: 'none',
    scheduledStatus: null,
    estimatedCompletionTime: null,
  }
}

export function createNoneStageDefinition(
  workspaceId: string
): StageDefinitionSchema {
  return {
    id: NONE_STAGE_DEFINITION_ID,
    name: 'No Stage',
    color: 'gray',
    duration: {
      unit: 'DAYS',
      value: 0,
    },
    tasks: [],
    workspaceId,
    variables: [],
  }
}

export function createNoneProjectStage(project: ProjectSchema): StageSchema {
  return {
    id: createNoneId('none-stage'),
    name: 'No Stage',
    color: 'gray',
    rank: '0',
    dueDate: project.dueDate ?? '',
    duration: 0,
    completion: 0,
    taskCount: 0,
    visited: true,
    canceledTime: null,
    completedTime: null,
    stageDefinitionId: NONE_STAGE_DEFINITION_ID,
    completedDuration: 0,
    completedTaskCount: 0,
    canceledDuration: 0,
    canceledTaskCount: 0,
    deadlineStatus: project.deadlineStatus ?? 'none',
    scheduledStatus: project.scheduledStatus,
    estimatedCompletionTime: project.estimatedCompletionTime,
  }
}

export function createNoneProjectDefinition(
  workspaceId: string
): ProjectDefinitionSchema {
  return {
    id: createNoneId('project-definition'),
    name: 'No Template',
    color: 'gray',
    workspaceId,
    description: '',
    priorityLevel: 'MEDIUM',
    managerId: null,
    createdByUserId: createNoneId('user'),
    labelIds: [],
    stageDefinitionReferences: [],
    stages: [],
    variables: [],
  }
}

export function createNoneFolder(workspaceId: string): FolderSchema {
  return {
    id: createNoneId(workspaceId),
    type: 'WORKSPACE',
    name: 'No folder',
    targetType: 'WORKSPACE',
    targetId: workspaceId,
    color: 'gray',
  }
}
