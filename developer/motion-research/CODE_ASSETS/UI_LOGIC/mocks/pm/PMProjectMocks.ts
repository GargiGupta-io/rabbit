import { PMItemType, type PMProjectType } from '@motion/rpc-types/legacy'

import {
  PMUncompletedProjectCalendarLabelMock,
  PMUncompletedProjectProjectLabelMock,
} from './PMProjectLabelMocks'
import { PMNotStartedTaskStatusMock } from './PMTaskStatusMocks'
import { PMGeneralUserMock1 } from './PMUserMocks'

export const PMGeneralProjectMock: PMProjectType = {
  description: '<div>Project Management Mock</div>',
  dueDate: new Date().toISOString(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8f8f8f',
  itemType: PMItemType.project,
  labels: [
    PMUncompletedProjectCalendarLabelMock,
    PMUncompletedProjectProjectLabelMock,
    PMUncompletedProjectCalendarLabelMock,
    PMUncompletedProjectProjectLabelMock,
  ],
  manager: PMGeneralUserMock1,
  managerId: PMGeneralUserMock1.id,
  name: 'Project Management Mock',
  priorityLevel: 'ASAP',
  sortPosition: '1',
  statusId: PMNotStartedTaskStatusMock.id,
  workspaceId: 'abc',
}
