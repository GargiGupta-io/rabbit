import { type PMTaskStatusType } from '@motion/rpc-types/legacy'

export function getStatusColorClass(status?: Pick<PMTaskStatusType, 'color'>) {
  if (!status) return

  return (
    colorToNewColorClass[status.color] ??
    colorToNewColorClass[statusLegacyColorToNewColor[status.color]] ??
    colorToNewColorClass['#889096']
  )
}

function getStatusBorderColorClass(status?: Pick<PMTaskStatusType, 'color'>) {
  if (!status) return

  return (
    borderColorToNewColorClass[status.color] ??
    borderColorToNewColorClass[statusLegacyColorToNewColor[status.color]] ??
    borderColorToNewColorClass['#889096']
  )
}

function getStatusActiveBackgroundColorClass(
  status?: Pick<PMTaskStatusType, 'color'>
) {
  if (!status) return

  return (
    bgColorToActiveBgClass[status.color] ??
    bgColorToActiveBgClass[statusLegacyColorToNewColor[status.color]] ??
    bgColorToActiveBgClass['#889096']
  )
}

function getStatusBackgroundColorClass(
  status?: Pick<PMTaskStatusType, 'color'>
) {
  if (!status) return

  return (
    bgColorToNewColorClass[status.color] ??
    bgColorToNewColorClass[statusLegacyColorToNewColor[status.color]] ??
    bgColorToNewColorClass['#889096']
  )
}

export function getStatusColorClasses(
  status?: Pick<PMTaskStatusType, 'color'>
) {
  return {
    textColor: getStatusColorClass(status),
    bgColor: getStatusBackgroundColorClass(status),
    borderColor: getStatusBorderColorClass(status),
    activeColor: getStatusActiveBackgroundColorClass(status),
  }
}

// PMv1 colors to PMv2 colors
export const statusLegacyColorToNewColor: Record<string, string> = {
  '#A1A1A1': '#889096',
  '#F44E58': '#E5484D',
  '#FABD61': '#FFB224',
  '#1DC5CF': '#12A594',
  '#47C96B': '#30A66D',
  '#7C23B3': '#8E4EC6',
  '#F2762F': '#F76808',
  '#D01DA9': '#EA3E83',
}

const colorToNewColorClass: Record<string, string> = {
  // PMv2 colors
  '#889096': '!text-semantic-neutral-icon-default',
  '#c1c8cd': '!text-semantic-neutral-icon-subtle',
  '#889097': '!text-semantic-neutral-icon-strong',
  '#30A66D': '!text-semantic-success-icon-default',
  '#FFB224': '!text-semantic-warning-icon-default',
  '#E5484D': '!text-semantic-error-icon-default',
  '#EA3E83': '!text-semantic-pink-icon-default',
  '#05A2C2': '!text-semantic-cyan-icon-default',
  '#12A594': '!text-semantic-teal-icon-default',
  '#F76808': '!text-semantic-orange-icon-default',
  '#0091FF': '!text-semantic-blue-icon-default',
  '#8E4EC6': '!text-semantic-purple-icon-default',
}

const bgColorToNewColorClass: Record<string, string> = {
  // PMv2 colors
  '#889096': '!bg-semantic-neutral-icon-default',
  '#c1c8cd': '!bg-semantic-neutral-icon-subtle',
  '#889097': '!bg-semantic-neutral-icon-strong',
  '#30A66D': '!bg-semantic-success-icon-default',
  '#FFB224': '!bg-semantic-warning-icon-default',
  '#E5484D': '!bg-semantic-error-icon-default',
  '#EA3E83': '!bg-semantic-pink-icon-default',
  '#05A2C2': '!bg-semantic-cyan-icon-default',
  '#12A594': '!bg-semantic-teal-icon-default',
  '#F76808': '!bg-semantic-orange-icon-default',
  '#0091FF': '!bg-semantic-blue-icon-default',
  '#8E4EC6': '!bg-semantic-purple-icon-default',
}

const borderColorToNewColorClass: Record<string, string> = {
  // PMv2 colors
  '#889096': '!border-semantic-neutral-icon-default',
  '#c1c8cd': '!border-semantic-neutral-icon-subtle',
  '#889097': '!border-semantic-neutral-icon-strong',
  '#30A66D': '!border-semantic-success-icon-default',
  '#FFB224': '!border-semantic-warning-icon-default',
  '#E5484D': '!border-semantic-error-icon-default',
  '#EA3E83': '!border-semantic-pink-icon-default',
  '#05A2C2': '!border-semantic-cyan-icon-default',
  '#12A594': '!border-semantic-teal-icon-default',
  '#F76808': '!border-semantic-orange-icon-default',
  '#0091FF': '!border-semantic-blue-icon-default',
  '#8E4EC6': '!border-semantic-purple-icon-default',
}

const bgColorToActiveBgClass: Record<string, string> = {
  // PMv2 colors
  '#889096': '!bg-semantic-neutral-bg-active-default',
  '#c1c8cd': '!bg-semantic-neutral-bg-subtle',
  '#889097': '!bg-semantic-neutral-bg-strong',
  '#30A66D': '!bg-semantic-success-bg-active-default',
  '#FFB224': '!bg-semantic-warning-bg-active-default',
  '#E5484D': '!bg-semantic-error-bg-active-default',
  '#EA3E83': '!bg-semantic-pink-bg-active-default',
  '#05A2C2': '!bg-semantic-cyan-bg-active-default',
  '#12A594': '!bg-semantic-teal-bg-active-default',
  '#F76808': '!bg-semantic-orange-bg-active-default',
  '#0091FF': '!bg-semantic-blue-bg-active-default',
  '#8E4EC6': '!bg-semantic-purple-bg-active-default',
}

export const statusColorOptions = Object.keys(colorToNewColorClass)
