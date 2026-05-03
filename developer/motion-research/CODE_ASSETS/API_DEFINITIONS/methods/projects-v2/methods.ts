import { defineApi, defineMutation } from '@motion/rpc'
import { type ProjectSchema } from '@motion/rpc-types'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

type GetById = RouteTypes<'ProjectsController_getProject'>
export const getById = defineApi<
  GetById['request'],
  GetById['response']
>().using({
  key: (args) => queryKeys.byId(args.projectId),
  uri: (args) => `v2/projects/${args.projectId}`,
})

export const getLazyById = defineApi<
  GetById['request'],
  GetById['response']
>().using({
  key: (args) => ['lazy', ...queryKeys.byId(args.projectId)],
  uri: getById.uri,
  queryOptions: {
    staleTime: 0,
    gcTime: 0,
  },
})

type Create = RouteTypes<'ProjectsController_createProject'>
export const create = defineMutation<
  Create['request'],
  Create['response']
>().using({
  uri: '/v2/projects',
  method: 'POST',
  body: (args) => args,
})

type ApplyDefinitionToProject =
  RouteTypes<'ProjectsController_applyDefinitionToProject'>
export const applyDefinitionToProject = defineMutation<
  ApplyDefinitionToProject['request'],
  ApplyDefinitionToProject['response']
>().using({
  uri: (args) =>
    `/v2/projects/${args.projectId}/definition/${args.projectDefinitionId}`,
  method: 'PATCH',
  body: ({ projectId, projectDefinitionId, ...args }) => args,
})

type Update = RouteTypes<'ProjectsController_updateProject'>
export const update = defineMutation<
  Update['request'],
  Update['response']
>().using({
  uri: (args) => `/v2/projects/${args.projectId}`,
  method: 'PATCH',
  body: ({ projectId, ...args }) => args,
})

type Delete = RouteTypes<'ProjectsController_deleteProject'>
export const deleteProject = defineMutation<Delete['request'], void>().using({
  uri: (args) => `/v2/projects/${args.projectId}`,
  method: 'DELETE',
  invalidate: (args) => [queryKeys.byId(args.projectId)],
})

type Resolve = RouteTypes<'ProjectsController_resolve'>
export const resolve = defineMutation<
  Resolve['request'] & { statusId: string }, // statusId is used for optimistic update
  Resolve['response']
>().using({
  uri: (args) => `/v2/projects/${args.projectId}/resolve`,
  method: 'POST',
  body: ({ projectId, statusId, ...args }) => args,
})

type UpdateProjectStage = RouteTypes<'ProjectsController_updateProjectStage'>
export const updateProjectStage = defineMutation<
  Pick<
    UpdateProjectStage['request'],
    'projectId' | 'stageDefinitionId' | 'name' | 'color'
  >,
  UpdateProjectStage['response']
>().using({
  uri: (args) =>
    `/v2/projects/${args.projectId}/stages/${args.stageDefinitionId}`,
  method: 'PATCH',
  body: ({ projectId, stageDefinitionId, ...args }) => args,
  invalidate: (args) => [queryKeys.byId(args.projectId)],
})

type UpdateProjectStageDueDate =
  RouteTypes<'ProjectsController_updateProjectStage'>
export const updateProjectStageDueDate = defineMutation<
  Pick<
    UpdateProjectStage['request'],
    'projectId' | 'stageDefinitionId' | 'dateAdjustmentStrategy'
  > &
    Required<Pick<UpdateProjectStage['request'], 'dueDate'>>,
  UpdateProjectStageDueDate['response']
>().using({
  uri: (args) =>
    `/v2/projects/${args.projectId}/stages/${args.stageDefinitionId}`,
  method: 'PATCH',
  body: ({ projectId, stageDefinitionId, ...args }) => args,
  invalidate: (args) => [queryKeys.byId(args.projectId)],
})

type ShiftProjectDates = RouteTypes<'ProjectsController_shiftProject'>
export const shiftProjectDates = defineMutation<
  ShiftProjectDates['request'],
  ShiftProjectDates['response']
>().using({
  uri: (args) => `/v2/projects/${args.projectId}/shift`,
  method: 'POST',
  body: ({ projectId, ...args }) => args,
  invalidate: (args) => [queryKeys.byId(args.projectId)],
})

type SetProjectToStage = RouteTypes<'ProjectsController_setProjectToStage'>
export const setProjectToStage = defineMutation<
  SetProjectToStage['request'],
  SetProjectToStage['response']
