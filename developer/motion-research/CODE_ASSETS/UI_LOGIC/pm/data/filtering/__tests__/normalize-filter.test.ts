import { createContext, createEntityFilterState } from './utils'

import { normalizeFilter } from '../normalize-filter'

describe('normalize-filter', () => {
  it('should remove filters that are for different workspaces', () => {
    const ctx = createContext({
      workspaces: [{ id: 'w1' }, { id: 'w2' }],
      projects: [
        { id: 'p1', workspaceId: 'w1' },
        { id: 'p2', workspaceId: 'w2' },
      ],
      statuses: [
        { id: 's1', workspaceId: 'w1' },
        { id: 's2', workspaceId: 's2' },
      ],
      labels: [],
    })

    const filter = createEntityFilterState(
      {},
      {
        ids: { operator: 'in', value: ['p1', 'p2'] },
      },
      { ids: { operator: 'in', value: ['w1'] } }
    )

    const actual = normalizeFilter(ctx, filter)

    expect(actual.projects.filters.ids).toEqual({
      operator: 'in',
      value: ['p1'],
    })
  })

  it('should ignore if no workspaces are selected', () => {
    const ctx = createContext({
      workspaces: [{ id: 'w1' }, { id: 'w2' }],
      projects: [
        { id: 'p1', workspaceId: 'w1' },
        { id: 'p2', workspaceId: 'w2' },
      ],
      statuses: [
        { id: 's1', workspaceId: 'w1' },
        { id: 's2', workspaceId: 's2' },
      ],
      labels: [],
    })

    const filter = createEntityFilterState(
      {},
      {
        ids: { operator: 'in', value: ['p1', 'p2'] },
      }
    )

    const actual = normalizeFilter(ctx, filter)

    expect(actual.projects.filters.ids).toEqual({
      operator: 'in',
      value: ['p1', 'p2'],
    })
  })

  it('should null filter if none selected', () => {
    const ctx = createContext({
      workspaces: [{ id: 'w1' }, { id: 'w2' }],
      projects: [
        { id: 'p1', workspaceId: 'w1' },
        { id: 'p2', workspaceId: 'w2' },
      ],
      statuses: [
        { id: 's1', workspaceId: 'w1' },
        { id: 's2', workspaceId: 's2' },
      ],
      labels: [],
    })

    const filter = createEntityFilterState(
      {},
      {
        ids: { operator: 'in', value: ['p2'] },
      },
      { ids: { operator: 'in', value: ['w1'] } }
    )

    const actual = normalizeFilter(ctx, filter)

    expect(actual.projects.filters.ids).toEqual(null)
  })
})
