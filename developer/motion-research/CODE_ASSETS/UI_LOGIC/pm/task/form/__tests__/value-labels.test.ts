import {
  getDateButtonText,
  getDeadlineText,
  getStartDateText,
} from '../value-labels'

describe('getDeadlineText', () => {
  it('should show ASAP for ASAP tasks', () => {
    const actual = getDeadlineText({
      priorityLevel: 'ASAP',
    })

    expect(actual).toEqual('ASAP')
  })

  it('should show None for no due date', () => {
    const actual = getDeadlineText({
      priorityLevel: 'MEDIUM',
    })

    expect(actual).toEqual('None')
  })

  it('should show Date', () => {
    const actual = getDeadlineText({
      priorityLevel: 'MEDIUM',
      dueDate: '2023-12-08T12:00:00.000Z',
    })

    expect(actual).toEqual('Fri Dec 8, 2023')
  })
})

describe('getStartDateText', () => {
  it('should show ASAP for ASAP tasks', () => {
    const actual = getStartDateText({
      priorityLevel: 'ASAP',
    })

    expect(actual).toEqual('ASAP')
  })

  it('should show None for no due date', () => {
    const actual = getStartDateText({
      priorityLevel: 'MEDIUM',
    })

    expect(actual).toEqual('None')
  })

  it('should show Date', () => {
    const actual = getStartDateText({
      priorityLevel: 'MEDIUM',
      startDate: '2023-12-08',
    })

    expect(actual).toEqual('Fri Dec 8, 2023')
  })
})

describe('getDateButtonText()', () => {
  const placeholder = 'None'

  it('should return "None" if prefix and date are both nullish', () => {
    const result = getDateButtonText(null, { placeholder })

    expect(result).toBe('None')
  })

  it('should return placeholder if date is null', () => {
    const result = getDateButtonText(null, { prefix: 'Prefix', placeholder })

    expect(result).toBe(placeholder)
  })

  it('should return formatted string with prefix and date object', () => {
    const prefix = 'Due:'
    const date = new Date('2023-12-01')
    const result = getDateButtonText(date, { prefix, placeholder })

    expect(result).toBe('Due: Fri Dec 1, 2023')
  })

  it('should return formatted string with with prefix if an ISO string is passed in', () => {
    const prefix = 'Due:'
    const date = '2023-12-01T08:00:00.000Z'
    const result = getDateButtonText(date, { prefix, placeholder })

    expect(result).toBe('Due: Fri Dec 1, 2023')
  })

  it('should return formatted string with only date if prefix is null', () => {
    const date = new Date('2023-12-01')
    const result = getDateButtonText(date, { placeholder })

    expect(result).toBe('Fri Dec 1, 2023')
  })
})
