import { DateTime } from 'luxon'

import { type StageArg } from '../form-fields'

type ShiftProjectDatesArgs = {
  oldProjectStart: string
  newProjectStart: string
  projectDueDate: string
  stageDueDates: StageArg[]
}

type ShiftProjectDatesResult = {
  newProjectStart: string
  newProjectDueDate: string
  newStageDueDates: StageArg[]
}

const shiftISODate = (date: string, diff: number): string => {
  return DateTime.fromISO(date).plus({ days: diff }).toISODate()
}

export function shiftProjectDates({
  oldProjectStart,
  newProjectStart,
  projectDueDate,
  stageDueDates,
}: ShiftProjectDatesArgs): ShiftProjectDatesResult {
  const diff = DateTime.fromISO(newProjectStart).diff(
    DateTime.fromISO(oldProjectStart),
    'days'
  ).days

  const newProjectDueDate = shiftISODate(projectDueDate, diff)

  const newStageDueDates = stageDueDates.map((stage) => ({
    ...stage,
    dueDate: shiftISODate(stage.dueDate, diff),
  }))

  return {
    newProjectStart,
    newProjectDueDate,
    newStageDueDates,
  }
}
