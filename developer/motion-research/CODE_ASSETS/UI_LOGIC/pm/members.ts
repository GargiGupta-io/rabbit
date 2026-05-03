import {
  type UserInfoSchema,
  type WorkspaceMemberSchema,
} from '@motion/rpc-types'
import {
  byProperty,
  byValue,
  cascade,
  Compare,
  ordered,
} from '@motion/utils/array'

import { createUnassignedUser } from './data'

export type WorkspaceMemberWithUser = WorkspaceMemberSchema & {
  user: UserInfoSchema
} & { workspaceId: string }

export type DefaultAssigneeDropdownOption = Pick<
  WorkspaceMemberWithUser,
  'id' | 'user' | 'userId'
> & { type: 'default' }

type MemberType<T> = T & {
  user: {
    id: string | null
    name: string
  }
}

const unassignedUser = createUnassignedUser()
export const unassignedMember: WorkspaceMemberWithUser = {
  id: 'no_member_id_unassigned',
  workspaceId: '',
  userId: unassignedUser.id,
  status: 'ACTIVE',
  role: 'MEMBER',
  user: unassignedUser,
}

export const isUnassignedUser = (
  user: Pick<WorkspaceMemberWithUser, 'userId'>
) => user.userId === unassignedMember.userId

export const isUserNotOnboarded = (user: UserInfoSchema) =>
  !user.onboardingComplete

/**
 * Sort members by their status (unassigned, current user, the rest alphabetically)
 * @param members  The members to sort
 * @param currentUserId The current user's ID
 * @param unassignedMember The unassigned member (if not included, will not be added)
 */
export function sortMembers<T>({
  members = [],
  currentUserId,
  unassignedUserId,
}: {
  members?: MemberType<T>[]
  currentUserId?: string
  unassignedUserId?: string | null
}) {
  // Handle read only members array (e.g. from a selector)
  return [...members].sort(
    byValue((m) => m.user, userComparator({ currentUserId, unassignedUserId }))
  )
}

type SortUsersOptions = {
  unassignedUserId?: string | null
  currentUserId?: string
}

export function userComparator<
  T extends { id: string | null; name: string; guest?: boolean },
>(opts: SortUsersOptions = {}) {
  const { unassignedUserId = null, currentUserId = null } = opts

  return cascade<T>(
    byValue(
      (item) => item.id,
      ordered(['@me', currentUserId, unassignedUserId])
    ),
    byProperty('guest', Compare.exists.desc),
    byProperty('name', Compare.caseInsensitive)
  )
}
