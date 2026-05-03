import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: createKey('tasks'),
  list: () => createKey(queryKeys.root, 'list'),
  byId: (id: string) => createKey(queryKeys.root, 'detail', id),
  byWorkspaceId: (id: string) => createKey(queryKeys.root, 'workspace', id),
  byProjectId: (workspaceId: string, projectId: string) =>
    createKey(queryKeys.root, 'workspace', workspaceId, 'project', projectId),
}
