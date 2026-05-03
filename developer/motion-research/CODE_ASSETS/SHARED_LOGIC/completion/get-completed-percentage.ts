import { clamp } from '@motion/utils/math'

/*
 * Given something with completedDuration, duration, and canceledDuration, return the percentage that has been completed
 *
 * @param entity - the entity to calculate the percentage of
 * @returns the percentage of the entity that has been completed
 */
export const getCompletedPercentage = <
  T extends {
    canceledDuration: number
    completedDuration: number
    duration: number
  },
>({
  completedDuration,
  duration: totalDuration,
  canceledDuration,
}: T) => {
  const actualDurationToDo = totalDuration - canceledDuration

  let amountCompleted =
    actualDurationToDo && totalDuration
      ? Math.round((completedDuration / actualDurationToDo) * 100)
      : 0

  // Despite rounding, we want to ensure we don't give 0 or 100% if there is still work to be done
  if (amountCompleted === 100 && completedDuration < actualDurationToDo) {
    return 99
  } else if (amountCompleted === 0 && completedDuration > 0) {
    return 1
  }

  return clamp(amountCompleted, 0, 100)
}
