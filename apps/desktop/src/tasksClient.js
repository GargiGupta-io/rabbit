import {
  KEEP_PREVIOUS_DATA,
  createMotionKey,
  defineMutation,
  defineQuery
} from './apiClient.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const TWO_MINUTES = 2 * 60 * 1000;

export const queryKeys = {
  query: createMotionKey('v2/tasks', 'query'),
  byIdRoot: createMotionKey('v2/tasks', 'by-id'),
  taskById: (id) => createMotionKey('v2/tasks', 'by-id', id),
  pastDue: () => createMotionKey('v2/tasks', 'past-due'),
  taskFeedById: (id) => createMotionKey('v2/tasks', 'feed', id),
  lazyByIdRoot: createMotionKey('lazy', 'v2/tasks', 'by-id')
};

export const queryTasks = defineQuery({
  method: 'POST',
  uri: 'v2/tasks/query',
  body: (args = {}) => args,
  key: (args = {}) => [...queryKeys.query, args],
  queryOptions: {
    placeholderData: KEEP_PREVIOUS_DATA
  }
});

export const getTaskById = defineQuery({
  uri: (args = {}) => {
    const include = Array.isArray(args.include) ? args.include.filter(Boolean) : [];
    const params = include.length ? `?include=${include.join(',')}` : '';
    return `v2/tasks/${args.id || ''}${params}`;
  },
  key: (args = {}) => queryKeys.taskById(args.id),
  queryOptions: {
    staleTime: TWO_MINUTES,
    placeholderData: KEEP_PREVIOUS_DATA
  }
});

export const getLazyTaskById = defineQuery({
  uri: getTaskById.uri,
  key: (args = {}) => [...queryKeys.lazyByIdRoot, args.id],
  queryOptions: {
    staleTime: 0,
    gcTime: 0
  }
});

export const getPastDueTasks = defineQuery({
  uri: (args = {}) => {
    const include = Array.isArray(args.include) ? args.include.filter(Boolean) : [];
    const params = include.length ? `?include=${include.join(',')}` : '';
    return `v2/tasks/past_due${params}`;
  },
  key: () => queryKeys.pastDue(),
  queryOptions: {
    gcTime: FIFTEEN_MINUTES,
    staleTime: FIFTEEN_MINUTES
  }
});

export const createTask = defineMutation({
  method: 'POST',
  uri: '/v2/tasks',
  body: (args = {}) => args
});

export const deleteTask = defineMutation({
  method: 'DELETE',
  uri: (args = {}) => `/v2/tasks/${args.id || ''}`
});

export const updateTask = defineMutation({
  method: 'PATCH',
  uri: (args = {}) => `/v2/tasks/${args.id || ''}`,
  body: ({ id, ...args } = {}) => args
});

export const stopTask = defineMutation({
  method: 'POST',
  uri: (args = {}) => `/v2/tasks/${args.id || ''}/stop`,
  body: ({ id, ...args } = {}) => args
});

export const startTask = defineMutation({
  method: 'POST',
  uri: (args = {}) => `/v2/tasks/${args.id || ''}/start`,
  body: ({ id, ...args } = {}) => args
});

export const completeTask = defineMutation({
  method: 'PATCH',
  uri: (args = {}) => `/v2/tasks/${args.id || ''}/complete`,
  body: (args = {}) => args
});

export const bulkUpdateTasks = defineMutation({
  method: 'POST',
  uri: '/v2/tasks/bulk-update',
  body: (args = {}) => args
});