>().using({
  uri: (args) =>
    `/v2/projects/${args.projectId}/active-stage/${args.stageDefinitionId}`,
  method: 'PATCH',
  body: ({ projectId, stageDefinitionId, ...args }) => args,
  invalidate: (args) => [queryKeys.byId(args.projectId)],
})

type AdvanceProjectStageCallArgs = {
  project: ProjectSchema
  nextStageDefinitionId: string
  strategy: AdvanceProjectStage['request']['strategy']
}

type AdvanceProjectStage = RouteTypes<'ProjectsController_advanceProjectStage'>
export const advanceProjectStage = defineMutation<
  AdvanceProjectStageCallArgs,
  AdvanceProjectStage['response']
>().using({
  uri: (args) => `/v2/projects/${args.project.id}/advance-stage`,
  method: 'PATCH',
  body: ({ project, nextStageDefinitionId, ...args }) => args,
  invalidate: (args) => [queryKeys.byId(args.project.id)],
})

type CreateFromTask = RouteTypes<'ProjectsController_createProjectFromTask'>
export const createFromTask = defineMutation<
  CreateFromTask['request'],
  CreateFromTask['response']
>().using({
  uri: '/v2/projects/from-task',
  method: 'POST',
  body: (args) => args,
})

type CompleteProjectStage =
  RouteTypes<'ProjectsController_completeProjectStage'>
export const completeProjectStage = defineMutation<
  CompleteProjectStage['request'],
  CompleteProjectStage['response']
>().using({
  uri: (args) =>
    `/v2/projects/${args.projectId}/stages/${args.stageDefinitionId}/complete`,
  method: 'POST',
  body: ({ projectId, stageDefinitionId, ...args }) => args,
  invalidate: (args) => [queryKeys.byId(args.projectId)],
})

type CancelProjectStage = RouteTypes<'ProjectsController_cancelProjectStage'>
export const cancelProjectStage = defineMutation<
  CancelProjectStage['request'],
  CancelProjectStage['response']
>().using({
  uri: (args) =>
    `/v2/projects/${args.projectId}/stages/${args.stageDefinitionId}/cancel`,
  method: 'POST',
  body: ({ projectId, stageDefinitionId, ...args }) => args,
  invalidate: (args) => [queryKeys.byId(args.projectId)],
})

type AddProjectStage = RouteTypes<'ProjectsController_addProjectStage'>
export const addProjectStage = defineMutation<
  AddProjectStage['request'],
  AddProjectStage['response']
>().using({
  uri: (args) => `/v2/projects/${args.projectId}/stages/add`,
  method: 'POST',
  body: ({ projectId, ...args }) => args,
})

type RemoveProjectStage = RouteTypes<'ProjectsController_removeProjectStage'>
export const removeProjectStage = defineMutation<
  RemoveProjectStage['request'],
  RemoveProjectStage['response']
>().using({
  uri: (args) => `/v2/projects/${args.projectId}/stages/remove`,
  method: 'POST',
  body: ({ projectId, ...args }) => args,
})

type BulkUpdateProjects = RouteTypes<'ProjectsController_bulkUpdateProjects'>
export const bulkUpdateProjects = defineMutation<
  BulkUpdateProjects['request'],
  BulkUpdateProjects['response']
>().using({
  uri: '/v2/projects/bulk-update',
  method: 'POST',
  body: (args) => args,
})

type BulkUpdateProjectStagesDueDate =
  RouteTypes<'ProjectsController_bulkUpdateProjectStagesDueDate'>
export const bulkUpdateProjectStagesDueDate = defineMutation<
  BulkUpdateProjectStagesDueDate['request'] & { projectId: string },
  BulkUpdateProjectStagesDueDate['response']
>().using({
  uri: (args) => `/v2/projects/${args.projectId}/stages`,
  method: 'PATCH',
  body: ({ projectId, ...args }) => args,
  invalidate: (args) => [queryKeys.byId(args.projectId)],
})

type QueryByIds = RouteTypes<'ProjectsController_queryProjects'>
export const queryByIds = defineApi<
  QueryByIds['request'],
  QueryByIds['response']
>().using({
  key: (args) => queryKeys.queryByIds(args.filter.ids ?? []),
  method: 'POST',
  uri: (args) => `v2/projects/query`,
})
