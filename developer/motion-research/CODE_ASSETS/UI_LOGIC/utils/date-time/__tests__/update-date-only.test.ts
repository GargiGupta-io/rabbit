import { DateTime } from 'luxon'

import { updateDateOnly } from '../update-date-only'

describe('updateDateOnly', () => {
  it('updates to a future date', () => {
    const oldDateTime = DateTime.fromISO('2023-12-17T12:49:13.131-08:00')
    const newDateTime = DateTime.fromISO('2023-12-24T04:49:13.131-08:00')

    const converted = updateDateOnly(oldDateTime, newDateTime)

    expect(converted.toMillis()).toBe(
      DateTime.fromISO('2023-12-24T12:49:13.131-08:00').toMillis()
    )
  })

  it('updates to the pre-existing date', () => {
    const oldDateTime = DateTime.fromISO(
      '2023-12-17T18:49:13.131-08:00'
    ).setZone('America/Los_Angeles')
    const newDateTime = DateTime.fromISO(
      '2023-12-17T00:00:00.000-08:00'
    ).setZone('America/Los_Angeles')

    const converted = updateDateOnly(oldDateTime, newDateTime)

    expect(converted.toMillis()).toBe(oldDateTime.toMillis())
  })
})
