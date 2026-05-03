import { getDayModeForProjectDate } from '../project-date-adjustment'
import { DayMode } from '../stage-adjuster'

describe(getDayModeForProjectDate, () => {
  it('should return BUSINESS for weekdays', () => {
    // Monday
    expect(getDayModeForProjectDate('2023-01-02')).toBe(DayMode.BUSINESS)
    expect(getDayModeForProjectDate('2025-06-09')).toBe(DayMode.BUSINESS)
    // Tuesday
    expect(getDayModeForProjectDate('2023-01-03')).toBe(DayMode.BUSINESS)
    expect(getDayModeForProjectDate('2025-06-10')).toBe(DayMode.BUSINESS)
    // Wednesday
    expect(getDayModeForProjectDate('2023-01-04')).toBe(DayMode.BUSINESS)
    expect(getDayModeForProjectDate('2025-06-11')).toBe(DayMode.BUSINESS)
    // Thursday
    expect(getDayModeForProjectDate('2023-01-05')).toBe(DayMode.BUSINESS)
    expect(getDayModeForProjectDate('2025-06-12')).toBe(DayMode.BUSINESS)
    // Friday
    expect(getDayModeForProjectDate('2023-01-06')).toBe(DayMode.BUSINESS)
    expect(getDayModeForProjectDate('2025-06-13')).toBe(DayMode.BUSINESS)
  })

  it('should return CALENDAR for weekends', () => {
    // Saturday
    expect(getDayModeForProjectDate('2023-01-07')).toBe(DayMode.CALENDAR)
    expect(getDayModeForProjectDate('2025-06-14')).toBe(DayMode.CALENDAR)
    // Sunday
    expect(getDayModeForProjectDate('2023-01-08')).toBe(DayMode.CALENDAR)
    expect(getDayModeForProjectDate('2025-06-15')).toBe(DayMode.CALENDAR)
  })
})
