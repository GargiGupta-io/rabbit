import type {
  FolderFolderItemSchema,
  FolderWithItemsSchema,
  NoteFolderItemSchema,
  ProjectFolderItemSchema,
  RecursiveFolderItemSchema,
  SheetFolderItemSchema,
} from '@motion/zod/client'

type FindFolderItemSearchItem =
  | FolderWithItemsSchema
  | RecursiveFolderItemSchema

export type FindFolderItemCallback = (
  item: RecursiveFolderItemSchema
) => boolean

export type FindFolderItemReturn = [
  RecursiveFolderItemSchema,
  ...(
    | FolderFolderItemSchema
    | NoteFolderItemSchema
    | ProjectFolderItemSchema
    | SheetFolderItemSchema
  )[],
]

export function findFolderItem(
  folders: FolderWithItemsSchema,
  cb: FindFolderItemCallback
): FindFolderItemReturn | null {
  const search = (
    item: FindFolderItemSearchItem,
    tree: FindFolderItemSearchItem[] = []
  ): FindFolderItemReturn | null => {
    const newTree = [item, ...tree] as FindFolderItemReturn

    if ('items' in item) {
      for (const child of item.items) {
        if (cb(child)) {
          return [child, ...newTree] as FindFolderItemReturn
        }

        const result = search(child, newTree)

        if (result) {
          return result
        }
      }
    }

    return null
  }

  return search(folders)
}

export type FindFolderItemInRecordCallback = (
  item: FolderWithItemsSchema | RecursiveFolderItemSchema
) => boolean

export type FindFolderItemInRecordResult =
  | {
      type: 'root'
      folder: FolderWithItemsSchema
    }
  | {
      type: 'path'
      folder: FolderWithItemsSchema
      breadcrumbs: FindFolderItemReturn
    }

export function findFolderItemInRecord(
  record: Record<string, FolderWithItemsSchema>,
  cb: FindFolderItemInRecordCallback
): FindFolderItemInRecordResult | null {
  const folders = Object.values(record).filter(Boolean)

  for (const folder of folders) {
    if (cb(folder)) {
      return { type: 'root', folder }
    }

    const breadcrumbs = findFolderItem(folder, cb)

    if (breadcrumbs) {
      return { type: 'path', folder, breadcrumbs }
    }
  }

  return null
}
