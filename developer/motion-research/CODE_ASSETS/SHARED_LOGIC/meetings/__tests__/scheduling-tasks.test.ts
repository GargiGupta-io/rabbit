import {
  getEventTitleFromSchedulingTaskTitle,
  getSchedulingTaskTitle,
} from '../scheduling-tasks'

describe('getSchedulingTaskTitle', () => {
  it('returns the title prefixed with "Schedule "', () => {
    expect(getSchedulingTaskTitle('Foobar')).toBe('Schedule Foobar')

    expect(getSchedulingTaskTitle('foobar')).toBe('Schedule foobar')
  })
})

describe('getEventTitleFromSchedulingTaskTitle', () => {
  it('returns the title without the "Schedule " prefix', () => {
    expect(getEventTitleFromSchedulingTaskTitle('Schedule foobar')).toBe(
      'foobar'
    )

    expect(getEventTitleFromSchedulingTaskTitle('Schedule Foobar')).toBe(
      'Foobar'
    )
  })

  it('returns the title untouched', () => {
    expect(getEventTitleFromSchedulingTaskTitle('Foobar')).toBe('Foobar')
  })
})
