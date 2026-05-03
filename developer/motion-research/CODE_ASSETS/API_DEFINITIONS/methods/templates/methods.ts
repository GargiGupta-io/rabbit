import { createKey, defineApi, defineMutation } from '@motion/rpc'
import {
  type TemplateProjectType,
  type TemplateTaskType,
} from '@motion/rpc-types/legacy'

import { type RouteTypes } from '../types'
import { queryKeys as workspaceV2QueryKeys } from '../workspaces-v2'

const queryKeys = {
  root: createKey('templates'),
  byWorkspaceId: (id: string) => createKey(queryKeys.root, 'workspaces', id),
  byId: (args: { workspaceId: string; templateId: string }) =>
    createKey(
      queryKeys.byWorkspaceId(args.workspaceId),
      'templates',
      args.templateId
    ),
}

type GetAll = RouteTypes<'TemplatesController_getAll[0]'>

type getAllResponse = {
  templateProjects: TemplateProjectType[]
  templateTasks: TemplateTaskType[]
}
export const getTemplatesByWorkspaceId = defineApi<
  GetAll['request'],
  getAllResponse
>().using({
  key: (args) => queryKeys.byWorkspaceId(args.workspaceId),
  uri: (args) => `/workspaces/${args.workspaceId}/templates`,
})

type CreateTemplateTask =
  RouteTypes<'TemplatesController_createTemplateTask[0]'>
export const createTemplateTask = defineMutation<
  CreateTemplateTask['request'],
  CreateTemplateTask['response'] & { id: string }
>().using({
  key: (args) => queryKeys.byWorkspaceId(args.workspaceId),
  method: 'POST',
  uri: '/templates/tasks',
  body: (args) => args,
  invalidate: (args) => queryKeys.byWorkspaceId(args.workspaceId),
})

type UpdateTemplateTask =
  RouteTypes<'TemplatesController_updateTemplateTask[0]'>
export const updateTemplateTask = defineMutation<
  Omit<UpdateTemplateTask['request'], 'templateId'>,
  UpdateTemplateTask['response'] & { id: string }
>().using({
  key: (args) =>
    queryKeys.byId({ workspaceId: args.workspaceId, templateId: args.id }),
  uri: (args) => `/templates/tasks/${args.id}`,
  method: 'PATCH',
  body: (args) => args,
  invalidate: (args) => queryKeys.byWorkspaceId(args.workspaceId),
})

// type DeleteTemplateTask = RouteTypes<'TemplatesController_deleteTemplateTask'>
export const deleteTemplateTask = defineMutation<
  /* DeleteTemplateTask['request'] & */ {
    workspaceId: string
    id: string
  },
  void
>().using({
  key: (args) =>
    queryKeys.byId({ workspaceId: args.workspaceId, templateId: args.id }),
  uri: (args) => `/templates/tasks/${args.id}`,
  method: 'DELETE',
  invalidate: (args) => queryKeys.byWorkspaceId(args.workspaceId),
})

type CreateTemplateProject =
  RouteTypes<'TemplatesController_createTemplateProject[0]'>
export const createTemplateProject = defineMutation<
  CreateTemplateProject['request'],
  CreateTemplateProject['response'] & { id: string }
>().using({
  key: (args) => queryKeys.byWorkspaceId(args.workspaceId),
  method: 'POST',
  uri: '/templates/projects',
  body: (args) => args,
  invalidate: (args) => [
    queryKeys.byWorkspaceId(args.workspaceId),
    workspaceV2QueryKeys.root,
  ],
})

type UpdateTemplateProject =
  RouteTypes<'TemplatesController_updateTemplateProject[0]'>
export const updateTemplateProject = defineMutation<
  UpdateTemplateProject['request'],
  UpdateTemplateProject['response'] & { id: string }
>().using({
  key: (args) =>
    queryKeys.byId({ workspaceId: args.workspaceId, templateId: args.id }),
  uri: (args) => `/templates/projects/${args.id}`,
  method: 'PATCH',
  body: (args) => args,
  invalidate: (args) => [
    queryKeys.byWorkspaceId(args.workspaceId),
    workspaceV2QueryKeys.root,
  ],
})

type DeleteTemplateProjectArgs = {
  workspaceId: string
  id: string
}
export const deleteTemplateProject = defineMutation<
  DeleteTemplateProjectArgs,
  void
>().using({
  key: (args) =>
    queryKeys.byId({ workspaceId: args.workspaceId, templateId: args.id }),
  uri: (args) => `/templates/projects/${args.id}`,
  method: 'DELETE',
  invalidate: (args) => [
    queryKeys.byWorkspaceId(args.workspaceId),
    workspaceV2QueryKeys.root,
  ],
})

type CreateTemplateProjectTask =
  RouteTypes<'TemplatesController_createTemplateProjectTask[0]'>
export const createTemplateProjectTask = defineMutation<
  /* CreateTemplateProjectTask['request'] & */ {
    templateProjectId: string
    workspaceId: string
  },
  CreateTemplateProjectTask['response'] & { id: string }
>().using({
  key: (args) => queryKeys.byWorkspaceId(args.workspaceId),
  method: 'POST',
  uri: (args) => `/templates/projects/${args.templateProjectId}/tasks`,
  body: ({ templateProjectId, ...args }) => args,
  invalidate: (args) => [
    queryKeys.byWorkspaceId(args.workspaceId),
    workspaceV2QueryKeys.root,
  ],
})

type UpdateTemplateProjectTask =
  RouteTypes<'TemplatesController_updateTemplateProjectTask[0]'>
export const updateTemplateProjectTask = defineMutation<
  /* UpdateTemplateProjectTask['request'] & */ {
    templateProjectId: string
    workspaceId: string
    task: { id: string; workspaceId: string }
  },
  UpdateTemplateProjectTask['response'] & { id: string }
>().using({
  key: (args) => queryKeys.byWorkspaceId(args.workspaceId),
  method: 'PATCH',
  uri: (args) =>
    `/templates/projects/${args.templateProjectId}/tasks/${args.task.id}`,
  body: ({ task }) => task,
  invalidate: (args) => [
    queryKeys.byWorkspaceId(args.workspaceId),
    workspaceV2QueryKeys.root,
  ],
})

type DeleteTemplateProjectTask =
  RouteTypes<'TemplatesController_deleteTemplateProjectTask[0]'>
export const deleteTemplateProjectTask = defineMutation<
  DeleteTemplateProjectTask['request'] & {
    workspaceId: string
  },
  void
>().using({
  key: (args) => queryKeys.byWorkspaceId(args.workspaceId),
  method: 'DELETE',
  uri: (args) => `/templates/projects/tasks/${args.taskId}`,
  invalidate: (args) => [
    queryKeys.byWorkspaceId(args.workspaceId),
    workspaceV2QueryKeys.root,
  ],
})
