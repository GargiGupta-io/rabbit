import { type PMTaskStatusType } from '@motion/rpc-types/legacy'
import { AutoScheduleSetting, StatusType } from '@motion/shared/common'

import { statusColorOptions } from '../../pm/statuses'

export const PMCompletedTaskStatusMock: PMTaskStatusType = {
  color: statusColorOptions[0],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-completed',
  isResolvedStatus: true,
  type: StatusType.COMPLETED,
  autoScheduleSetting: AutoScheduleSetting.DISABLED,
  name: 'Completed',
  isSystemStatus: true,
  sortPosition: '00001',
  isDefaultStatus: false,
  autoScheduleEnabled: false,
  workspaceId: 'abc',
}

export const PMBlockedTaskStatusMock: PMTaskStatusType = {
  color: statusColorOptions[1],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-blocked',
  name: 'Blocked',
  type: null,
  autoScheduleSetting: AutoScheduleSetting.DISABLED,
  isSystemStatus: false,
  sortPosition: '00005',
  workspaceId: 'abc',
  isResolvedStatus: false,
  autoScheduleEnabled: false,
  isDefaultStatus: false,
}

export const PMInProgressTaskStatusMock: PMTaskStatusType = {
  color: statusColorOptions[2],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-inprogress',
  name: 'In Progress',
  type: null,
  autoScheduleSetting: AutoScheduleSetting.DISABLED,
  isSystemStatus: false,
  sortPosition: '00009',
  workspaceId: 'abc',
  isDefaultStatus: false,
  autoScheduleEnabled: false,
  isResolvedStatus: false,
}

export const PMNotStartedTaskStatusMock: PMTaskStatusType = {
  color: statusColorOptions[3],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-notstarted',
  isDefaultStatus: true,
  name: 'Not Started',
  isSystemStatus: false,
  sortPosition: '0000c',
  workspaceId: 'abc',
  isResolvedStatus: false,
  autoScheduleEnabled: false,
  type: StatusType.DEFAULT,
  autoScheduleSetting: AutoScheduleSetting.DISABLED,
}

export const PMAutoScheduledTaskStatusMock: PMTaskStatusType = {
  color: statusColorOptions[4],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-autoscheduled',
  isDefaultStatus: true,
  name: 'Not Started',
  isSystemStatus: false,
  sortPosition: '0000c',
  workspaceId: 'abc',
  isResolvedStatus: false,
  autoScheduleEnabled: false,
  type: StatusType.DEFAULT,
  autoScheduleSetting: AutoScheduleSetting.ENABLED,
}
