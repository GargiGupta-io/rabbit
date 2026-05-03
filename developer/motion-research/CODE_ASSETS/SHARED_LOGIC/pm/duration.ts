import { isDefined } from '@motion/utils/guards'

import {
  Duration,
  type DurationLike,
  type DurationLikeObject,
  type DurationObjectUnits,
  type DurationUnit,
} from 'luxon'

export const MIN_DURATION_WITH_CHUNKS = 30
export const MIN_DURATION_DEFAULT_NO_CHUNKS_UNDER = 120
export const MAX_DURATION_WITH_NO_CHUNKS = 480
export const NO_CHUNK_DURATION = null
export const DEFAULT_DURATION = 30
export const NO_DURATION = null
export const SHORT_TASK_DURATION = 0
export const MAX_TASK_DURATION = 2400
export const ONE_DAY_DURATION = 60 * 24

function normalizeMinDurations(min: number): DurationObjectUnits {
  return Duration.fromObject({
    hours: 0,
    minutes: min,
  })
    .normalize()
    .toObject()
}

export const formatDurationTime = (min: number | null) => {
  let { hours = 0, minutes = 0 } = normalizeMinDurations(min ?? 0)

  hours = Math.round(hours)
  minutes = Math.round(minutes)

  if (hours < 1) {
    return `${minutes} min`
  }

  if (minutes < 1) {
    return hours === 1 ? `1 hour` : `${hours} hours`
  }

  return `${hours}h ${minutes}m`
}

// Formats duration in minutes according to the spec:
// <1h: show in minutes (e.g. 30m)
// 1h <= duration < 24h: show in hours, 1 decimal (e.g. 1.5h)
// >=24h: show in days, 1 decimal (e.g. 2.1d)
// Rounds to 1 decimal point
export function formatDurationToDay(minutes: number | null): string {
  if (minutes === NO_DURATION) return 'TBD'
  if (minutes === SHORT_TASK_DURATION) return 'Reminder'

  if (minutes < 60) {
    return `${minutes}m`
  }
  if (minutes < ONE_DAY_DURATION) {
    const hours = minutes / 60
    const hoursFixed = hours.toFixed(1)

    const parsedHours = hoursFixed.endsWith('.0')
      ? `${parseInt(hoursFixed, 10)}h`
      : `${hoursFixed}h`

    if (parsedHours === '24h') {
      return '1d'
    }

    return parsedHours
  }

  const days = minutes / ONE_DAY_DURATION
  const daysFixed = days.toFixed(1)
  return daysFixed.endsWith('.0')
    ? `${parseInt(daysFixed, 10)}d`
    : `${daysFixed}d`
}

function getDurationFromDurationLikeValue(duration: DurationLike): Duration {
  if (typeof duration === 'number') {
    return Duration.fromObject({ minutes: duration })
  }

  if (duration instanceof Duration) {
    return duration
  }

  if (typeof duration === 'object') {
    return Duration.fromObject(duration as DurationLikeObject)
  }

  throw new Error('Invalid duration value')
}

const DURATION_ABBREVIATED_LABELS: Partial<Record<DurationUnit, string>> = {
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
} as const

const DURATION_UNITS = ['days', 'hours', 'minutes', 'seconds'] as DurationUnit[]
const DEFAULT_DURATION_UNITS = ['hours', 'minutes', 'seconds'] as DurationUnit[]

/**
 * Returns a formatted duration string in the format "1h 23m 45s"
 *
 * If any of the units are 0 or undefined, they will be omitted from the formatted string
 *
 * @param durationLikeValue - A duration like object (number, object or Duration object) to format.
 * @param units - The units to include in the formatted string.
 * @param onlyMaxUnit - If true, only the maximum unit will be included in the formatted string.
 * @return The formatted duration string.
 */
export function formatDurationToShort(
  durationLikeValue: DurationLike | null,
  units = DEFAULT_DURATION_UNITS,
  onlyMaxUnit = false
): string {
  if (durationLikeValue == null) return '0m'

  const duration = getDurationFromDurationLikeValue(durationLikeValue)
    .normalize()
    .shiftTo(...units)

  units.sort((a, b) => DURATION_UNITS.indexOf(a) - DURATION_UNITS.indexOf(b))

  const formattedParts = []
  for (const unit of units) {
    const value = Math.round(duration.get(unit) ?? 0)
    if (value > 0) {
      const label = DURATION_ABBREVIATED_LABELS[unit]
      formattedParts.push(`${value}${label}`)
      if (onlyMaxUnit) break
    }
  }

  if (formattedParts.length === 0) {
    return '0m'
  }

  return formattedParts.join(' ')
}

export function formatDurationToTime(totalMinutes: number | null) {
  const { hours = 0, minutes = 0 } = normalizeMinDurations(totalMinutes ?? 0)

  const hourText = hours.toString().padStart(2, '0')
  const minuteText = minutes.toString().padStart(2, '0')

  return `${hourText}:${minuteText}`
}

