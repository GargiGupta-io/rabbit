import { API } from '@motion/rpc-definitions'

import { DateTime, Settings } from 'luxon'

import { createNoneProject } from '../../../none-entities'
import { createContext, createDataFilters } from '../../__tests__/utils'
import { createQuery } from '../create-query'

const TEST_CTX = createContext({
  workspaces: [{ id: 'w1' }, { id: 'w2' }],
  projects: [
    { id: 'p1', workspaceId: 'w1', statusId: 's1', priorityLevel: 'MEDIUM' },
    { id: 'p2', workspaceId: 'w2', statusId: 's2', priorityLevel: 'MEDIUM' },
    createNoneProject('w3'),
  ],
  statuses: [
    { id: 's1', workspaceId: 'w1' },
    { id: 's2', workspaceId: 'w2' },
  ],
  labels: [{ id: 'l1' }],
  users: [{ id: 'u1' }],
})

const START_DATE = DateTime.fromISO('2024-04-22T12:18:20.893-05:00', {
  setZone: true,
})

describe('create-query', () => {
  beforeEach(() => {
    Settings.defaultZone = 'America/Winnipeg'
    vi.useFakeTimers({ now: START_DATE.valueOf() })
  })

  describe('task filters', () => {
    it('should add workspaces when empty', () => {
      const state = createDataFilters({})
      const actual = createQuery(TEST_CTX, state)

      expect(actual).toEqual({
        $version: 2,
        filters: [
          {
            workspaceIds: ['w1', 'w2'],
            completed: 'exclude',
            canceled: 'exclude',
            archived: 'exclude',
            recurring: 'CURRENT',
            type: ['NORMAL', 'RECURRING_INSTANCE'],
          },
        ],
        include: API.tasksV2.taskAllIncludes,
      })
    })

    it('should group similar workspaces', () => {
      const state = createDataFilters(
        {
          statusIds: { operator: 'in', value: ['s1'] },
        },
        { ids: { operator: 'in', value: ['p1'] } }
      )
      const actual = createQuery(TEST_CTX, state)
      assertDefined(actual)

      expect(actual.filters).toEqual([
        {
          projectIds: {
            operator: 'in',
            value: ['p1'],
          },
          workspaceIds: ['w1', 'w2'],
          statusIds: { operator: 'in', value: ['s1'] },
          completed: 'include',
          canceled: 'include',
          archived: 'exclude',
          recurring: 'CURRENT',
          type: ['NORMAL', 'RECURRING_INSTANCE'],
        },
      ])
    })

    it('should filter by non-workspace fields', () => {
      const state = createDataFilters({
        assigneeUserIds: { operator: 'in', value: ['u1'] },
      })

      const actual = createQuery(TEST_CTX, state)
      assertDefined(actual)

      expect(actual.filters).toEqual([
        {
          workspaceIds: ['w1', 'w2'],
          assigneeUserIds: { operator: 'in', value: ['u1'] },
          completed: 'exclude',
          canceled: 'exclude',
          archived: 'exclude',
          recurring: 'CURRENT',
          type: ['NORMAL', 'RECURRING_INSTANCE'],
        },
      ])
    })

    it('should add overrides', () => {
      const state = createDataFilters(
        {
          priorities: { operator: 'in', value: ['ASAP'] },
        },
        undefined,
        { ids: { operator: 'in', value: ['w1'] } }
      )

      const actual = createQuery(TEST_CTX, state, {
        assigneeUserIds: { operator: 'in', value: ['u1'] },
      })
      assertDefined(actual)

      expect(actual.filters).toEqual([
        {
          projectIds: {
            operator: 'in',
            value: ['p1'],
          },
          workspaceIds: ['w1'],
          priorities: { operator: 'in', value: ['ASAP'] },
          assigneeUserIds: { operator: 'in', value: ['u1'] },
          completed: 'exclude',
          canceled: 'exclude',
          archived: 'exclude',
          recurring: 'CURRENT',
          type: ['NORMAL', 'RECURRING_INSTANCE'],
        },
      ])
    })

    it('should treat empty arrays as null', () => {
      const state = createDataFilters(
        {
          statusIds: { operator: 'in', value: [] },
          labelIds: { operator: 'in', value: [] },
        },
        { ids: { operator: 'in', value: ['p1'] } }
      )
      const actual = createQuery(TEST_CTX, state)

      expect(actual).toEqual({
        $version: 2,
        filters: [
          {
            workspaceIds: ['w1', 'w2'],
            projectIds: { operator: 'in', value: ['p1'] },
            archived: 'exclude',
            completed: 'include',
            canceled: 'include',
            recurring: 'CURRENT',
            type: ['NORMAL', 'RECURRING_INSTANCE'],
          },
        ],
        include: API.tasksV2.taskAllIncludes,
      })
    })

    describe('custom fields', () => {
      it('should use number field', () => {
        const state = createDataFilters({
          number: {
            Foo: {
              '123': {
                operator: 'gt',
                value: 4,
              },
            },
          },
        })
        const actual = createQuery(TEST_CTX, state)

        expect(actual).toEqual({
          $version: 2,
          include: API.tasksV2.taskAllIncludes,
          filters: [
            {
              archived: 'exclude',
              canceled: 'exclude',
              completed: 'exclude',
              workspaceIds: ['w1', 'w2'],
              recurring: 'CURRENT',
              type: ['NORMAL', 'RECURRING_INSTANCE'],
              customFields: [
                {
                  '123': {
                    operator: 'gt',
                    value: 4,
                  },
                },
              ],
            },
          ],
        })
      })

      it('should use text field', () => {
        const state = createDataFilters({
          text: {
            Foo: {
              '123': {
                operator: 'contains',
                value: 'bar',
              },
            },
          },
        })
        const actual = createQuery(TEST_CTX, state)

        expect(actual).toEqual({
          $version: 2,
          include: API.tasksV2.taskAllIncludes,
          filters: [
            {
              archived: 'exclude',
              completed: 'exclude',
              canceled: 'exclude',
              workspaceIds: ['w1', 'w2'],
              recurring: 'CURRENT',
              type: ['NORMAL', 'RECURRING_INSTANCE'],
              customFields: [
                {
                  '123': {
                    operator: 'contains',
                    value: 'bar',
                  },
                },
              ],
            },
          ],
        })
      })

      it('should use url field', () => {
        const state = createDataFilters({
          url: {
            Foo: {
              '123': {
                operator: 'contains',
                value: 'bar',
              },
            },
          },
        })
        const actual = createQuery(TEST_CTX, state)

        expect(actual).toEqual({
          $version: 2,
          include: API.tasksV2.taskAllIncludes,
          filters: [
            {
              archived: 'exclude',
              completed: 'exclude',
              canceled: 'exclude',
              workspaceIds: ['w1', 'w2'],
              recurring: 'CURRENT',
              type: ['NORMAL', 'RECURRING_INSTANCE'],
              customFields: [
                {
                  '123': {
                    operator: 'contains',
                    value: 'bar',
                  },
                },
              ],
            },
          ],
        })
      })

      it('should use select field', () => {
        const state = createDataFilters({
          select: {
            Foo: {
              '123': {
                operator: 'in',
                value: ['1234'],
              },
            },
          },
        })
        const actual = createQuery(TEST_CTX, state)

        expect(actual).toEqual({
          $version: 2,
          include: API.tasksV2.taskAllIncludes,
          filters: [
            {
              archived: 'exclude',
              completed: 'exclude',
              canceled: 'exclude',
              workspaceIds: ['w1', 'w2'],
              recurring: 'CURRENT',
              type: ['NORMAL', 'RECURRING_INSTANCE'],
              customFields: [
                {
                  '123': {
                    operator: 'in',
                    value: ['1234'],
                  },
                },
              ],
            },
          ],
        })
      })

      it('should use multiSelect field', () => {
        const state = createDataFilters({
          multiSelect: {
            Foo: {
              '123': {
                operator: 'in',
                value: ['1234', '5678'],
              },
            },
          },
        })
        const actual = createQuery(TEST_CTX, state)

        expect(actual).toEqual({
          $version: 2,
          include: API.tasksV2.taskAllIncludes,
          filters: [
            {
              archived: 'exclude',
              completed: 'exclude',
              canceled: 'exclude',
              workspaceIds: ['w1', 'w2'],
              recurring: 'CURRENT',
              type: ['NORMAL', 'RECURRING_INSTANCE'],
              customFields: [
                {
                  '123': {
                    operator: 'in',
                    value: ['1234', '5678'],
                  },
                },
              ],
            },
          ],
        })
      })

      it('should use person field', () => {
        const state = createDataFilters({
          person: {
            Foo: {
              '123': {
                operator: 'in',
                value: ['1234'],
              },
            },
          },
        })
        const actual = createQuery(TEST_CTX, state)

        expect(actual).toEqual({
          $version: 2,
          include: API.tasksV2.taskAllIncludes,
          filters: [
            {
              archived: 'exclude',
              completed: 'exclude',
              canceled: 'exclude',
              workspaceIds: ['w1', 'w2'],
              recurring: 'CURRENT',
              type: ['NORMAL', 'RECURRING_INSTANCE'],
              customFields: [
                {
                  '123': {
                    operator: 'in',
                    value: ['1234'],
                  },
                },
              ],
            },
          ],
        })
      })

      it('should use multiPerson  field', () => {
        const state = createDataFilters({
          multiPerson: {
            Foo: {
              '123': {
                operator: 'in',
                value: ['1234', '5678'],
              },
            },
          },
        })
        const actual = createQuery(TEST_CTX, state)

        expect(actual).toEqual({
          $version: 2,
          include: API.tasksV2.taskAllIncludes,
          filters: [
            {
              archived: 'exclude',
              completed: 'exclude',
              canceled: 'exclude',
              workspaceIds: ['w1', 'w2'],
              recurring: 'CURRENT',
              type: ['NORMAL', 'RECURRING_INSTANCE'],
              customFields: [
                {
                  '123': {
                    operator: 'in',
                    value: ['1234', '5678'],
                  },
                },
              ],
            },
          ],
        })
      })

      it('should normalize date custom field', () => {
        const state = createDataFilters({
          date: {
            Foo: {
              '123': {
                operator: 'gte',
                value: START_DATE.toISO(),
              },
            },
          },
        })
        const actual = createQuery(TEST_CTX, state)

        expect(actual).toMatchObject({
          filters: [
            {
              customFields: [
                {
                  '123': {
                    operator: 'gte',
                    value: START_DATE.startOf('day').toISO(),
                  },
                },
              ],
            },
          ],
        })
      })
    })
  })

  describe('applies to project', () => {
    it('should include project filters', () => {
      const state = createDataFilters({
        statusIds: { operator: 'in', value: ['s1'] },
        assigneeUserIds: { operator: 'in', value: ['u1'] },
      })
      const actual = createQuery(TEST_CTX, state)
      assertDefined(actual)

      expect(actual.filters).toEqual([
        {
          workspaceIds: ['w1', 'w2'],
          archived: 'exclude',
          completed: 'include',
          canceled: 'include',
          recurring: 'CURRENT',
          type: ['NORMAL', 'RECURRING_INSTANCE'],
          statusIds: { operator: 'in', value: ['s1'] },
          assigneeUserIds: { operator: 'in', value: ['u1'] },
        },
      ])
    })

    it('should filter tasks by project id', () => {
      const state = createDataFilters(
        { statusIds: { operator: 'in', value: ['s1'] } },
        { ids: { operator: 'in', value: ['p1'] } }
      )
      const actual = createQuery(TEST_CTX, state)
      assertDefined(actual)

      expect(actual.filters).toEqual([
        {
          workspaceIds: ['w1', 'w2'],
          archived: 'exclude',
          completed: 'include',
          canceled: 'include',
          recurring: 'CURRENT',
          type: ['NORMAL', 'RECURRING_INSTANCE'],
          statusIds: { operator: 'in', value: ['s1'] },
          projectIds: { operator: 'in', value: ['p1'] },
        },
      ])
    })

    it('should not return a project id filter if matching all projects', () => {
      const state = createDataFilters(
        { statusIds: { operator: 'in', value: ['s1'] } },
        { priorities: { operator: 'in', value: ['MEDIUM'] } }
      )
      const actual = createQuery(TEST_CTX, state)
      assertDefined(actual)

      expect(actual.filters).toEqual([
        {
          workspaceIds: ['w1', 'w2'],
          archived: 'exclude',
          completed: 'include',
          canceled: 'include',
          recurring: 'CURRENT',
          type: ['NORMAL', 'RECURRING_INSTANCE'],
          statusIds: { operator: 'in', value: ['s1'] },
        },
      ])
    })

    it('should return null if we know result will be empty', () => {
      const state = createDataFilters(
        { statusIds: { operator: 'in', value: ['s1'] } },
        {
          ids: { operator: 'in', value: [] },
          statusIds: { operator: 'in', value: ['s1', 's2'] },
        }
      )
      const actual = createQuery(TEST_CTX, state)

      expect(actual).toEqual(null)
    })

    it('should not do a query if filters result in 0 matches', () => {
      const state = createDataFilters(
        { statusIds: { operator: 'in', value: ['s1'] } },
        {
          ids: { operator: 'in', value: ['p1'] },
          statusIds: { operator: 'in', value: ['s1', 's2'] },
        }
      )
      const ctx = createContext({
        workspaces: [{ id: 'w1' }, { id: 'w2' }],
        projects: [{ id: 'p2', workspaceId: 'w2', statusId: 's2' }],
        statuses: [
          { id: 's1', workspaceId: 'w1' },
          { id: 's2', workspaceId: 'w2' },
        ],
        labels: [{ id: 'l1' }],
        users: [{ id: 'u1' }],
      })
      const actual = createQuery(ctx, state)

      expect(actual).toEqual(null)
    })

    it('should filter by id even if other filters match all projects', () => {
      const state = createDataFilters(
        { statusIds: { operator: 'in', value: ['s1'] } },
        {
          statusIds: { operator: 'in', value: ['s1', 's2'] },
          ids: { operator: 'in', value: ['p1'] },
        }
      )
      const actual = createQuery(TEST_CTX, state)
      assertDefined(actual)

      expect(actual.filters).toEqual([
        {
          workspaceIds: ['w1', 'w2'],
          archived: 'exclude',
          completed: 'include',
          canceled: 'include',
          recurring: 'CURRENT',
          type: ['NORMAL', 'RECURRING_INSTANCE'],
          statusIds: { operator: 'in', value: ['s1'] },
          projectIds: { operator: 'in', value: ['p1'] },
        },
      ])
    })
  })

  it('should not include project filter if workspace is empty', () => {
    const state = createDataFilters(
      { statusIds: { operator: 'in', value: ['s1'] } },
      {
        statusIds: { operator: 'in', value: ['s1', 's2'] },
      }
    )
    const ctx = createContext({
      workspaces: [{ id: 'w1' }, { id: 'w2' }],
      projects: [],
      statuses: [
        { id: 's1', workspaceId: 'w1' },
        { id: 's2', workspaceId: 'w2' },
      ],
      labels: [{ id: 'l1' }],
      users: [{ id: 'u1' }],
    })
    const actual = createQuery(ctx, state)

    expect(actual?.filters).toEqual([
      {
        archived: 'exclude',
        completed: 'include',
        canceled: 'include',
        recurring: 'CURRENT',
        statusIds: { operator: 'in', value: ['s1'] },
        type: ['NORMAL', 'RECURRING_INSTANCE'],
        workspaceIds: ['w1', 'w2'],
      },
    ])
  })
})

function assertDefined<T>(
  value: T | null | undefined
): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error('expected value to be defined')
  }
}
