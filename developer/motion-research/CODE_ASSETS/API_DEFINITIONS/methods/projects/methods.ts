import { defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'
import { queryKeys as v2WorkspaceKeys } from '../workspaces-v2'

type CreateFromTemplate =
  RouteTypes<'TemplatesController_createProjectFromTemplate[0]'>
export const createFromTemplate = defineMutation<
  CreateFromTemplate['request'] & { templateId: string },
  CreateFromTemplate['response']
>().using({
  uri: (args) => `/templates/projects/${args.templateId}`,
  method: 'POST',
  body: ({ templateId, ...args }) => args,
  invalidate: () => [v2WorkspaceKeys.root],
})
