const PREFIX = 'Schedule '

export function getSchedulingTaskTitle(title: string) {
  return `${PREFIX}${title}`
}

export function getEventTitleFromSchedulingTaskTitle(title: string) {
  if (title.toLowerCase().startsWith(PREFIX.toLowerCase())) {
    return title.slice(PREFIX.length)
  }

  return title
}
