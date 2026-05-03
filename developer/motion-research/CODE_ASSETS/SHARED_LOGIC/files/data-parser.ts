import { FileData } from './files.types'
import {
  extensionFromMimeType,
  generateFilenameFromMimeType,
} from './mime-types'

/**
 * Parses a string data to a file data
 * @param value - The string data to parse (data URL or base64 prefixed data)
 * @returns The file data or null if the string data is not a valid data URL or base64 prefixed data
 */
export function parseStringDataToFileData(value: string): FileData | null {
  if (typeof value !== 'string') {
    return null
  }

  // Handle data URLs (data:mime/type;base64,data)
  if (value.startsWith('data:')) {
    const match = value.match(/^data:([^;]+);base64,(.+)$/)
    if (match) {
      const [, mimeType, base64Data] = match
      const data = Buffer.from(base64Data, 'base64')

      return {
        data,
        mimeType,
        extension: extensionFromMimeType(mimeType),
        filename: generateFilenameFromMimeType(mimeType),
      }
    }
  }

  // Handle base64 prefixed data
  if (value.startsWith('base64:')) {
    const base64Data = value.substring(7)
    const data = Buffer.from(base64Data, 'base64')
    const mimeType = 'application/octet-stream'

    return {
      data,
      mimeType,
      extension: extensionFromMimeType(mimeType),
      filename: generateFilenameFromMimeType(mimeType),
    }
  }

  return null
}
