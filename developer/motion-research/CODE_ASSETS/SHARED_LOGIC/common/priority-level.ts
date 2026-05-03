export const PriorityLevels = ['ASAP', 'HIGH', 'MEDIUM', 'LOW'] as const
export type PriorityLevel = (typeof PriorityLevels)[number]
