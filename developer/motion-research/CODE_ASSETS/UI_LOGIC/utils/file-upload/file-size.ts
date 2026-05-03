const FILE_SIZE_LIMIT_IN_MEGBYTES = 50
const FILE_SIZE_LIMIT_IN_BYTES = FILE_SIZE_LIMIT_IN_MEGBYTES * 1024 * 1024

/**
 * @param fileSize size of the file in bytes
 * @returns
 */
export function isFileTooLarge(fileSize: number): boolean {
  return fileSize > FILE_SIZE_LIMIT_IN_BYTES
}

export function maxUploadFileSizeMB(): number {
  return FILE_SIZE_LIMIT_IN_MEGBYTES
}

export function bytesToGb(bytes: number): number {
  return bytes / 1024 ** 3
}
