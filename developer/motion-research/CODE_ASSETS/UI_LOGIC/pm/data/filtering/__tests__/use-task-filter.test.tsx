import { SharedStateProvider } from '@motion/react-core/shared-state'

import { act, renderHook } from '@testing-library/react'

import { createContext, createEntityFilterState } from './utils'

import { ActiveFilterKey } from '../state'
import { useEntityFilter, useFieldFilter } from '../use-entity-filter'

const TEST_CTX = createContext({
  workspaces: [{ id: 'w1' }, { id: 'w2' }],
  projects: [
    { id: 'p1', workspaceId: 'w1' },
    { id: 'p2', workspaceId: 'w2' },
  ],
  statuses: [
    { id: 's1', workspaceId: 'w1' },
    { id: 's2', workspaceId: 's2' },
  ],
  labels: [{ id: 'l1', workspaceId: 'w1' }],
  users: [{ id: 'u1' }],
})

describe('use-entity-filter', () => {
  it('should do get filter', () => {
    const initialValues = new Map()
    initialValues.set(
      ActiveFilterKey,
      createEntityFilterState({
        statusIds: { operator: 'in', value: ['s1'] },
      })
    )

    const wrapper = renderHook(() => useEntityFilter(TEST_CTX, 'tasks'), {
      wrapper: ({ children }) => {
        return (
          <SharedStateProvider initialValues={initialValues}>
            {children}
          </SharedStateProvider>
        )
      },
    })

    expect(wrapper.result.current[0]).toMatchObject({
      filters: { statusIds: { operator: 'in', value: ['s1'] } },
      ordered: ['statusIds'],
    })
  })

  it('should set new value', () => {
    const initialValues = new Map()
    initialValues.set(
      ActiveFilterKey,
      createEntityFilterState({
        statusIds: { operator: 'in', value: ['s1'] },
      })
    )

    const wrapper = renderHook(() => useEntityFilter(TEST_CTX, 'tasks'), {
      wrapper: ({ children }) => {
        return (
          <SharedStateProvider initialValues={initialValues}>
            {children}
          </SharedStateProvider>
        )
      },
    })

    act(() => {
      wrapper.result.current[1]('labelIds', { operator: 'in', value: ['l1'] })
      wrapper.rerender()
    })

    expect(wrapper.result.current[0]).toMatchObject({
      filters: {
        statusIds: { operator: 'in', value: ['s1'] },
        labelIds: { operator: 'in', value: ['l1'] },
      },
      ordered: ['statusIds', 'labelIds'],
    })
  })

  it('should overwrite existing value', () => {
    const initialValues = new Map()
    initialValues.set(
      ActiveFilterKey,
      createEntityFilterState({
        statusIds: { operator: 'in', value: ['s1'] },
      })
    )

    const wrapper = renderHook(() => useEntityFilter(TEST_CTX, 'tasks'), {
      wrapper: ({ children }) => {
        return (
          <SharedStateProvider initialValues={initialValues}>
            {children}
          </SharedStateProvider>
        )
      },
    })

    act(() => {
      wrapper.result.current[1]('statusIds', { operator: 'in', value: ['s2'] })
      wrapper.rerender()
    })

    expect(wrapper.result.current[0]).toMatchObject({
      filters: {
        statusIds: { operator: 'in', value: ['s2'] },
      },
      ordered: ['statusIds'],
    })
  })

  it('should clear value', () => {
    const initialValues = new Map()
    initialValues.set(
      ActiveFilterKey,
      createEntityFilterState({
        statusIds: { operator: 'in', value: ['s1'] },
      })
    )

    const wrapper = renderHook(() => useEntityFilter(TEST_CTX, 'tasks'), {
      wrapper: ({ children }) => {
        return (
          <SharedStateProvider initialValues={initialValues}>
            {children}
          </SharedStateProvider>
        )
      },
    })

    act(() => {
      wrapper.result.current[1]('statusIds', null)
      wrapper.rerender()
    })

    expect(wrapper.result.current[0]).toMatchObject({
      filters: {
        statusIds: null,
      },
      ordered: [],
    })
  })
})

describe('use-field-filter', () => {
  it('should get field value', () => {
    const initialValues = new Map()
    initialValues.set(
      ActiveFilterKey,
      createEntityFilterState({
        statusIds: { operator: 'in', value: ['s1'] },
      })
    )

    const wrapper = renderHook(
      () => useFieldFilter(TEST_CTX, 'tasks', 'statusIds'),
      {
        wrapper: ({ children }) => {
          return (
            <SharedStateProvider initialValues={initialValues}>
              {children}
            </SharedStateProvider>
          )
        },
      }
    )

    expect(wrapper.result.current[0]).toMatchObject({
      operator: 'in',
      value: ['s1'],
    })
  })

  it('should set new value', () => {
    const initialValues = new Map()
    initialValues.set(
      ActiveFilterKey,
      createEntityFilterState({
        statusIds: { operator: 'in', value: ['s1'] },
      })
    )

    const wrapper = renderHook(
      () => useFieldFilter(TEST_CTX, 'tasks', 'labelIds'),
      {
        wrapper: ({ children }) => {
          return (
            <SharedStateProvider initialValues={initialValues}>
              {children}
            </SharedStateProvider>
          )
        },
      }
    )

    act(() => {
      wrapper.result.current[1]({ operator: 'in', value: ['l1'] })
      wrapper.rerender()
    })

    expect(wrapper.result.current[0]).toMatchObject({
      operator: 'in',
      value: ['l1'],
    })
  })
})
