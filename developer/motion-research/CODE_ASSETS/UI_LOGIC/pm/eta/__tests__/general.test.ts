import {
  ETA_HOUR_ROUNDING_INTERVAL,
  getEtaLabel,
  numDaysAndHoursBetweenDates,
  numHoursBetweenDates,
  safeDateDiff,
} from '../general'

describe('getEtaLabel', () => {
  it('should return the correct label for missed deadline regardless of type', () => {
    expect(getEtaLabel('missed-deadline', 'project')).toEqual('Missed deadline')
    expect(getEtaLabel('missed-deadline', 'stage')).toEqual(
      'Stage missed deadline'
    )
    expect(getEtaLabel('missed-deadline', 'task')).toEqual('Missed deadline')
    expect(getEtaLabel('missed-deadline')).toEqual('Missed deadline')
  })

  it('should return the correct label for a scheduled past deadline', () => {
    expect(getEtaLabel('scheduled-past-deadline', 'project')).toEqual(
      'Project is scheduled past deadline'
    )
    expect(getEtaLabel('scheduled-past-deadline', 'stage')).toEqual(
      'Scheduled past deadline'
    )
    expect(getEtaLabel('scheduled-past-deadline', 'task')).toEqual(
      'Task is scheduled past deadline'
    )
    expect(getEtaLabel('scheduled-past-deadline')).toEqual(
      'Scheduled past deadline'
    )
  })

  it('should return the correct label for an at risk status', () => {
    const result = getEtaLabel('at-risk')

    expect(result).toEqual('Warnings')
  })

  it('should return the correct label for an on track status', () => {
    expect(getEtaLabel('on-track', 'project')).toEqual('Project is on track')
    expect(getEtaLabel('on-track', 'stage')).toEqual('Stage is on track')
    expect(getEtaLabel('on-track', 'task')).toEqual('Task is on track')
    expect(getEtaLabel('on-track')).toEqual('On track')
  })

  it('should return the correct label for a default status', () => {
    const type = 'task'
    const result = getEtaLabel('none', type)

    expect(result).toEqual('No ETA')
  })
})

describe('ETA Date Utility Functions', () => {
  describe('safeDateDiff', () => {
    it('returns 0 when either date is null', () => {
      expect(safeDateDiff(null, '2023-01-01T00:00:00.000Z')).toBe(0)
      expect(safeDateDiff('2023-01-01T00:00:00.000Z', null)).toBe(0)
      expect(safeDateDiff(null, null)).toBe(0)
    })

    it('calculates days between scheduled and due dates', () => {
      expect(
        safeDateDiff('2023-01-01T00:00:00.000Z', '2023-01-03T00:00:00.000Z')
      ).toBe(2)
      expect(
        safeDateDiff('2023-01-03T00:00:00.000Z', '2023-01-01T00:00:00.000Z')
      ).toBe(2)
    })
  })

  describe('numHoursBetweenDates', () => {
    it('returns 0 when either date is null', () => {
      expect(numHoursBetweenDates(null, '2023-01-01T00:00:00.000Z')).toBe(0)
      expect(numHoursBetweenDates('2023-01-01T00:00:00.000Z', null)).toBe(0)
      expect(numHoursBetweenDates(null, null)).toBe(0)
    })

    it('calculates rounded hours between dates', () => {
      expect(
        numHoursBetweenDates(
          '2023-01-01T00:00:00.000Z',
          '2023-01-01T02:30:00.000Z'
        )
      ).toBe(2.5)

      expect(
        numHoursBetweenDates(
          '2023-01-01T00:00:00.000Z',
          '2023-01-01T02:30:00.000Z',
          2
        )
      ).toBe(2)
    })

    it('uses default rounding interval when not specified', () => {
      expect(
        numHoursBetweenDates(
          '2023-01-01T00:00:00.000Z',
          '2023-01-01T02:30:00.000Z'
        )
      ).toBe(
        Math.round(2.5 / ETA_HOUR_ROUNDING_INTERVAL) *
          ETA_HOUR_ROUNDING_INTERVAL
      )
    })
  })

  describe('numDaysAndHoursBetweenDates', () => {
    it('returns 0 when either date is null', () => {
      expect(
        numDaysAndHoursBetweenDates(null, '2023-01-01T00:00:00.000Z')
      ).toEqual({
        numDaysMissed: 0,
        numHoursMissed: 0,
      })
      expect(
        numDaysAndHoursBetweenDates('2023-01-01T00:00:00.000Z', null)
      ).toEqual({
        numDaysMissed: 0,
        numHoursMissed: 0,
      })
      expect(numDaysAndHoursBetweenDates(null, null)).toEqual({
        numDaysMissed: 0,
        numHoursMissed: 0,
      })
    })

    it('calculates days and hours between dates', () => {
      expect(
        numDaysAndHoursBetweenDates(
          '2023-01-01T00:00:00.000Z',
          '2023-01-03T00:00:00.000Z'
        )
      ).toEqual({
        numDaysMissed: 2,
        numHoursMissed: 0,
      })
    })
  })
})
