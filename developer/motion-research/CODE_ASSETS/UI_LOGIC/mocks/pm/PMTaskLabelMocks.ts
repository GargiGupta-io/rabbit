import { type PMTeamTaskLabelType } from '@motion/rpc-types/legacy'

import { CalendarLabelMock, TaskLabelMock } from './LabelMocks'

export const PMUncompletedTaskCalendarLabelMock: PMTeamTaskLabelType = {
  id: '5e9f8f8f-f8f8-4f8f-8f8f-uncompleted-calendar',
  labelId: CalendarLabelMock.id,
  taskId: '5e9f8f8f-f8f8-4f8f-8f8f-uncompleted-task',
}

export const PMUncompletedTaskTaskLabelMock: PMTeamTaskLabelType = {
  id: '5e9f8f8f-f8f8-4f8f-8f8f-uncompleted-task',
  labelId: TaskLabelMock.id,
  taskId: '5e9f8f8f-f8f8-4f8f-8f8f-uncompleted-task',
}
