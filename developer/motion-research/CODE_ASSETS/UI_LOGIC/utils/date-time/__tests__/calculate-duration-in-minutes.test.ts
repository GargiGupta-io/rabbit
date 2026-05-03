import { calculateDurationInMinutes } from '../calculate-duration-in-minutes'

describe('calculateDurationInMinutes', () => {
  it('It always returns an integer, even if the times differ by a microsecond', () => {
    expect(
      calculateDurationInMinutes(
        '2024-02-04T16:15:12.903-05:00',
        '2024-02-04T18:15:12.904-05:00'
      )
    ).toBe(120)
    expect(
      calculateDurationInMinutes(
        '2024-02-04T16:15:12.903-05:00',
        '2024-02-04T18:15:12.902-05:00'
      )
    ).toBe(120)
  })

  it('It handles large durations', () => {
    expect(
      calculateDurationInMinutes(
        '2024-02-04T16:15:12.903-05:00',
        '2024-02-06T18:15:12.904-05:00'
      )
    ).toBe(3000)
  })

  it('It returns null if dates are not valid', () => {
    expect(
      calculateDurationInMinutes('not-valid', '2024-02-04T18:15:12.902-05:00')
    ).toBe(null)
  })
})
