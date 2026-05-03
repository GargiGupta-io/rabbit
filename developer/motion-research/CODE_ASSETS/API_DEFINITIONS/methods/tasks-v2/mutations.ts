import { defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

type CreateTask = RouteTypes<'TasksController_createTask'>
export const createTask = defineMutation<
  CreateTask['request'],
  CreateTask['response']
>().using({
  method: 'POST',
  uri: '/v2/tasks',
  body: (args) => args,
})

type DeleteTask = RouteTypes<'TasksController_deleteTask'>
export const deleteTask = defineMutation<
  DeleteTask['request'],
  void // DeleteTask['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/tasks/${args.id}`,
})

type UpdateTask = RouteTypes<'TasksController_updateTask'>
export const updateTask = defineMutation<
  UpdateTask['request'],
  UpdateTask['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/tasks/${args.id}`,
  body: ({ id, ...args }) => args,
})

type StopTask = RouteTypes<'TasksController_stopTask'>
export const stopTask = defineMutation<
  StopTask['request'],
  StopTask['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/tasks/${args.id}/stop`,
  body: ({ id, ...args }) => args,
})

type StartTask = RouteTypes<'TasksController_startTask'>
export const startTask = defineMutation<
  StartTask['request'],
  StartTask['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/tasks/${args.id}/start`,
  body: ({ id, ...args }) => args,
})

type CompleteTask = RouteTypes<'TasksController_completeTask'>
export const completeTask = defineMutation<
  CompleteTask['request'],
  CompleteTask['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/tasks/${args.id}/complete`,
  body: (args) => args,
})

type BulkUpdateTasks = RouteTypes<'TasksController_bulkUpdateTasks'>
export const bulkUpdateTasks = defineMutation<
  BulkUpdateTasks['request'],
  void
>().using({
  method: 'POST',
  uri: '/v2/tasks/bulk-update',
  body: (args) => args,
})
