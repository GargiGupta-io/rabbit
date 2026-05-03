export type MSRecurrenceIndex = 'first' | 'second' | 'third' | 'fourth' | 'last'

export type OtherPatternType = 'absoluteMonthly' | 'relativeMonthly'

export type FixedPatternType =
  | 'yearly'
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'hourly'
  | 'minutely'
  | 'secondly'

export type MSDayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type MSRangeType = 'endDate' | 'numbered'

export type MSRecurrenceEndRange = { type: 'endDate'; endDate: string }
export type MSRecurrenceNumberedRange = {
  type: 'numbered'
  numberOfOccurrences: number
}

type CommonPatternOptions = {
  interval?: number
  firstDayOfWeek?: MSDayOfWeek
  daysOfWeek?: MSDayOfWeek[]
}

type AbsoluteMonthlyPattern = CommonPatternOptions & {
  type: 'absoluteMonthly'
  dayOfMonth: number[]
  interval?: number
}

type RelativeMonthlyPattern = CommonPatternOptions & {
  type: 'relativeMonthly'
  daysOfWeek: MSDayOfWeek[]
  index: MSRecurrenceIndex
  interval?: number
}

type OtherPattern = CommonPatternOptions & {
  type: FixedPatternType
  interval: number
}

export type MSRecurrencePattern =
  | AbsoluteMonthlyPattern
  | OtherPattern
  | RelativeMonthlyPattern

export type MSRecurrenceRange = {
  startDate?: string
} & (MSRecurrenceEndRange | MSRecurrenceNumberedRange)

export type MSRecurrence = {
  pattern: MSRecurrencePattern
  range: MSRecurrenceRange
}
