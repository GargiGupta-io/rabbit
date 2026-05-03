import { getStatusColorClass, getStatusColorClasses } from '../statuses'

describe('getStatusColorClass', () => {
  test('getStatusColorClass returns color className for given status', () => {
    const testStatus = {
      name: 'NOT_STARTED',
      color: '#A1A1A1',
    }

    const result = getStatusColorClass(testStatus)

    expect(result).not.toEqual(testStatus.color)
    expect(result).toEqual('!text-semantic-neutral-icon-default')
  })

  test('undefined status returns undefined', () => {
    const result = getStatusColorClass(undefined)

    expect(result).toBeUndefined()
  })

  test('falls back to className for status.color when status is CUSTOM', () => {
    const testStatus = {
      name: 'NOT_STARTED',
      color: '#A1A1A1',
    }

    const result = getStatusColorClass(testStatus)

    expect(result).toEqual('!text-semantic-neutral-icon-default')
  })
})

describe('getStatusColorClasses', () => {
  test('should return the correct color classes for PMv2 status color', () => {
    const status = { color: '#30A66D' } // Replace with an actual status color

    const result = getStatusColorClasses(status)

    expect(result).toEqual({
      activeColor: '!bg-semantic-success-bg-active-default',
      textColor: '!text-semantic-success-icon-default',
      bgColor: '!bg-semantic-success-icon-default',
      borderColor: '!border-semantic-success-icon-default',
    })
  })

  test('should return the correct color classes for PMv1 status color', () => {
    const status = { color: '#7C23B3' } // Replace with an actual status color

    const result = getStatusColorClasses(status)

    expect(result).toEqual({
      activeColor: '!bg-semantic-purple-bg-active-default',
      textColor: '!text-semantic-purple-icon-default',
      bgColor: '!bg-semantic-purple-icon-default',
      borderColor: '!border-semantic-purple-icon-default',
    })
  })

  test('should return undefined for all classes when status is not provided', () => {
    const result = getStatusColorClasses()

    expect(result).toEqual({
      activeColor: undefined,
      textColor: undefined,
      bgColor: undefined,
      borderColor: undefined,
    })
  })
})
