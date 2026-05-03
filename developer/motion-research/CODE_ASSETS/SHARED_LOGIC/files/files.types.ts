export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/avif',
  'image/svg+xml',
] as const

export const SUPPORTED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
] as const

export const SUPPORTED_OFFICE_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
] as const

export const SUPPORTED_MISC_MIME_TYPES = [
  'text/plain',
  'application/zip',
] as const

export const SUPPORTED_MIME_TYPES = [
  ...SUPPORTED_IMAGE_MIME_TYPES,
  ...SUPPORTED_VIDEO_MIME_TYPES,
  ...SUPPORTED_OFFICE_MIME_TYPES,
  ...SUPPORTED_MISC_MIME_TYPES,
] as const

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number]

export const SUPPORTED_AI_MIME_TYPES: SupportedMimeType[] = [
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'text/csv',
  'text/plain',
]

export type FileData = {
  data: Buffer
  mimeType: string
  extension: string
  filename: string
}
