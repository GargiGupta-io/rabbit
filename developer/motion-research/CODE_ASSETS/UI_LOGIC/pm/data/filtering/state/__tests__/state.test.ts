import { type InternalStateKey } from '@motion/react-core/shared-state'

import {
  createEntityFilterState,
  createProjectFilter,
  createTaskFilter,
} from '../../__tests__/utils'
import { DEFAULT_CUSTOM_FIELD_FILTERS } from '../defaults'
import { ActiveFilterKey } from '../state'
import { type EntityFilterState } from '../types'

const InternalKey = ActiveFilterKey as InternalStateKey<EntityFilterState>

describe('state', () => {
  it('should serialize', () => {
    const state = {
      filters: createTaskFilter({
        statusIds: { operator: 'in', value: ['s1'] },
      }),
      ordered: ['statuses'],
    }

    // @ts-expect-error - function is defined
    const actual = InternalKey.serialize(state)

    expect(actual).toEqual(JSON.stringify(state))
  })

  it('should deserialize', () => {
    const state: EntityFilterState = createEntityFilterState({
      statusIds: { operator: 'in', value: ['s1'] },
    })

    // @ts-expect-error - function is defined
    const actual = InternalKey.deserialize(JSON.stringify(state))

    expect(actual).toMatchObject(
      createEntityFilterState({
        statusIds: { operator: 'in', value: ['s1'] },
        archived: 'exclude',
        completed: 'exclude',
      })
    )
  })

  it('should migrate', () => {
    const state = {
      target: 'tasks',
      tasks: {
        ordered: ['users', 'projects', 'completedTime'],
        filters: {
          users: ['RSzUgdAHJ6MJuOYdUc1q4taLB9A2'],

          // previous values
          projects: ['QiPEi78DS-GvQERryWsv-|<none>', '8HZ3rvbeVl3RWF_xvrevx'],

          // really old value
          completedTime: {
            from: '2024-03-01T01:02:03Z',
          },
          workspaces: ['w1'],
        },
      },
      projects: {
        ordered: [],
        filters: createProjectFilter({}),
      },
    }

    // @ts-expect-error - function is defined
    const actual = InternalKey.deserialize(JSON.stringify(state))

    expect(actual).toMatchObject({
      $version: 9,
      tasks: {
        filters: {
          assigneeUserIds: {
            operator: 'in',
            value: ['RSzUgdAHJ6MJuOYdUc1q4taLB9A2'],
          },
          completedTime: {
            operator: 'gte',
            value: '2024-03-01T00:00:00.000Z',
          },
          // Should handle custom fields defaults
          ...DEFAULT_CUSTOM_FIELD_FILTERS,
        },
      },
      projects: {
        filters: {
          ids: {
            operator: 'in',
            value: ['QiPEi78DS-GvQERryWsv-|<none>', '8HZ3rvbeVl3RWF_xvrevx'],
          },
        },
      },
      workspaces: {
        filters: {
          ids: { operator: 'in', value: ['w1'] },
        },
      },
    })
  })

  it('should handle unable to parse', () => {
    // @ts-expect-error - function is defined
    const actual = InternalKey.deserialize('')

    expect(actual).toBeUndefined()
  })
})
