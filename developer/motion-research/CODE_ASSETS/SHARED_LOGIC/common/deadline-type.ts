export const DeadlineTypes = ['ASAP', 'HARD', 'SOFT', 'NONE'] as const
export type DeadlineType = (typeof DeadlineTypes)[number]
