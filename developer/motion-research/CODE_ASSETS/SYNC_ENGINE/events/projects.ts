import { COLORS } from '@motion/shared/common'
import { ABSORB_STRATEGY, DISTRIBUTE_STRATEGY } from '@motion/shared/projects'

import z from 'zod/v4'

import { ObjectIdSchema, StringIsoDateSchema } from '../common'
import { ProjectSchema, StageSchema } from '../models'
import { createModelSyncEvent, createPushEvent } from '../utils/create-events'

export const CreateVariableInstanceSchema = z.object({
  variableId: z.string().min(1),
  value: z.string().nullable(),
})

export const UpsertStageSchema = z.object({
  id: z.string().optional(),
  stageDefinitionId: z.string(),
  dueDate: StringIsoDateSchema,
  skipped: z.boolean().optional(),
  variableInstances: CreateVariableInstanceSchema.array().optional(),
})
export type UpsertStageSchema = z.output<typeof UpsertStageSchema>

export const CreateProjectRequest = ProjectSchema.partial()
  .required({
    workspaceId: true,
    name: true,
  })
  .omit({
    /** @sort-keys */
    activeStageDefinitionId: true,
    canceledDuration: true,
    canceledTaskCount: true,
    completedDuration: true,
    completedTaskCount: true,
    createdByUserId: true,
    dueDate: true,
    estimatedCompletionTime: true,
    scheduledStatus: true,
    stages: true,
    startDate: true,
    taskCount: true,
    type: true,
  })
  .extend({
    stages: UpsertStageSchema.array().optional(),
    dueDate: StringIsoDateSchema.nullish(),
    startDate: StringIsoDateSchema.nullish(),
  })
export type CreateProjectRequest = z.output<typeof CreateProjectRequest>

export const CreateProjectFromTaskRequest = CreateProjectRequest.extend({
  taskId: z.string(),
})
export type CreateProjectFromTaskRequest = z.output<
  typeof CreateProjectFromTaskRequest
>

export const PushCreateProject = createPushEvent(
  'project.create',
  1,
  CreateProjectRequest
)
export type PushCreateProject = z.output<typeof PushCreateProject>

export const PushCreateProjectFromTask = createPushEvent(
  'project.create-from-task',
  1,
  CreateProjectFromTaskRequest
)
export type PushCreateProjectFromTask = z.output<
  typeof PushCreateProjectFromTask
>

export const UpdateProjectRequest = CreateProjectRequest.partial()
  .omit({
    id: true,
    projectDefinitionId: true,
    stages: true,
    variableInstances: true,
  })
  .extend({
    id: ProjectSchema.shape.id,
    activeStageDefinitionId:
      ProjectSchema.shape.activeStageDefinitionId.optional(),
    options: z
      .object({
        dateAdjustmentStrategy: z
          .enum([ABSORB_STRATEGY, DISTRIBUTE_STRATEGY])
          .optional(),
      })
      .optional(),
  })
export type UpdateProjectRequest = z.output<typeof UpdateProjectRequest>

export const PushUpdateProject = createPushEvent(
  'project.update',
  1,
  UpdateProjectRequest
)
export type PushUpdateProject = z.output<typeof PushUpdateProject>

export const PushDeleteProject = createPushEvent(
  'project.delete',
  1,
  ObjectIdSchema
)
export type PushDeleteProject = z.output<typeof PushDeleteProject>

// Apply definition to project
export const ApplyDefinitionToProjectRequest = z.object({
  id: z.string(),
  projectDefinitionId: z.string(),
  name: z.string().min(1),
  startDate: StringIsoDateSchema,
  dueDate: StringIsoDateSchema,
  stages: UpsertStageSchema.array().min(1),
  variableInstances: CreateVariableInstanceSchema.array(),
})
export type ApplyDefinitionToProjectRequest = z.output<
  typeof ApplyDefinitionToProjectRequest
>

export const PushApplyDefinitionToProject = createPushEvent(
  'project.apply-definition',
  1,
  ApplyDefinitionToProjectRequest
)
export type PushApplyDefinitionToProject = z.output<
  typeof PushApplyDefinitionToProject
>

