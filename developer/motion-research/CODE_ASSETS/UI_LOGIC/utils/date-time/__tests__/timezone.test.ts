import {
  areTimezonesOffsetsEqual,
  formatTimezoneDifference,
  formatTimezoneToString,
  getZoneFromTimezone,
} from '../timezone'

describe('getZoneFromTimezone', () => {
  it('should return a luxon zone from a timezone string', () => {
    const timezone = 'America/New_York'
    const zone = getZoneFromTimezone(timezone)

    expect(zone.name).toEqual(timezone)
  })
})

describe('formatTimezoneToString', () => {
  it('should return the correct timezone string', () => {
    const estZone = getZoneFromTimezone('America/New_York')

    expect(formatTimezoneToString(estZone)).toEqual(
      'EST - Eastern Standard Time (GMT-05:00)'
    )

    const pstZone = getZoneFromTimezone('America/Los_Angeles')

    expect(formatTimezoneToString(pstZone)).toEqual(
      'PST - Pacific Standard Time (GMT-08:00)'
    )
  })
})

describe('areTimezonesOffsetsEqual', () => {
  it('should detect that zones that have the same offset are equal', () => {
    const timezone1 = 'America/New_York'
    const timezone2 = 'America/Toronto'

    expect(areTimezonesOffsetsEqual(timezone1, timezone2)).toEqual(true)
  })

  it('should detect that zones that have different offsets are not equal', () => {
    const timezone1 = 'America/Los_Angeles'
    const timezone2 = 'America/Toronto'

    expect(areTimezonesOffsetsEqual(timezone1, timezone2)).toEqual(false)
  })
})

describe('formatTimezoneDifference', () => {
  it('should return "Same timezone as you" when timezones are the same', () => {
    const timezone = 'America/New_York'
    const result = formatTimezoneDifference(timezone, timezone)

    expect(result).toEqual('Same timezone as you')
  })

  it('should use singular "hour" for exactly 1 hour difference (behind)', () => {
    // Central Time (America/Chicago) is 1 hour behind Eastern Time (America/New_York)
    const targetTimezone = 'America/Chicago'
    const referenceTimezone = 'America/New_York'
    const result = formatTimezoneDifference(targetTimezone, referenceTimezone)

    expect(result).toEqual('1 hour behind you')
  })

  it('should use singular "hour" for exactly 1 hour difference (ahead)', () => {
    // Eastern Time (America/New_York) is 1 hour ahead of Central Time (America/Chicago)
    const targetTimezone = 'America/New_York'
    const referenceTimezone = 'America/Chicago'
    const result = formatTimezoneDifference(targetTimezone, referenceTimezone)

    expect(result).toEqual('1 hour ahead of you')
  })

  it('should format hours ahead correctly', () => {
    // Eastern Time (America/New_York) is 3 hours ahead of Pacific Time (America/Los_Angeles)
    const targetTimezone = 'America/New_York'
    const referenceTimezone = 'America/Los_Angeles'
    const result = formatTimezoneDifference(targetTimezone, referenceTimezone)

    expect(result).toEqual('3 hours ahead of you')
  })
})
