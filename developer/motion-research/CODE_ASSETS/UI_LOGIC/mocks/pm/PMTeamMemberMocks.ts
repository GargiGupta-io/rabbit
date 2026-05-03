import { type PMWorkspaceMemberType } from '@motion/rpc-types/legacy'

import { PMGeneralUserMock1, PMGeneralUserMock2 } from './PMUserMocks'

const USER_COLORS = [
  '#0B9C82',
  '#CF4519',
  '#CD1583',
  '#7957FD',
  '#1EA2CC',
  '#6A943F',
  '#3369BB',
  '#8F33BB',
  '#8C2828',
  '#AB7A30',
]

export const PMGeneralTeamMemberMock1: PMWorkspaceMemberType = {
  color: USER_COLORS[0],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8f8f8f',
  isWorkspaceAdmin: true,
  sortPosition: '00001',
  user: { ...PMGeneralUserMock1 },
  userId: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8f8f8m',
  workspaceId: 'abc',
}

export const PMGeneralTeamMemberMock2: PMWorkspaceMemberType = {
  color: USER_COLORS[1],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8f8f8z',
  isWorkspaceAdmin: true,
  sortPosition: '00009',
  user: { ...PMGeneralUserMock2 },
  userId: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8f8f8x',
  workspaceId: 'abc',
}
