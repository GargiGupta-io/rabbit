export function getEmptyDropzoneId(tasksPath: string) {
  return 'empty-' + tasksPath
}

export function isEmptyDropzoneId(dropzoneId: string): boolean {
  if (typeof dropzoneId !== 'string') {
    return false
  }

  return dropzoneId.startsWith('empty-')
}

export function parseDropzoneId(dropzoneId: string): number {
  if (typeof dropzoneId !== 'string') {
    return -1
  }

  const id = parseInt(dropzoneId.split('.')[1])

  return isNaN(id) ? -1 : id
}
