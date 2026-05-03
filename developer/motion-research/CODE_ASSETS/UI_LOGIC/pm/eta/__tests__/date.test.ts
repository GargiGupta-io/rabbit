import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { getEtaDateOptions } from '../date'

describe('eta - date tests', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-08-01')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  test('getEtaDateOptions returns the projected date, end of week, and end of month given a middle date', () => {
    // A Tuesday in the middle of the month
    const scheduledDate = DateTime.fromISO('2024-11-05')

    const fridayOfScheduledDate = DateTime.fromISO('2024-11-08').endOf('day')
    const lastFridayOfMonth = DateTime.fromISO('2024-11-29').endOf('day')

    const results = getEtaDateOptions(scheduledDate)

    expect(results.projectedDate).toEqual(scheduledDate)
    expect(results.projectedEoW).toEqual(fridayOfScheduledDate)
    expect(results.projectedEoM).toEqual(lastFridayOfMonth)
  })

  test('getEtaDateOptions returns following week for a Friday', () => {
    const scheduledDate = DateTime.fromISO('2024-11-08')
    const fridayOfScheduledDate = scheduledDate.plus({ week: 1 }).endOf('day')
    const lastFridayOfMonth = DateTime.fromISO('2024-11-29').endOf('day')

    const results = getEtaDateOptions(scheduledDate)

    expect(results.projectedDate).toEqual(scheduledDate)
    expect(results.projectedEoW).toEqual(fridayOfScheduledDate)
    expect(results.projectedEoM).toEqual(lastFridayOfMonth)
  })

  test('getEtaDateOptions returns the following week for a Saturday', () => {
    const scheduledDate = DateTime.fromISO('2024-11-09')
    const fridayOfScheduledDate = scheduledDate
      .plus({ week: 1 })
      .minus({ day: 1 })
      .endOf('day')
    const lastFridayOfMonth = DateTime.fromISO('2024-11-29').endOf('day')

    const results = getEtaDateOptions(scheduledDate)

    expect(results.projectedDate).toEqual(scheduledDate)
    expect(results.projectedEoW).toEqual(fridayOfScheduledDate)
    expect(results.projectedEoM).toEqual(lastFridayOfMonth)
  })

  test('getEtaDateOptions returns the following week for a Sunday', () => {
    const scheduledDate = DateTime.fromISO('2024-11-10')
    const fridayOfScheduledDate = scheduledDate.plus({ days: 5 }).endOf('day')
    const lastFridayOfMonth = DateTime.fromISO('2024-11-29').endOf('day')

    const results = getEtaDateOptions(scheduledDate)

    expect(results.projectedDate).toEqual(scheduledDate)
    expect(results.projectedEoW).toEqual(fridayOfScheduledDate)
    expect(results.projectedEoM).toEqual(lastFridayOfMonth)
  })

  test('getEtaDateOptions returns following months last day of the month if in last week', () => {
    const scheduledDate = DateTime.fromISO('2024-11-27')
    const fridayOfScheduledDate = DateTime.fromISO('2024-11-29').endOf('day')
    const lastFridayOfNextMonth = DateTime.fromISO('2024-12-31').endOf('day')

    const results = getEtaDateOptions(scheduledDate)

    expect(results.projectedDate).toEqual(scheduledDate)
    expect(results.projectedEoW).toEqual(fridayOfScheduledDate)
    expect(results.projectedEoM).toEqual(lastFridayOfNextMonth)
  })

  test('getEtaDateOptions handles last friday of month as scheduled date', () => {
    const scheduledDate = DateTime.fromISO('2024-11-29')
    const fridayOfScheduledDate = scheduledDate.plus({ week: 1 }).endOf('day')
    const lastFridayOfNextMonth = DateTime.fromISO('2024-12-27').endOf('day')

    const results = getEtaDateOptions(scheduledDate)

    expect(results.projectedDate).toEqual(scheduledDate)
    expect(results.projectedEoW).toEqual(fridayOfScheduledDate)
    expect(results.projectedEoM).toEqual(lastFridayOfNextMonth)
  })

  test('getEtaDateOptions ensures the EoW and EoM are not the same', () => {
    // A friday 1 week before the end of the month
    const scheduledDate = DateTime.fromISO('2024-12-20')
    const fridayOfScheduledDate = DateTime.fromISO('2024-12-27').endOf('day')
    const lastFridayOfNextMonth = DateTime.fromISO('2025-01-31').endOf('day')

    const results = getEtaDateOptions(scheduledDate)

    expect(results.projectedDate).toEqual(scheduledDate)
    expect(results.projectedEoW).toEqual(fridayOfScheduledDate)
    expect(results.projectedEoM).toEqual(lastFridayOfNextMonth)
  })

  test('getEtaDateOptions handles that EoW is also the EoM, EoM should be month after', () => {
    // A friday 1 week before the end of the month
    const scheduledDate = DateTime.fromISO('2025-01-27')
    const fridayOfScheduledDate = DateTime.fromISO('2025-01-31').endOf('day')
    const lastFridayOfNextMonth = DateTime.fromISO('2025-02-28').endOf('day')

    const results = getEtaDateOptions(scheduledDate)

    expect(results.projectedDate).toEqual(scheduledDate)
    expect(results.projectedEoW).toEqual(fridayOfScheduledDate)
    expect(results.projectedEoM).toEqual(lastFridayOfNextMonth)
  })
})
