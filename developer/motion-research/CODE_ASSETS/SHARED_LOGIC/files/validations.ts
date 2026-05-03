export const FILENAME_VALID_REGEX = /^[^<>:"/\\|?*\x00-\x1F]+$/

export const FILENAME_MAX_LENGTH = 255

export function splitFilename(filename: string) {
  const lastDot = filename.lastIndexOf('.')

  // If there is no extension, return the filename and an empty string
  if (lastDot === -1) {
    return [filename, '']
  }

  return [filename.substring(0, lastDot), filename.substring(lastDot + 1)]
}

export function validateFilename(completeFilename: string): string[] {
  const errors = []

  const [filename] = splitFilename(completeFilename)

  if (filename.trim() === '') {
    errors.push('Name cannot be empty')
  }

  if (completeFilename.length > FILENAME_MAX_LENGTH) {
    errors.push(`Name cannot be longer than ${FILENAME_MAX_LENGTH} characters`)
  }

  if (filename.trim() !== '' && !FILENAME_VALID_REGEX.test(filename)) {
    errors.push('Name contains invalid characters')
  }

  return errors
}
