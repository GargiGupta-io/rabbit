import {
  type DeadlineType,
  PMItemType,
  type PMTaskType,
  type SomedayChoice,
  SomedayChoiceText,
  SortByDirection,
} from '@motion/rpc-types/legacy'

import { DateTime } from 'luxon'

export function isTaskDisplayable(task: PMTaskType, userId: string) {
  if (task.itemType !== PMItemType.task) {
    return false
  }

  if (!task.isAutoScheduled) {
    return false
  }

  const isAssignedToUser = task.assigneeUserId === userId

  return Boolean(
    isAssignedToUser &&
      task.scheduledStart &&
      task.scheduledEnd &&
      !task.isUnfit
  )
}

export function isChunkDisplayable(
  chunk: PMTaskType,
  parentTask: PMTaskType,
  userId: string
) {
  if (parentTask.itemType !== PMItemType.task) {
    return false
  }

  if (!chunk.isAutoScheduled) {
    return false
  }

  const isAssignedToUser = parentTask.assigneeUserId === userId

  return Boolean(
    isAssignedToUser &&
      chunk.scheduledStart &&
      chunk.scheduledEnd &&
      !chunk.isUnfit
  )
}

export const somedayChoices: SomedayChoice[] = [
  {
    deadlineIncrement: 7,
    relevanceRange: 14,
    text: SomedayChoiceText.ONE_WEEK,
  },
  {
    deadlineIncrement: 21,
    relevanceRange: 14,
    text: SomedayChoiceText.TWO_TO_THREE_WEEKS,
  },
  {
    deadlineIncrement: 45,
    relevanceRange: 14,
    text: SomedayChoiceText.ONE_TO_TWO_MONTHS,
  },
  {
    deadlineIncrement: 135,
    relevanceRange: 45,
    text: SomedayChoiceText.THREE_TO_SIX_MONTHS,
  },
]

export const somedayChoicesMap: Record<SomedayChoiceText, SomedayChoice> = {
  [SomedayChoiceText.ONE_WEEK]: somedayChoices[0],
  [SomedayChoiceText.TWO_TO_THREE_WEEKS]: somedayChoices[1],
  [SomedayChoiceText.ONE_TO_TWO_MONTHS]: somedayChoices[2],
  [SomedayChoiceText.THREE_TO_SIX_MONTHS]: somedayChoices[3],
}

export function dateToSomeday(
  date: DateTime,
  currentDate: DateTime = DateTime.now()
) {
  if (currentDate > date) {
    return somedayChoicesMap[SomedayChoiceText.ONE_WEEK]
  }

  const futureChoices = somedayChoices.filter(
    (choice) => currentDate > date.minus({ days: choice.deadlineIncrement })
  )

  const choiceText = futureChoices.length
    ? futureChoices[0].text
    : SomedayChoiceText.THREE_TO_SIX_MONTHS

  return somedayChoicesMap[choiceText]
}

export function somedayToNewStartAndDueDate(
  choice: SomedayChoice,
  currentDate: DateTime = DateTime.now()
): Pick<PMTaskType, 'dueDate' | 'startDate'> {
  const endDate = currentDate.plus({ days: choice.deadlineIncrement })
  const startDate =
    choice.relevanceRange < choice.deadlineIncrement
      ? endDate.minus({ days: choice.relevanceRange })
      : currentDate

  return {
    dueDate: endDate.toISODate(),
    startDate: startDate.toISODate(),
  }
}

function getDeadlineTypeSortOrder(deadlineType?: DeadlineType): number {
  switch (deadlineType) {
    case undefined:
      return 0
    case 'SOFT':
      return 1
    case 'HARD':
      return 2
    default:
      return 3
  }
}

export const sortByDeadlineType = (
  itemA: Pick<PMTaskType, 'deadlineType'>,
  itemB: Pick<PMTaskType, 'deadlineType'>,
  sortDirection: SortByDirection
) => {
  const itemAValue = getDeadlineTypeSortOrder(itemA.deadlineType)
  const itemBValue = getDeadlineTypeSortOrder(itemB.deadlineType)

  if (sortDirection === SortByDirection.DESC) {
    return itemBValue - itemAValue
  }
  return itemAValue - itemBValue
}

type CompareDateFunctionArg = {
  dueDate?: string | null
  createdTime?: Date | string
  scheduledStart?: string | null
}

/**
 * Returns comparator function to sort tasks or projects by date
 *
 */
export const getCompareDateFn = <T extends CompareDateFunctionArg>(
  field: 'createdTime' | 'dueDate' | 'scheduledStart' = 'dueDate',
  sortDirection: 'ASC' | 'DESC' = 'DESC',
  sortNullLast = false
) => {
  return (itemA: T, itemB: T, sortDir: 'ASC' | 'DESC' = sortDirection) => {
    const aDateString = itemA[field] as unknown as string
    const bDateString = itemB[field] as unknown as string

    const aDate = (
      aDateString
        ? new Date(aDateString)
        : new Date(sortNullLast ? '2038-01-01' : 1)
    ).getTime()
    const bDate = (
      bDateString
        ? new Date(bDateString)
        : new Date(sortNullLast ? '2038-01-01' : 1)
    ).getTime()

    if (aDateString && bDateString && aDate === bDate) {
      return 0
    }

    const sortValue =
      aDate > bDate
        ? 1
        : aDate < bDate
          ? -1
          : (itemB as any).itemType === PMItemType.project
            ? 1
            : -1
    return sortDir === 'ASC' ? sortValue : -sortValue
  }
}