// Resolve project
export const ResolveProjectRequest = z.object({
  id: z.string(),
  status: z.enum(['completed', 'canceled']),
  tasks: z.enum(['complete', 'cancel', 'backlog', 'noop']),
  statusId: z.string().optional(),
})
export type ResolveProjectRequest = z.output<typeof ResolveProjectRequest>

export const PushResolveProject = createPushEvent(
  'project.resolve',
  1,
  ResolveProjectRequest
)
export type PushResolveProject = z.output<typeof PushResolveProject>

// Shift project dates
export const ShiftProjectRequest = z.object({
  id: z.string(),
  numDays: z.number().int(),
})
export type ShiftProjectRequest = z.output<typeof ShiftProjectRequest>

export const PushShiftProject = createPushEvent(
  'project.shift',
  1,
  ShiftProjectRequest
)
export type PushShiftProject = z.output<typeof PushShiftProject>

// Set project to stage
export const SetProjectToStageRequest = z.object({
  id: z.string(),
  stageDefinitionId: z.string(),
  strategy: z.enum(['COMPLETE', 'CANCEL', 'VISIT', 'NOOP', 'MOVE']).optional(),
})
export type SetProjectToStageRequest = z.output<typeof SetProjectToStageRequest>

export const PushSetProjectToStage = createPushEvent(
  'project.set-to-stage',
  1,
  SetProjectToStageRequest
)
export type PushSetProjectToStage = z.output<typeof PushSetProjectToStage>

// Advance project stage
export const AdvanceProjectStageRequest = z.object({
  id: z.string(),
  strategy: z.enum(['COMPLETE', 'CANCEL', 'NOOP', 'MOVE']).optional(),
  activeStageDefinitionId:
    ProjectSchema.shape.activeStageDefinitionId.optional(),
})
export type AdvanceProjectStageRequest = z.output<
  typeof AdvanceProjectStageRequest
>

export const PushAdvanceProjectStage = createPushEvent(
  'project.advance-stage',
  1,
  AdvanceProjectStageRequest
)
export type PushAdvanceProjectStage = z.output<typeof PushAdvanceProjectStage>

// Complete project stage
export const CompleteProjectStageRequest = z.object({
  id: z.string(),
  stageDefinitionId: z.string(),
})
export type CompleteProjectStageRequest = z.output<
  typeof CompleteProjectStageRequest
>

export const PushCompleteProjectStage = createPushEvent(
  'project.complete-stage',
  1,
  CompleteProjectStageRequest
)
export type PushCompleteProjectStage = z.output<typeof PushCompleteProjectStage>

// Cancel project stage
export const CancelProjectStageRequest = z.object({
  id: z.string(),
  stageDefinitionId: z.string(),
})
export type CancelProjectStageRequest = z.output<
  typeof CancelProjectStageRequest
>

export const PushCancelProjectStage = createPushEvent(
  'project.cancel-stage',
  1,
  CancelProjectStageRequest
)
export type PushCancelProjectStage = z.output<typeof PushCancelProjectStage>

// Add project stage
export const AddProjectStageRequest = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.enum(COLORS),
  duration: z.object({
    unit: z.enum(['DAYS', 'BUSINESS_DAYS', 'WEEKS', 'MONTHS']),
    value: z.number().int(),
  }),
  index: z.number().int().min(0),
})
export type AddProjectStageRequest = z.output<typeof AddProjectStageRequest>

export const PushAddProjectStage = createPushEvent(
  'project.add-stage',
  1,
  AddProjectStageRequest
)
export type PushAddProjectStage = z.output<typeof PushAddProjectStage>

// Remove project stage
export const RemoveProjectStageRequest = z.object({
  id: z.string(),
  stageId: z.string(),
  taskAction: z.enum(['delete', 'next_stage', 'previous_stage', 'no_stage']),
})
export type RemoveProjectStageRequest = z.output<
  typeof RemoveProjectStageRequest
>

export const PushRemoveProjectStage = createPushEvent(
  'project.remove-stage',
  1,
  RemoveProjectStageRequest
)
export type PushRemoveProjectStage = z.output<typeof PushRemoveProjectStage>

