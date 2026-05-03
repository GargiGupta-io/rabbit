import { DateTime } from 'luxon'

import { type TaskFormFields } from '../form'

export const DEFAULT_SCHEDULE_ID = 'work'
export const CUSTOM_SCHEDULE_ID = 'custom'

export const TIME_FORMAT = 'h:mm a'

export function convertTimeValue(value: string) {
  return DateTime.fromFormat(value, TIME_FORMAT)
}

export const startConstraints = { start: '12:00 am', end: '11:30 pm' }
export const endConstraints = { start: '12:30 am', end: '11:59 pm' }

/**
 * All date values are time strings in the format 'h:mm a'
 * Returns the new values for timeStart, timeEnd, and idealTime for a given timeStart change
 */
export function handleTimeStartChange(
  newValue: TaskFormFields['timeStart'],
  { timeEnd, idealTime }: Pick<TaskFormFields, 'timeEnd' | 'idealTime'>
) {
  const changes = {
    timeStart: newValue,
    timeEnd: timeEnd,
    idealTime: idealTime,
  }

  if (newValue === startConstraints.end) {
    return {
      ...changes,
      timeEnd: endConstraints.end,
    }
  }

  const endTimeDate = convertTimeValue(timeEnd)
  const endConstraint = convertTimeValue(endConstraints.end)
  const valueDate = convertTimeValue(newValue)

  if (valueDate >= endTimeDate) {
    let newEndTime = valueDate.plus({ hours: 1 })
    // handle 11 pm edge case causing end time to be outside of constraints / less than start time
    if (newEndTime > endConstraint) {
      newEndTime = endConstraint
    }

    changes.timeEnd = newEndTime.toFormat(TIME_FORMAT).toLowerCase()
  }

  if (idealTime) {
    const idealTimeDate = convertTimeValue(idealTime)
    const startTimeDate = convertTimeValue(newValue)
    if (idealTimeDate < startTimeDate || idealTimeDate > endTimeDate) {
      changes.idealTime = null
    }
  }

  return changes
}

/**
 *  All date values are time strings in the format 'h:mm a'
 *  Returns the new values for timeStart, timeEnd, and idealTime for a given timeEnd change
 */
export function handleTimeEndChange(
  newValue: TaskFormFields['timeEnd'],
  { timeStart, idealTime }: Pick<TaskFormFields, 'timeStart' | 'idealTime'>
) {
  const changes = {
    timeEnd: newValue,
    timeStart,
    idealTime,
  }

  if (newValue === endConstraints.start) {
    changes.timeStart = startConstraints.start
    return changes
  }

  const valueDate = convertTimeValue(newValue)
  const startTimeDate = convertTimeValue(timeStart)
  if (valueDate <= startTimeDate) {
    const newStartTime = valueDate
      .minus({ hours: 1 })
      .toFormat(TIME_FORMAT)
      .toLowerCase()
    changes.timeStart = newStartTime
  }

  if (idealTime) {
    const idealTimeDate = convertTimeValue(idealTime)
    const endTimeDate = convertTimeValue(newValue)
    if (idealTimeDate < startTimeDate || idealTimeDate > endTimeDate) {
      changes.idealTime = null
    }
  }

  return changes
}
