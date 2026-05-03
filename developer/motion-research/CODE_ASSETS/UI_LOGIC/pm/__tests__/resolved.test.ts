import { type EntityFilterState } from '../data'
import { isShowCompletedChecked, isShowResolvedChecked } from '../resolved'

describe('isShowCompletedChecked', () => {
  it('returns indeterminate when statusIds is present', () => {
    const entity = {
      filters: {
        statusIds: ['1', '2'],
        completed: 'exclude',
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowCompletedChecked(entity)).toBe('indeterminate')
  })

  it('returns indeterminate when completedTime is present', () => {
    const entity = {
      filters: {
        completedTime: { from: new Date(), to: new Date() },
        completed: 'exclude',
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowCompletedChecked(entity)).toBe('indeterminate')
  })

  it('returns true when completed is include', () => {
    const entity = {
      filters: {
        completed: 'include',
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowCompletedChecked(entity)).toBe(true)
  })

  it('returns false when completed is not include', () => {
    const entity = {
      filters: {
        completed: 'exclude',
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowCompletedChecked(entity)).toBe(false)
  })

  it('handles empty filters object', () => {
    const entity = {
      filters: {},
    } as unknown as EntityFilterState['tasks']

    expect(isShowCompletedChecked(entity)).toBe(false)
  })

  it('prioritizes statusIds check over completed status', () => {
    const entity = {
      filters: {
        statusIds: ['1'],
        completed: 'include',
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowCompletedChecked(entity)).toBe('indeterminate')
  })

  it('prioritizes completedTime check over completed status', () => {
    const entity = {
      filters: {
        completedTime: { from: new Date(), to: new Date() },
        completed: 'include',
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowCompletedChecked(entity)).toBe('indeterminate')
  })
})

describe('isShowResolvedChecked', () => {
  it('returns true when canceled is include and completed is include', () => {
    const entity = {
      filters: {
        canceled: 'include',
        completed: 'include',
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowResolvedChecked(entity)).toBe(true)
  })

  it('returns false when canceled is not include', () => {
    const entity = {
      filters: {
        canceled: 'exclude',
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowResolvedChecked(entity)).toBe(false)
  })

  it('returns false when completed is not include', () => {
    const entity = {
      filters: {
        completed: 'exclude',
        canceled: 'include',
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowResolvedChecked(entity)).toBe(false)
  })

  it('returns indeterminate when completedTime is present', () => {
    const entity = {
      filters: {
        completedTime: { from: new Date(), to: new Date() },
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowResolvedChecked(entity)).toBe('indeterminate')
  })

  it('returns indeterminate when statusIds is present', () => {
    const entity = {
      filters: {
        statusIds: ['1', '2'],
      },
    } as unknown as EntityFilterState['tasks']

    expect(isShowResolvedChecked(entity)).toBe('indeterminate')
  })
})
