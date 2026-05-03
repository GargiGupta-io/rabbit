import { createQueryKey, defineMutation, defineQuery } from './apiClient.js';

function ensureViewDefaults(definition = {}) {
  const type = definition.type;
  const skipDefaultColumns = type === 'team-schedule' || type === 'dashboard' || type === 'workload';

  if (!skipDefaultColumns && Array.isArray(definition.columns)) {
    definition.columns.forEach((column) => {
      if (column.visible == null) {
        column.visible = true;
      }
    });
  }

  const taskFilters = definition.filters?.tasks?.filters;
  if (taskFilters && taskFilters.completed == null) {
    taskFilters.completed = 'include';
  }

  const projectFilters = definition.filters?.projects?.filters;
  if (projectFilters && projectFilters.completed == null) {
    projectFilters.completed = 'include';
  }
}

export function normalizeViewsResponse(data = {}) {
  const ids = Array.isArray(data.ids) ? data.ids : [];
  const views = data.models?.views || {};

  ids.forEach((id) => {
    const definition = views[id]?.definition;
    if (definition) {
      ensureViewDefaults(definition);
    }
  });

  return data;
}

export const queryKeys = {
  root: createQueryKey('v3', 'views')
};

export const getViews = defineQuery({
  method: 'GET',
  uri: '/v3/views',
  key: () => queryKeys.root,
  transform: (data) => normalizeViewsResponse(data)
});

export const createView = defineMutation({
  method: 'POST',
  uri: '/v3/views',
  body: (args = {}) => ({
    data: args.data
      ? Object.fromEntries(
          Object.entries(args.data).filter(([key]) => key !== 'id')
        )
      : {}
  })
});

export const updateView = defineMutation({
  method: 'PATCH',
  uri: (args = {}) => `/v3/views/${args.viewId || ''}`,
  body: (args = {}) => args
});

export const deleteView = defineMutation({
  method: 'DELETE',
  uri: (args = {}) => `/v3/views/${args.viewId || ''}`
});
