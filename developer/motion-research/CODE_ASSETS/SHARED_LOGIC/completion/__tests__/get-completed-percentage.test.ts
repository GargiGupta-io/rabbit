import { getCompletedPercentage } from '../get-completed-percentage'

describe('getCompletedPercentage', () => {
  it('should grab percentage correctly if there is no canceledDuration', () => {
    const stage = {
      canceledDuration: 0,
      completedDuration: 100,
      duration: 100,
    }
    const result = getCompletedPercentage(stage)

    expect(result).toEqual(100)
  })

  it('should reduce percentage if there is a canceledDuration', () => {
    const stage = {
      canceledDuration: 10,
      completedDuration: 90,
      duration: 100,
    }
    const result = getCompletedPercentage(stage)

    expect(result).toEqual(100)
  })

  it('should not return 0 if there is work done', () => {
    const stage = {
      canceledDuration: 0,
      completedDuration: 1,
      duration: 1000,
    }
    const result = getCompletedPercentage(stage)

    expect(result).toEqual(1)
  })

  it('should not return 100 if there is work left', () => {
    const stage = {
      canceledDuration: 0,
      completedDuration: 999,
      duration: 1000,
    }
    const result = getCompletedPercentage(stage)

    expect(result).toEqual(99)
  })

  it('should never return more than 100', () => {
    const stage = {
      canceledDuration: 0,
      completedDuration: 110,
      duration: 100,
    }
    const result = getCompletedPercentage(stage)

    expect(result).toEqual(100)
  })

  it('should never return less than 0', () => {
    const stage = {
      canceledDuration: 0,
      completedDuration: -10,
      duration: 100,
    }
    const result = getCompletedPercentage(stage)

    expect(result).toEqual(0)
  })
})