/**
 * Formats a duration in minutes to a short string.
 * For example, 30 minutes becomes "30m", 60 minutes becomes "1h", and 90 minutes becomes "1h 30m".
 * NO_DURATION (null) becomes "TBD" and SHORT_TASK_DURATION (0) becomes "Reminder".
 * @param minutes
 * @returns
 */
export function formatToShortTaskDuration(minutes: number | null) {
  if (minutes === NO_DURATION) return 'TBD'
  if (minutes === SHORT_TASK_DURATION) return 'Reminder'

  return formatDurationToShort(minutes)
}

/**
 * Formats a duration in minutes to a short string.
 * For example, 30 minutes becomes "30 min", 60 minutes becomes "1 hour", and 90 minutes becomes "1 hour 30 min".
 * NO_DURATION (null) becomes "To Be Determined" and SHORT_TASK_DURATION (0) becomes "Reminder".
 * @param minutes
 * @returns
 */
export function formatToTaskDuration(minutes: number | null) {
  if (minutes === NO_DURATION) return 'To Be Determined'
  if (minutes === SHORT_TASK_DURATION) return 'Reminder'

  return formatDurationTime(minutes)
}

const CHUNK_DURATIONS = [15, 30, 45, 60, 90, 120, 240, 360].map((time) => ({
  label: formatDurationTime(time),
  value: time,
}))

const durations = [SHORT_TASK_DURATION, 15, 30, 45, 60, 120, 240, 480, 960]

const ADD_TIME_MINUTES_OPTIONS = [15, 30, 45, 60, 90, 120] as const

export function getAvailableAddTimeOptions(currentTaskDuration: number | null) {
  return ADD_TIME_MINUTES_OPTIONS.filter(
    (opt) => (currentTaskDuration ?? 0) + opt <= MAX_TASK_DURATION
  )
}

export const timeDurations = durations.map((time) => ({
  label: formatDurationTime(time),
  value: time,
}))

const taskDurations = durations.map((time) => ({
  label: formatToTaskDuration(time),
  value: time,
}))

type DurationOptions = {
  includeNone?: boolean
}
export function getDurations(options: DurationOptions = {}) {
  const { includeNone = false } = options

  if (includeNone) return taskDurations

  return taskDurations.filter((d) => d.value !== NO_DURATION)
}

export const createDurationsFromText = (text: string) => {
  const choices = Array.from(new Set(parseDurationText(text))).filter(
    // Only allow anything under NAX (16 hours (960 min))
    (time) => time <= MAX_TASK_DURATION
  )

  return choices.map((time) => ({
    label: formatDurationTime(time),
    value: time,
  }))
}

export function getChunkDurations(duration: number | null) {
  if (duration == null || duration < MIN_DURATION_WITH_CHUNKS) return []

  if (duration <= MAX_DURATION_WITH_NO_CHUNKS) {
    return [
      { label: 'No Chunks', value: NO_CHUNK_DURATION },
      ...CHUNK_DURATIONS.filter((chunk) => chunk.value < duration),
    ]
  }

  return CHUNK_DURATIONS.filter((chunk) => chunk.value < duration)
}

export function getDefaultChunkDuration(duration: number | null) {
  if (duration === null || duration < MIN_DURATION_DEFAULT_NO_CHUNKS_UNDER) {
    return NO_CHUNK_DURATION
  }

  if (duration < 960) {
    return 60
  }

  return 120
}

export function getValidMinimumDuration(
  duration: number | null,
  minimumDuration: number | null
) {
  if (minimumDuration == null) {
    return minimumDuration
  }

  if (duration != null && minimumDuration < duration) {
    return minimumDuration
  }

  // only override if the minimum duration is greater than or equal to duration
  return getDefaultChunkDuration(duration)
}

/**
 * Returns an array of possible durations in minutes.
 *
 * When no value can be ascertained, return an empty array
 *
 * if the value is ambiguous, return the number in both minutes and hours
 *
 *   `parseDurationText("2 hours") // [120]`
 *   `parseDurationText("2") // [2, 120]`
 */
export const parseDurationText = (text: string) => {
  const parts = text?.match(/\d+\.?\d*/g)?.map(parseFloat)
  const implyHours = text.includes('h')
  const implyMinutes = text.includes('m')

  if (!parts?.length) {
    return []
  }

  let minutes = 0
  let maybeHours

  if (parts.length === 1) {
    // if we didnt imply hours, we want to return minutes
    minutes = !implyHours ? parts[0] : parts[0] * 60

    // if we also didn't imply minutes, throw in a result for hours
    if (!implyMinutes && !implyHours) {
      maybeHours = parts[0] * 60
    }
  } else {
    minutes = parts[1] + parts[0] * 60
  }

  return [minutes, maybeHours].filter(isDefined).map(Math.floor)
}
