import { Duration } from 'luxon'

import {
  createDurationsFromText,
  formatDurationTime,
  formatDurationToDay,
  formatDurationToShort,
  formatDurationToTime,
  getChunkDurations,
  getDefaultChunkDuration,
  getDurations,
  getValidMinimumDuration,
  MAX_DURATION_WITH_NO_CHUNKS,
  MIN_DURATION_WITH_CHUNKS,
  NO_CHUNK_DURATION,
  parseDurationText,
} from '../index'

// TODO: Add tests for `formatToShortTaskDuration`, `formatToTaskDuration`, `getAvailableAddTimeOptions`

describe('duration.ts', () => {
  describe('formatDurationTime', () => {
    it('returns 0 min', () => {
      expect(formatDurationTime(0)).toBe('0 min')
    })

    it('returns 30 min', () => {
      expect(formatDurationTime(30)).toBe('30 min')
    })

    it('returns 1 hour', () => {
      expect(formatDurationTime(60)).toBe('1 hour')
    })

    it('returns 1h 15m', () => {
      expect(formatDurationTime(75)).toBe('1h 15m')
    })

    it('returns 2 hours', () => {
      expect(formatDurationTime(120)).toBe('2 hours')
    })

    it('returns 30 min (rounded)', () => {
      expect(formatDurationTime(30.0971293)).toBe('30 min')
    })

    it('returns 1h 15m (rounded)', () => {
      expect(formatDurationTime(74.97123912)).toBe('1h 15m')
    })

    it('returns 2 hours (rounded)', () => {
      expect(formatDurationTime(120.4121234)).toBe('2 hours')
    })
  })

  describe('formatDurationToShort', () => {
    it('should return the correct format', () => {
      expect(formatDurationToShort(630)).toEqual('10h 30m')
      expect(formatDurationToShort(60)).toEqual('1h')
      expect(formatDurationToShort(667)).toEqual('11h 7m')
      expect(formatDurationToShort(1024)).toEqual('17h 4m')
      expect(formatDurationToShort(3000)).toEqual('50h')
    })

    it('returns the formatted duration string in the format "1h 23m 45s"', () => {
      const duration = Duration.fromObject({
        hours: 1,
        minutes: 23,
        seconds: 45,
      })

      expect(formatDurationToShort(duration)).toBe('1h 23m 45s')
    })

    // test a zero value for minutes and/or seconds
    it('returns the formatted duration string in the format "1h 45s"', () => {
      const duration = Duration.fromObject({
        hours: 1,
        minutes: 0,
        seconds: 45,
      })

      expect(formatDurationToShort(duration)).toBe('1h 45s')
    })

    // test a zero value for minutes and seconds
    it('returns the formatted duration string in the format "1h"', () => {
      const duration = Duration.fromObject({ hours: 1, minutes: 0, seconds: 0 })

      expect(formatDurationToShort(duration)).toBe('1h')
    })

    // test a zero value for just hours
    it('returns the formatted duration string in the format "45m 45s"', () => {
      const duration = Duration.fromObject({
        hours: 0,
        minutes: 45,
        seconds: 45,
      })

      expect(formatDurationToShort(duration)).toBe('45m 45s')
    })

    // test a zero value for hours and minutes
    it('returns the formatted duration string in the format "45s"', () => {
      const duration = Duration.fromObject({
        hours: 0,
        minutes: 0,
        seconds: 45,
      })

      expect(formatDurationToShort(duration)).toBe('45s')
    })
  })

  describe('formatDurationToTime', () => {
    it('should return the correct time', () => {
      expect(formatDurationToTime(630)).toEqual('10:30')
      expect(formatDurationToTime(60)).toEqual('01:00')
      expect(formatDurationToTime(667)).toEqual('11:07')
      expect(formatDurationToTime(1024)).toEqual('17:04')
      expect(formatDurationToTime(3000)).toEqual('50:00')
    })

    it('should return the time with a leading 0 in the hour and the minutes', () => {
      expect(formatDurationToTime(65)).toEqual('01:05')
    })
  })

  describe('createDurationsFromText', () => {
    it('returns an empty array when the text is empty', () => {
      expect(createDurationsFromText('')).toEqual([])
    })

    it('returns an array containing only a 0 min duration with 0', () => {
      expect(createDurationsFromText('0')).toEqual([
        { label: '0 min', value: 0 },
      ])
    })

    it('returns an array with 4 min and 4 hours duration', () => {
      expect(createDurationsFromText('4')).toEqual([
        { label: '4 min', value: 4 },
        { label: '4 hours', value: 240 },
      ])
    })

    it('returns an array with 25 min and 25 hours duration', () => {
      expect(createDurationsFromText('25')).toEqual([
        { label: '25 min', value: 25 },
        { label: '25 hours', value: 1500 },
      ])
    })

    it('returns an array with 40 min and 40 hours duration', () => {
      expect(createDurationsFromText('40')).toEqual([
        { label: '40 min', value: 40 },
        { label: '40 hours', value: 2400 },
      ])
    })

    it('returns an array with 50 min duration', () => {
      expect(createDurationsFromText('50')).toEqual([
        { label: '50 min', value: 50 },
      ])
    })

    it('returns an array with 6 hours only', () => {
      expect(createDurationsFromText('6h')).toEqual([
        { label: '6 hours', value: 360 },
      ])
    })

    it('returns an array with 3 min only', () => {
      expect(createDurationsFromText('3 min')).toEqual([
        { label: '3 min', value: 3 },
      ])
    })
  })

  describe('getDurations', () => {
    it('returns all the durations', () => {
      expect(getDurations({ includeNone: true })).toMatchSnapshot()
    })

    it('returns all the durations without "None" by default', () => {
      expect(getDurations()).toMatchSnapshot()
    })

    it('returns all the durations without "None"', () => {
      expect(getDurations({ includeNone: false })).toMatchSnapshot()
    })
  })

  describe('getChunkDurations', () => {
    it('returns an empty array when the duration is not set', () => {
      expect(getChunkDurations(null)).toEqual([])
    })

    it(`returns an empty array when the duration < ${MIN_DURATION_WITH_CHUNKS}`, () => {
      expect(getChunkDurations(20)).toEqual([])
    })

    it(`returns "No Chunks" as first option when the duration is <= ${MAX_DURATION_WITH_NO_CHUNKS}`, () => {
      const noChunkOption = { label: 'No Chunks', value: NO_CHUNK_DURATION }

      expect(getChunkDurations(30)[0]).toStrictEqual(noChunkOption)
      expect(getChunkDurations(480)[0]).toStrictEqual(noChunkOption)
    })

    it('returns only chunks under 90 min', () => {
      expect(getChunkDurations(90)).toMatchSnapshot()
    })

    it('returns only chunks under 120 min', () => {
      expect(getChunkDurations(120)).toMatchSnapshot()
    })

    it('returns only chunks under 16 hours', () => {
      expect(getChunkDurations(960)).toMatchSnapshot()
    })

    it('returns only chunks under 32 hours', () => {
      expect(getChunkDurations(1920)).toMatchSnapshot()
    })
  })

  describe('getDefaultChunkDuration', () => {
    it('returns no chunks when the duration is not set', () => {
      expect(getDefaultChunkDuration(null)).toBe(NO_CHUNK_DURATION)
    })

    it('returns no chunks for duration < 120', () => {
      expect(getDefaultChunkDuration(0)).toBe(NO_CHUNK_DURATION)
      expect(getDefaultChunkDuration(60)).toBe(NO_CHUNK_DURATION)
      expect(getDefaultChunkDuration(119)).toBe(NO_CHUNK_DURATION)
    })

    it('returns 60 for duration >= 120 & < 960', () => {
      expect(getDefaultChunkDuration(120)).toBe(60)
      expect(getDefaultChunkDuration(959)).toBe(60)
    })

    it('returns 120 for duration >= 960', () => {
      expect(getDefaultChunkDuration(960)).toBe(120)
      expect(getDefaultChunkDuration(2400)).toBe(120)
    })
  })

  describe('parseDurationText', () => {
    it('returns an empty array when input appears to have no time', () => {
      expect(parseDurationText('')).toEqual([])
      expect(parseDurationText('fifty five hours')).toEqual([])
    })

    it('returns proper time when only minutes are included', () => {
      expect(parseDurationText('30 minutes')).toEqual([30])
      expect(parseDurationText('30.01 minutes')).toEqual([30])

      expect(parseDurationText('90 minutes')).toEqual([90])
    })

    it('returns proper time when passed hours and mintues', () => {
      expect(parseDurationText('1 hour 30 minutes')).toEqual([90])
    })

    it('can infer the type of unit', () => {
      expect(parseDurationText('20 minutes')).toEqual([20])
      expect(parseDurationText('2 hours')).toEqual([120])
    })

    it('returns multiple results with one parameter and no unit', () => {
      expect(parseDurationText('2')).toEqual([2, 120])
      expect(parseDurationText('22')).toEqual([22, 1320])
      expect(parseDurationText('10 ')).toEqual([10, 600])
    })
  })

  describe('getValidMinimumDuration', () => {
    it('returns null when the duration is not set', () => {
      expect(getValidMinimumDuration(null, 10)).toBe(null)
    })

    it('returns null when the minimum duration is not set', () => {
      expect(getValidMinimumDuration(10, null)).toBe(null)
    })

    it('returns the minimum duration when the minimum duration is less than the duration', () => {
      expect(getValidMinimumDuration(10, 5)).toBe(5)
      expect(getValidMinimumDuration(60, 30)).toBe(30)
      expect(getValidMinimumDuration(120, 60)).toBe(60)
    })

    it('returns a valid minimum duration when the minimum duration is greater than the duration', () => {
      expect(getValidMinimumDuration(10, 15)).toBe(null)
      expect(getValidMinimumDuration(120, 150)).toBe(60)
      expect(getValidMinimumDuration(240, 300)).toBe(60)
      expect(getValidMinimumDuration(961, 1000)).toBe(120)
    })
  })

  describe('formatDurationToDay', () => {
    it('returns TBD for null and reminder for 0', () => {
      expect(formatDurationToDay(null)).toBe('TBD')
      expect(formatDurationToDay(0)).toBe('Reminder')
    })

    it('returns the duration in minutes values less than an hour', () => {
      expect(formatDurationToDay(1)).toBe('1m')
      expect(formatDurationToDay(59)).toBe('59m')
    })

    it('returns the duration in hours and drops the decimal for round values', () => {
      expect(formatDurationToDay(60)).toBe('1h')
      expect(formatDurationToDay(120)).toBe('2h')
      expect(formatDurationToDay(90)).toBe('1.5h')
      expect(formatDurationToDay(135)).toBe('2.3h')
      expect(formatDurationToDay(1439)).toBe('1d')
    })

    it('returns the duration in days and drops the decimal for round values', () => {
      expect(formatDurationToDay(1440)).toBe('1d')
      expect(formatDurationToDay(1500)).toBe('1d') // 1500/1440 = 1.0417, rounds to 1.0d
      expect(formatDurationToDay(3000)).toBe('2.1d')
      expect(formatDurationToDay(2880)).toBe('2d')
    })
  })
})
