const extToMime: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  txt: 'text/plain',
  json: 'application/json',
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  mp4: 'video/mp4',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  zip: 'application/zip',
}

/**
 * Determines MIME type from URL extension
 * @param pathname - The pathname of the URL
 * @returns The MIME type of the URL
 */
export function mimeTypeFromFilename(
  filename: string,
  defaultMimeType: string = 'application/octet-stream'
): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extToMime[extension || ''] || defaultMimeType
}

export function extensionFromMimeType(
  mimeType: string,
  defaultExtension: string = 'bin'
): string {
  return (
    Object.keys(extToMime).find((key) => extToMime[key] === mimeType) ||
    defaultExtension
  )
}

export function generateFilenameFromMimeType(mimeType: string): string {
  const extension = extensionFromMimeType(mimeType)
  const timestamp = Date.now()
  return `${mimeType}_${timestamp}.${extension}`
}
