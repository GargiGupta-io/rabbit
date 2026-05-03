export const StatusType = {
  DEFAULT: 'DEFAULT',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const

export type StatusType = (typeof StatusType)[keyof typeof StatusType]

export const AutoScheduleSetting = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
  FORCED: 'FORCED',
} as const

export type AutoScheduleSetting =
  (typeof AutoScheduleSetting)[keyof typeof AutoScheduleSetting]

type StatusLike = {
  type: string | null
  autoScheduleSetting: string
}

export const isSystemStatus = (
  status:
    | {
        isSystemStatus: boolean
      }
    | undefined
): boolean => {
  return status?.isSystemStatus ?? false
}

export const isCompletedStatus = (
  status: Pick<StatusLike, 'type'> | undefined
): boolean => {
  return status?.type === StatusType.COMPLETED
}

export const isDefaultStatus = (
  status: Pick<StatusLike, 'type'> | undefined
): boolean => {
  return status?.type === StatusType.DEFAULT
}

export const isCanceledStatus = (
  status: Pick<StatusLike, 'type'> | undefined
): boolean => {
  return status?.type === StatusType.CANCELED
}

export const isResolvedStatus = (
  status: Pick<StatusLike, 'type'> | undefined
): boolean => {
  return (
    status?.type === StatusType.COMPLETED ||
    status?.type === StatusType.CANCELED
  )
}

export const findCompletedStatus = <T extends Pick<StatusLike, 'type'>>(
  statuses?: T[]
): T | undefined => {
  return statuses ? statuses.find(isCompletedStatus) : undefined
}

export const findDefaultStatus = <T extends Pick<StatusLike, 'type'>>(
  statuses?: T[]
): T | undefined => {
  return statuses ? statuses.find(isDefaultStatus) : undefined
}

export const findCanceledStatus = <T extends Pick<StatusLike, 'type'>>(
  statuses?: T[]
): T | undefined => {
  return statuses ? statuses.find(isCanceledStatus) : undefined
}

export const isAutoScheduledStatus = (
  status: Pick<StatusLike, 'autoScheduleSetting'> | undefined
): boolean => {
  return (
    status?.autoScheduleSetting === AutoScheduleSetting.ENABLED ||
    status?.autoScheduleSetting === AutoScheduleSetting.FORCED
  )
}
