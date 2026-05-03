import {
  createDataFilters,
  createEntityFilterState,
} from '../../__tests__/utils'
import { type EntityFilterState } from '../../state'
import {
  getCanceledFilter,
  getCanceledIdFilter,
  getCompletedFilter,
  intersection,
  normalizeToDataFilter,
} from '../utils'

describe('filter utils', () => {
  describe('intersection', () => {
    it('should return the intersection of multiple arrays', () => {
      const result = intersection(
        ['a', 'b', 'c'],
        ['b', 'c', 'd'],
        ['c', 'd', 'e']
      )

      expect(result).toEqual(['c'])
    })

    it('should return an empty array if no intersection exists', () => {
      const result = intersection(
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      )

      expect(result).toEqual([])
    })

    it('should handle empty arrays', () => {
      const result = intersection([], [], [])

      expect(result).toEqual([])
    })

    it('should return an empty array if any of the arrays is empty', () => {
      const result = intersection(['a', 'b', 'c'], [], ['c', 'd', 'e'])

      expect(result).toEqual([])
    })

    it('should return the intersection of multiple arrays with duplicate elements', () => {
      const result = intersection(
        ['a', 'b', 'c', 'c'],
        ['b', 'c', 'd', 'd'],
        ['c', 'd', 'e', 'e']
      )

      expect(result).toEqual(['c'])
    })
  })

  describe('toDataFilter', () => {
    it('should normalize filter', () => {
      const filter: EntityFilterState = createEntityFilterState({
        assigneeUserIds: { operator: 'in', value: ['u1'] },
      })
      const normalized = normalizeToDataFilter(filter)

      expect(normalized).toMatchObject({
        tasks: {
          assigneeUserIds: { operator: 'in', value: ['u1'] },
        },
      })
    })

    it('should pass throw  data filter', () => {
      const filter = createDataFilters({
        assigneeUserIds: { operator: 'in', value: ['u1'] },
      })
      const normalized = normalizeToDataFilter(filter)

      expect(normalized).toBe(filter)
    })
  })

  describe('getCompletedFilter', () => {
    it('should return include when statusIds is present', () => {
      const result = getCompletedFilter({
        statusIds: { operator: 'in', value: ['s1'] },
      })

      expect(result).toBe('include')
    })

    it('should return include when completedTime is present', () => {
      const result = getCompletedFilter({
        completedTime: { operator: 'gt', value: '2024-03-04T00:00:00Z' },
      })

      expect(result).toBe('include')
    })

    it('should return completed value when no statusIds or completedTime', () => {
      const result = getCompletedFilter({ completed: 'exclude' })

      expect(result).toBe('exclude')
    })

    it('should return undefined when no filters present', () => {
      const result = getCompletedFilter({})

      expect(result).toBeUndefined()
    })

    it('should return fallback value when no filters present and fallback provided', () => {
      const result = getCompletedFilter({}, 'exclude')

      expect(result).toBe('exclude')
    })
  })

  describe('getCanceledFilter', () => {
    it('should return include when statusIds is present', () => {
      const result = getCanceledFilter({
        statusIds: { operator: 'in', value: ['s1'] },
      })

      expect(result).toBe('include')
    })

    it('should return canceled value when no statusIds', () => {
      const result = getCanceledFilter({ canceled: 'exclude' })

      expect(result).toBe('exclude')
    })

    it('should return undefined when no filters present', () => {
      const result = getCanceledFilter({})

      expect(result).toBeUndefined()
    })

    it('should return fallback value when no filters present and fallback provided', () => {
      const result = getCanceledFilter({}, 'exclude')

      expect(result).toBe('exclude')
    })
  })

  describe('getCanceledIdFilter', () => {
    const canceledStatusIds = ['s1', 's2']

    it('should return undefined when no canceled status IDs', () => {
      const result = getCanceledIdFilter({}, [])

      expect(result).toBeUndefined()
    })

    it('should return undefined when canceled is include', () => {
      const result = getCanceledIdFilter(
        { canceled: 'include' },
        canceledStatusIds
      )

      expect(result).toBeUndefined()
    })

    it('should return undefined when statusIds is present', () => {
      const result = getCanceledIdFilter(
        { statusIds: { operator: 'in', value: ['s3'] } },
        canceledStatusIds
      )

      expect(result).toBeUndefined()
    })

    it('should return exclude filter when canceled is exclude', () => {
      const result = getCanceledIdFilter(
        { canceled: 'exclude' },
        canceledStatusIds
      )

      expect(result).toEqual({
        operator: 'in',
        value: canceledStatusIds,
        inverse: true,
      })
    })

    it('should return include filter when canceled is only', () => {
      const result = getCanceledIdFilter(
        { canceled: 'only' },
        canceledStatusIds
      )

      expect(result).toEqual({
        operator: 'in',
        value: canceledStatusIds,
        inverse: false,
      })
    })
  })
})
