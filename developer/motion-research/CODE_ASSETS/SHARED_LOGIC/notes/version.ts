/**
 * Increment when breaking changes occur to the editor nodes or plugins
 * This will disable any editors that have not been updated to the new version from making changes to the document
 * until they reload to get the latest code
 */

export const DOCUMENT_COMPAT_VERSION = 1 as const