export const BulkProjectLocationUpdateSchema = z.object({
  type: z.literal('bulk-project-location-update'),
  folderId: z.string().min(1).nullish(),
  workspaceId: z.string().min(1).optional(),
})

// Only location update is currently used
export const BulkProjectUpdateSchema = z.discriminatedUnion('type', [
  BulkProjectLocationUpdateSchema,
])

export const BulkUpdateProjectsInWorkspaceSchema = z.object({
  currentWorkspaceId: z.string().min(1),
  projectIds: z.string().min(1).array().min(1),
  update: BulkProjectUpdateSchema,
})

export const BulkUpdateProjectsRequest = z.object({
  bulkUpdateProjectsInWorkspaces: z.array(BulkUpdateProjectsInWorkspaceSchema),
})
export type BulkUpdateProjectsRequest = z.output<
  typeof BulkUpdateProjectsRequest
>

export const PushBulkUpdateProjects = createPushEvent(
  'project.bulk-update',
  1,
  BulkUpdateProjectsRequest
)
export type PushBulkUpdateProjects = z.output<typeof PushBulkUpdateProjects>

export const UpdateProjectStageDueDateRequest = z.object({
  id: z.string(),
  stageDefinitionId: z.string(),
  dueDate: StringIsoDateSchema,
  dateAdjustmentStrategy: z.enum(['SHIFT', 'ABSORB']).optional(),
  projectStartDate: z.string().optional(),
  projectDueDate: z.string().optional(),
  projectStages: z.array(
    StageSchema.omit({
      dueDate: true,
      canceledTime: true,
      completedTime: true,
      completedDuration: true,
      canceledDuration: true,
      duration: true,
      estimatedCompletionTime: true,
    }).extend({
      dueDate: z.string(),
      canceledTime: z.string().nullable(),
      completedTime: z.string().nullable(),
      completedDuration: z.number(),
      canceledDuration: z.number(),
      duration: z.number(),
      estimatedCompletionTime: z.string().nullable(),
    })
  ),
})
export type UpdateProjectStageDueDateRequest = z.output<
  typeof UpdateProjectStageDueDateRequest
>

export const PushUpdateProjectStageDueDate = createPushEvent(
  'project.update-stage-due-date',
  1,
  UpdateProjectStageDueDateRequest
)
export type PushUpdateProjectStageDueDate = z.output<
  typeof PushUpdateProjectStageDueDate
>

export const UpdateProjectStagesToProjectedDatesRequest = z.object({
  id: z.string(),
  updates: z.array(
    z.object({
      stageDefinitionId: z.string(),
      dueDate: z.string(),
    })
  ),
})
export type UpdateProjectStagesToProjectedDatesRequest = z.output<
  typeof UpdateProjectStagesToProjectedDatesRequest
>

export const PushUpdateProjectStagesToProjectedDates = createPushEvent(
  'project.update-stages-to-projected-dates',
  1,
  UpdateProjectStagesToProjectedDatesRequest
)
export type PushUpdateProjectStagesToProjectedDates = z.output<
  typeof PushUpdateProjectStagesToProjectedDates
>

// export const CreateProjectFromTemplateRequest = z.object({
//   templateId: z.string(),
//   taskModifiers: z
//     .array(
//       z.object({
//         id: z.string(),
//         dueDate: z.string(),
//       })
//     )
//     .optional(),
// })
// export type CreateProjectFromTemplateRequest = z.output<
//   typeof CreateProjectFromTemplateRequest
// >

// export const PushCreateProjectFromTemplate = createPushEvent(
//   'project.create-from-template',
//   1,
//   CreateProjectFromTemplateRequest
// )
// export type PushCreateProjectFromTemplate = z.output<
//   typeof PushCreateProjectFromTemplate
// >

export const ProjectCreated = createModelSyncEvent('project.created', 1, [
  'projects',
])
export type ProjectCreated = z.output<typeof ProjectCreated>

export const ProjectUpdated = createModelSyncEvent('project.updated', 1, [
  'projects',
])
export type ProjectUpdated = z.output<typeof ProjectUpdated>

export const ProjectDeleted = createModelSyncEvent('project.hard-deleted', 1, [
  'projects',
])
export type ProjectDeleted = z.output<typeof ProjectDeleted>
