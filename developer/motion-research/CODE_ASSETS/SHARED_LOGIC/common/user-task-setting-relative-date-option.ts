export const StartRelativeDateOption = [
  'today',
  'tomorrow',
  'next-week',
  'next-14-days',
  'next-month',
] as const

export type StartRelativeDateOption = (typeof StartRelativeDateOption)[number]

export const EndRelativeDateOption = [
  'today',
  'tomorrow',
  'this-week',
  'next-7-days',
  'next-week',
  'next-14-days',
  'next-30-days',
  'this-month',
  'next-month',
] as const

export type EndRelativeDateOption = (typeof EndRelativeDateOption)[number]

export type UserTaskSettingRelativeDateOption =
  | StartRelativeDateOption
  | EndRelativeDateOption
