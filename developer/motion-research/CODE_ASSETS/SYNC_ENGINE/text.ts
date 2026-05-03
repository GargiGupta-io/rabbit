import { TrimmedTextSchema } from '@motion/shared/common'
import { FILENAME_MAX_LENGTH, FILENAME_VALID_REGEX } from '@motion/shared/files'

export const TaskNameInputSchema = TrimmedTextSchema.min(1).max(500)
export const ProjectNameInputSchema = TrimmedTextSchema.min(1).max(500)

export const CustomFieldTextSchema = TrimmedTextSchema.min(1).max(255)

export const FilenameSchema = TrimmedTextSchema.regex(FILENAME_VALID_REGEX, {
  message: 'File name contains invalid characters',
})
  .max(FILENAME_MAX_LENGTH, {
    message: `File name cannot be longer than ${FILENAME_MAX_LENGTH} characters`,
    // Extension + dot
  })
  .min(4, {
    message: 'File name cannot be empty',
  })
