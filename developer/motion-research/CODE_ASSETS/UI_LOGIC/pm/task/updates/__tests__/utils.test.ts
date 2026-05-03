import { isChangedFieldName } from '../utils'

describe('isChangedFieldName', () => {
  it('returns true for valid field names', () => {
    expect(isChangedFieldName('type')).toBe(true)
    expect(isChangedFieldName('isAutoScheduled')).toBe(true)
    expect(isChangedFieldName('startDate')).toBe(true)
    expect(isChangedFieldName('dueDate')).toBe(true)
    expect(isChangedFieldName('assigneeUserId')).toBe(true)
    expect(isChangedFieldName('priorityLevel')).toBe(true)
    expect(isChangedFieldName('statusId')).toBe(true)
    expect(isChangedFieldName('duration')).toBe(true)
    expect(isChangedFieldName('completedDuration')).toBe(true)
    expect(isChangedFieldName('workspaceId')).toBe(true)
  })

  it('returns false for invalid field names', () => {
    expect(isChangedFieldName('foo')).toBe(false)
    expect(isChangedFieldName('bar')).toBe(false)
    expect(isChangedFieldName('name')).toBe(false)
  })
})
