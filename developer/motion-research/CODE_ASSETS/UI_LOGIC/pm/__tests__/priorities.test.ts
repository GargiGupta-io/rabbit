import { isValidPriority, priorityLabels } from '../priorities'

describe('Priority labels', () => {
  it('should return the correct priority', () => {
    expect(priorityLabels.get('ASAP')).toEqual('ASAP')
    expect(priorityLabels.get('HIGH')).toEqual('High')
    expect(priorityLabels.get('MEDIUM')).toEqual('Medium')
    expect(priorityLabels.get('LOW')).toEqual('Low')
  })
})

describe('isValidPriority', () => {
  it('should validate the input as priority', () => {
    expect(isValidPriority('ASAP')).toBe(true)
    expect(isValidPriority('HIGH')).toBe(true)
    expect(isValidPriority('MEDIUM')).toBe(true)
    expect(isValidPriority('LOW')).toBe(true)

    expect(isValidPriority('low')).toBe(false)
    expect(isValidPriority('sth else')).toBe(false)
  })
})
