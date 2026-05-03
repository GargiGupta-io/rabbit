import { type RecurringTask } from '@motion/rpc-types/legacy'

export const RecurringTaskMock1: Partial<RecurringTask> = {
  days: ['FR'],
  description: 'Do the payroll',
  duration: 30,
  frequency: 'biweekly',
  id: 'recurringTask1',
  name: 'Payroll',
  recurrenceMeta: '1st__week__specific_days',
}

export const RecurringTaskMock2: Partial<RecurringTask> = {
  days: ['MO', 'WE', 'FR'],
  duration: 30,
  frequency: 'daily',
  id: 'recurringTask2',
  name: 'Go through job applications',
  recurrenceMeta: 'specific_day',
}
