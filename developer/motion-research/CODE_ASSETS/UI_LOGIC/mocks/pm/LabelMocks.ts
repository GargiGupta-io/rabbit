import { type LabelSchema } from '@motion/zod/client'

import { labelColorOptions } from '../../pm/labels'

export const TaskLabelMock: LabelSchema = {
  color: labelColorOptions[0],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-task',
  name: 'Task',
  sortPosition: '00001',
  workspaceId: 'abc',
  deleted: false,
}

export const ProjectLabelMock: LabelSchema = {
  color: labelColorOptions[3],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-project',
  name: 'Project',
  sortPosition: '00006',
  workspaceId: 'abc',
  deleted: false,
}

export const BugLabelMock: LabelSchema = {
  color: labelColorOptions[1],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-bug',
  name: 'Bug',
  sortPosition: '00009',
  workspaceId: 'abc',
  deleted: false,
}

export const CalendarLabelMock: LabelSchema = {
  color: labelColorOptions[2],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-calendar',
  name: 'Calendar',
  sortPosition: '0000u',
  workspaceId: 'abc',
  deleted: false,
}
