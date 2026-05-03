import {
  convertTimeValue,
  endConstraints,
  handleTimeEndChange,
  handleTimeStartChange,
  startConstraints,
  TIME_FORMAT,
} from '../schedules' // Adjust the import path accordingly

describe('convertTimeValue', () => {
  it('should convert time string to DateTime object', () => {
    const timeString = '3:45 PM'
    const result = convertTimeValue(timeString)

    expect(result.toFormat(TIME_FORMAT)).toBe(timeString)
  })
})

describe('handleTimeStartChange', () => {
  it('should update timeEnd if timeStart is at the end of start constraints', () => {
    const newValue = startConstraints.end
    const result = handleTimeStartChange(newValue, {
      timeEnd: '10:00 pm',
      idealTime: '9:00 pm',
    })

    expect(result.timeEnd).toBe(endConstraints.end)
  })

  it('should update timeEnd to one hour after new timeStart if new timeStart is after timeEnd', () => {
    const newValue = '10:00 pm'
    const result = handleTimeStartChange(newValue, {
      timeEnd: '9:00 pm',
      idealTime: '9:00 pm',
    })

    expect(result.timeEnd).toBe('11:00 pm')
  })

  it('should update timeEnd to 11:59pm after if new timeStart is in 11-11:30pm', () => {
    const newValue = '11:00 pm'
    const result = handleTimeStartChange(newValue, {
      timeEnd: '10:00 pm',
      idealTime: '9:00 pm',
    })

    const otherValue = '11:15 pm'
    const otherResult = handleTimeStartChange(otherValue, {
      timeEnd: '10:00 pm',
      idealTime: '9:00 pm',
    })

    const endValue = '11:30 pm'
    const endResult = handleTimeStartChange(endValue, {
      timeEnd: '10:00 pm',
      idealTime: '9:00 pm',
    })

    expect(result.timeEnd).toBe('11:59 pm')
    expect(otherResult.timeEnd).toBe('11:59 pm')
    expect(endResult.timeEnd).toBe('11:59 pm')
  })

  it('should set idealTime to null if idealTime is out of bounds', () => {
    const newValue = '10:00 pm'
    const result = handleTimeStartChange(newValue, {
      timeEnd: '11:00 pm',
      idealTime: '9:00 pm',
    })

    expect(result.idealTime).toBeNull()
  })

  it('should not change idealTime if it is within bounds', () => {
    const newValue = '9:00 pm'
    const result = handleTimeStartChange(newValue, {
      timeEnd: '10:00 pm',
      idealTime: '9:30 pm',
    })

    expect(result.idealTime).toBe('9:30 pm')
  })
})

describe('handleTimeEndChange', () => {
  it('should update timeStart if timeEnd is at the start of end constraints', () => {
    const newValue = endConstraints.start
    const result = handleTimeEndChange(newValue, {
      timeStart: '1:00 am',
      idealTime: '2:00 am',
    })

    expect(result.timeStart).toBe(startConstraints.start)
  })

  it('should update timeStart to one hour before new timeEnd if new timeEnd is before timeStart', () => {
    const newValue = '1:00 am'
    const result = handleTimeEndChange(newValue, {
      timeStart: '2:00 am',
      idealTime: '3:00 am',
    })

    expect(result.timeStart).toBe('12:00 am')
  })

  it('should set idealTime to null if idealTime is out of bounds', () => {
    const newValue = '10:00 pm'
    const result = handleTimeEndChange(newValue, {
      timeStart: '9:00 pm',
      idealTime: '8:00 pm',
    })

    expect(result.idealTime).toBeNull()
  })

  it('should not change idealTime if it is within bounds', () => {
    const newValue = '10:00 pm'
    const result = handleTimeEndChange(newValue, {
      timeStart: '9:00 pm',
      idealTime: '9:30 pm',
    })

    expect(result.idealTime).toBe('9:30 pm')
  })
})
