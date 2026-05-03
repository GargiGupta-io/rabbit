import {
  type DateFilterSchema,
  type DefinedRelativeQueryName,
} from '@motion/zod/client'

import { DateTime, Settings } from 'luxon'

import { buildDateFilterQuery } from '../date'

const START_DATE = DateTime.fromISO('2024-04-22T12:18:20.893-05:00', {
  setZone: true,
})

describe('date', () => {
  beforeEach(() => {
    Settings.defaultZone = 'America/Winnipeg'
    vi.useFakeTimers({ now: START_DATE.valueOf() })
  })

  it('should return undefined if no query provided', () => {
    expect(buildDateFilterQuery(null)).toBeUndefined()
    expect(buildDateFilterQuery(undefined)).toBeUndefined()
  })

  it('should pass through filters', () => {
    const actual = buildDateFilterQuery({
      operator: 'range',
      value: {
        from: '2024-04-22T12:18:20.893-05:00',
        to: '2024-04-26T12:18:20.893-05:00',
      },
    })

    expect(actual).toEqual({
      operator: 'range',
      value: {
        from: '2024-04-22T00:00:00.000-05:00',
        to: '2024-04-26T23:59:59.999-05:00',
      },
    })
  })

  describe('defined-relative', () => {
    it.each<[DefinedRelativeQueryName, string, string]>([
      [
        'today',
        '2024-04-22T00:00:00.000-05:00',
        '2024-04-22T23:59:59.999-05:00',
      ],
      [
        'yesterday',
        '2024-04-21T00:00:00.000-05:00',
        '2024-04-21T23:59:59.999-05:00',
      ],
      [
        'tomorrow',
        '2024-04-23T00:00:00.000-05:00',
        '2024-04-23T23:59:59.999-05:00',
      ],
      [
        'this-week',
        '2024-04-22T00:00:00.000-05:00',
        '2024-04-28T23:59:59.999-05:00',
      ],
      [
        'last-week',
        '2024-04-15T00:00:00.000-05:00',
        '2024-04-21T23:59:59.999-05:00',
      ],
      [
        'next-week',
        '2024-04-29T00:00:00.000-05:00',
        '2024-05-05T23:59:59.999-05:00',
      ],
      [
        'this-month',
        '2024-04-01T00:00:00.000-05:00',
        '2024-04-30T23:59:59.999-05:00',
      ],
      [
        'last-month',
        '2024-03-01T00:00:00.000-06:00',
        '2024-03-31T23:59:59.999-05:00',
      ],
      [
        'next-month',
        '2024-05-01T00:00:00.000-05:00',
        '2024-05-31T23:59:59.999-05:00',
      ],
      [
        'next-30-days',
        '2024-04-22T00:00:00.000-05:00',
        '2024-05-21T23:59:59.999-05:00',
      ],
      [
        'next-7-days',
        '2024-04-22T00:00:00.000-05:00',
        '2024-04-28T23:59:59.999-05:00',
      ],
      [
        'next-14-days',
        '2024-04-22T00:00:00.000-05:00',
        '2024-05-05T23:59:59.999-05:00',
      ],
      [
        'last-7-days',
        '2024-04-16T00:00:00.000-05:00',
        '2024-04-22T23:59:59.999-05:00',
      ],
      [
        'last-14-days',
        '2024-04-09T00:00:00.000-05:00',
        '2024-04-22T23:59:59.999-05:00',
      ],
    ])('%s', (relative, start, end) => {
      const actual = buildDateFilterQuery({
        operator: 'defined-relative',
        name: relative,
      })

      expect(actual).toEqual({
        operator: 'range',
        value: {
          from: start,
          to: end,
        },
      })
    })
  })

  describe('relative', () => {
    it('should use positive durations', () => {
      const actual = buildDateFilterQuery({
        operator: 'relative',
        duration: 'P3W',
      })

      expect(actual).toEqual({
        operator: 'range',
        value: {
          from: START_DATE.startOf('day').toISO(),
          to: START_DATE.plus({ week: 3 }).endOf('day').toISO(),
        },
      })
    })

    it('should use negative durations', () => {
      const actual = buildDateFilterQuery({
        operator: 'relative',
        duration: 'P-3W',
      })

      expect(actual).toEqual({
        operator: 'range',
        value: {
          from: START_DATE.plus({ week: -3 }).startOf('day').toISO(),
          to: START_DATE.endOf('day').toISO(),
        },
      })
    })
  })

  describe('logical', () => {
    it('equals', () => {
      const actual = buildDateFilterQuery({
        operator: 'equals',
        value: START_DATE.toISO(),
      })

      expect(actual).toEqual({
        operator: 'range',
        value: {
          from: '2024-04-22T00:00:00.000-05:00',
          to: '2024-04-22T23:59:59.999-05:00',
        },
      })
    })

    it('gte', () => {
      const actual = buildDateFilterQuery({
        operator: 'gte',
        value: START_DATE.toISO(),
      })

      expect(actual).toEqual({
        operator: 'gte',
        value: '2024-04-22T00:00:00.000-05:00',
      })
    })

    it('gt', () => {
      const actual = buildDateFilterQuery({
        operator: 'gt',
        value: START_DATE.toISO(),
      })

      expect(actual).toEqual({
        operator: 'gt',
        value: '2024-04-22T23:59:59.999-05:00',
      })
    })

    it('lte', () => {
      const actual = buildDateFilterQuery({
        operator: 'lte',
        value: START_DATE.toISO(),
      })

      expect(actual).toEqual({
        operator: 'lte',
        value: '2024-04-22T23:59:59.999-05:00',
      })
    })

    it('lt', () => {
      const actual = buildDateFilterQuery({
        operator: 'lt',
        value: START_DATE.toISO(),
      })

      expect(actual).toEqual({
        operator: 'lt',
        value: '2024-04-22T00:00:00.000-05:00',
      })
    })
  })

  describe('empty / defined', () => {
    it('empty should pass through', () => {
      const original: DateFilterSchema = {
        operator: 'empty',
      }
      const actual = buildDateFilterQuery(original)

      expect(actual).toBe(original)
    })

    it('defined should pass through', () => {
      const original: DateFilterSchema = {
        operator: 'defined',
      }
      const actual = buildDateFilterQuery(original)

      expect(actual).toBe(original)
    })
  })
})
