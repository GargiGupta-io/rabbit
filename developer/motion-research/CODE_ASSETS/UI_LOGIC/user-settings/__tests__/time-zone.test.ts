import { type UserSettingsSchema } from '@motion/rpc-types'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { formatTimezoneToString } from '../../utils'
import {
  getTimezoneSettings,
  shouldPromptForTimezoneChange,
} from '../time-zone'

describe('getTimezoneSettings', () => {
  // Freeze a consistent time before all tests
  const freezeDate = new Date('2023-01-01T00:00:00Z')

  beforeAll(() => {
    // Freeze time at the specified date
    tk.freeze(freezeDate)
  })

  afterAll(() => {
    // Unfreeze the time after tests are done
    tk.reset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return local timezone if settings is undefined and useDefaults is true', () => {
    const result = getTimezoneSettings({ useDefaults: true })

    const localTimezone = DateTime.local().zone.name
    const formattedLocalTimezoneString = formatTimezoneToString(
      DateTime.local().zone
    )

    expect(result).toEqual({
      defaultTimezone: localTimezone,
      formattedLocalTimezoneString,
      localTimezoneName: localTimezone,
    })
  })

  it('should return the defaultTimezone from settings when available and useDefaults is true', () => {
    const settings: UserSettingsSchema = {
      timezones: {
        defaultTimezone: 'Mock/CustomTimezone',
      },
    } as UserSettingsSchema
    const result = getTimezoneSettings({ settings, useDefaults: true })

    const localTimezone = DateTime.local().zone.name
    const formattedLocalTimezoneString = formatTimezoneToString(
      DateTime.local().zone
    )

    expect(result).toEqual({
      defaultTimezone: 'Mock/CustomTimezone',
      formattedLocalTimezoneString,
      localTimezoneName: localTimezone,
    })
  })

  it('should return undefined if settings is undefined and useDefaults is false', () => {
    const result = getTimezoneSettings({ useDefaults: false })

    const localTimezone = DateTime.local().zone.name
    const formattedLocalTimezoneString = formatTimezoneToString(
      DateTime.local().zone
    )

    expect(result).toEqual({
      defaultTimezone: undefined,
      formattedLocalTimezoneString,
      localTimezoneName: localTimezone,
    })
  })

  it('should return the timezone from settings if useDefaults is false', () => {
    const settings: UserSettingsSchema = {
      timezones: {
        defaultTimezone: 'Mock/CustomTimezone',
      },
    } as UserSettingsSchema
    const result = getTimezoneSettings({ settings, useDefaults: false })

    const localTimezone = DateTime.local().zone.name
    const formattedLocalTimezoneString = formatTimezoneToString(
      DateTime.local().zone
    )

    expect(result).toEqual({
      defaultTimezone: 'Mock/CustomTimezone',
      formattedLocalTimezoneString,
      localTimezoneName: localTimezone,
    })
  })
})

describe('shouldPromptForTimezoneChange', () => {
  it('should return false if timezones have the same offset', () => {
    // America/New_York and America/Toronto have the same offset
    const result = shouldPromptForTimezoneChange({
      localTimezoneName: 'America/New_York',
      defaultTimezone: 'America/Toronto',
      detectedTimezone: 'America/Los_Angeles',
    })

    expect(result).toBe(false)
  })

  it('should return false if detectedTimezone is the same as localTimezoneName', () => {
    const result = shouldPromptForTimezoneChange({
      localTimezoneName: 'America/New_York',
      defaultTimezone: 'America/Los_Angeles',
      detectedTimezone: 'America/New_York',
    })

    expect(result).toBe(false)
  })

  it('should return true if in a different timezone and last checked timezone is different', () => {
    const result = shouldPromptForTimezoneChange({
      localTimezoneName: 'America/New_York',
      defaultTimezone: 'America/Los_Angeles',
      detectedTimezone: 'America/Los_Angeles',
    })

    expect(result).toBe(true)
  })
})
