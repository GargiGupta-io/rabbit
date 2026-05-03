import { PMUncompletedTaskMock } from './PMTaskMocks'

const workspaceId = 'My Tasks'

export const DefaultTemplateTaskMock = {
  id: '5e9f8f8f-f8f8-4f8f-8f8f-67f8f8f8-template1',
  name: 'Mock Template Task 1',
  task: PMUncompletedTaskMock,
  workspaceId,
}

export const DefaultTemplateTaskMock2 = {
  id: '5e9f8f8f-f8f8-4f8f-8f8f-67f8f8f8-template2',
  name: 'Mock Template Task 2',
  task: PMUncompletedTaskMock,
  workspaceId,
}

export const TemplateTaskEntityAdapterMock = {
  [workspaceId]: {
    data: {
      templateProjects: {},
      templateTasks: {
        [DefaultTemplateTaskMock.id]: DefaultTemplateTaskMock,
        [DefaultTemplateTaskMock2.id]: DefaultTemplateTaskMock2,
      },
    },
    isFetched: true,
    status: 'success',
  },
}
