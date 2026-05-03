import { cloneDeep } from '@motion/utils/core'

import { createUnassignedUser } from '../data'
import { isUnassignedUser, sortMembers } from '../members'

const CURRENT_USER_ID = 'current-user-id'
const UNASSIGNED_USER_ID = 'unassigned-user-id'

type MemberType = {
  id: string | null
  user: {
    id: string | null
    name: string
  }
}

function createMember({ id, name }: { id: string; name: string }) {
  const member = {
    id,
    user: {
      id,
      name,
    },
  } satisfies MemberType

  return member
}

const MEMBERS: MemberType[] = [
  createMember({ id: '1', name: 'a' }),
  createMember({ id: '2', name: 'b' }),
  createMember({ id: '3', name: 'c' }),
  createMember({ id: '4', name: 'd' }),
]

const CURRENT_MEMBER = createMember({
  id: CURRENT_USER_ID,
  name: 'current user',
})

const UNASSIGNED_MEMBER = createMember({
  id: UNASSIGNED_USER_ID,
  name: 'unassigned',
})

function randomizeList<T>(list: T[]) {
  return list.sort(() => Math.random() - 0.5)
}

describe('isUnassignedUser', () => {
  it('return false when the user is not unassigned', () => {
    expect(isUnassignedUser({ userId: '123' })).toBe(false)
  })

  it('return true when the user is unassigned', () => {
    expect(isUnassignedUser({ userId: createUnassignedUser().id })).toBe(true)
  })
})

describe('sort workspace members', () => {
  it('Handles undefined member array', () => {
    const sortedMembers = sortMembers({
      members: undefined,
      currentUserId: CURRENT_USER_ID,
    })

    expect(sortedMembers).toEqual([])
  })

  it('Handles a null unassigned user ID', () => {
    const members = cloneDeep(MEMBERS)
    members.push({
      id: null,
      user: {
        id: null,
        name: 'unassigned',
      },
    })

    const sortedMembers = sortMembers({
      members: randomizeList(members),
      currentUserId: CURRENT_USER_ID,
      unassignedUserId: null,
    })

    expect(sortedMembers[0].id).toBe(null)
    expect(sortedMembers.slice(1).map((m) => m.user.name)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ])
  })

  it('Places members alphabetically after the current user', () => {
    const members = cloneDeep(MEMBERS)
    members.push(CURRENT_MEMBER)

    const sortedMembers = sortMembers({
      members: randomizeList(members),
      currentUserId: CURRENT_USER_ID,
    })

    expect(sortedMembers[0].id).toBe(CURRENT_USER_ID)

    const restMembers = sortedMembers.slice(1)

    expect(restMembers.map((m) => m.user.name)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('Places unassigned first when given with no current user in list', () => {
    const members = cloneDeep(MEMBERS)
    members.push(UNASSIGNED_MEMBER)

    const sortedMembers = sortMembers({
      members: randomizeList(members),
      currentUserId: CURRENT_USER_ID,
      unassignedUserId: UNASSIGNED_USER_ID,
    })

    expect(sortedMembers[0].id).toBe(UNASSIGNED_USER_ID)

    const restMembers = sortedMembers.slice(1)

    expect(restMembers.map((m) => m.user.name)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('Ensures Unassigned, Current User, and the rest are sorted alphabetically', () => {
    const members = cloneDeep(MEMBERS)
    members.push(CURRENT_MEMBER)
    members.push(UNASSIGNED_MEMBER)

    const sortedMembers = sortMembers({
      members: randomizeList(members),
      currentUserId: CURRENT_USER_ID,
      unassignedUserId: UNASSIGNED_USER_ID,
    })

    expect(sortedMembers[1].id).toBe(UNASSIGNED_USER_ID)
    expect(sortedMembers[0].id).toBe(CURRENT_USER_ID)

    const restMembers = sortedMembers.slice(2)

    expect(restMembers.map((m) => m.user.name)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('Handles not finding current user ID', () => {
    const members = cloneDeep(MEMBERS)
    const sortedMembers = sortMembers({
      members: randomizeList(members),
      currentUserId: CURRENT_USER_ID,
    })

    expect(sortedMembers.map((m) => m.user.name)).toEqual(['a', 'b', 'c', 'd'])
  })
})
