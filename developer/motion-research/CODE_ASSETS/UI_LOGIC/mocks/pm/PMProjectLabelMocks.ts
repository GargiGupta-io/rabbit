import { type PMProjectLabelType } from '@motion/rpc-types/legacy'

import { CalendarLabelMock, ProjectLabelMock } from './LabelMocks'

export const PMUncompletedProjectCalendarLabelMock: PMProjectLabelType = {
  id: '5e9f8f8f-f8f8-4f8f-8f8f-uncompleted-calendar',
  labelId: CalendarLabelMock.id,
  projectId: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8f8f8f',
}

export const PMUncompletedProjectProjectLabelMock: PMProjectLabelType = {
  id: '5e9f8f8f-f8f8-4f8f-8f8f-uncompleted-project',
  labelId: ProjectLabelMock.id,
  projectId: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8f8f8f',
}
