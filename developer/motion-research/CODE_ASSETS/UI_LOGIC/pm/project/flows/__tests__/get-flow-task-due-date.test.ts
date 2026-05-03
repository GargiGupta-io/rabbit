import { getTaskDefaultDueDate } from '../../../task'
import { getFlowTaskDueDate } from '../get-flow-task-due-date'

describe('getFlowTaskDueDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-06-10'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns stage due date if it is after today', () => {
    const result = getFlowTaskDueDate('2023-06-15')

    expect(result).toBe('2023-06-15T23:59:59.999+00:00')
  })

  it('returns default due date if stage due date is before or equal to today', () => {
    const result = getFlowTaskDueDate('2023-06-09')

    expect(result).toBe(getTaskDefaultDueDate())
  })
})
