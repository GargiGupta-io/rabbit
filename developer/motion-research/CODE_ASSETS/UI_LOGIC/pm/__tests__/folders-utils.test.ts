import type { FolderWithItemsSchema } from '@motion/zod/client'

import { describe, expect, it } from 'vitest'

import { findFolderItem } from '../folders-utils'

describe('findFolderItem', () => {
  const mockFolder: FolderWithItemsSchema = {
    id: 'root',
    name: 'Root Folder',
    color: 'blue',
    type: 'USER',
    targetType: 'FOLDER',
    targetId: 'root-target',
    items: [
      {
        id: 'folder1',
        itemId: 'folder1',
        itemType: 'FOLDER',
        folderId: null,
        order: '0',
        items: [
          {
            id: 'note1',
            itemId: 'note1',
            itemType: 'NOTE',
            folderId: 'folder1',
            order: '0',
            items: [],
          },
          {
            id: 'project1',
            itemId: 'project1',
            itemType: 'PROJECT',
            folderId: 'folder1',
            order: '1',
            items: [
              {
                id: 'note2',
                itemId: 'note2',
                itemType: 'NOTE',
                folderId: 'project1',
                order: '0',
                items: [],
              },
            ],
          },
        ],
      },
      {
        id: 'folder2',
        itemId: 'folder2',
        itemType: 'FOLDER',
        folderId: null,
        order: '1',
        items: [],
      },
    ],
  }

  it('should find an item by id', () => {
    const result = findFolderItem(mockFolder, (item) => item.itemId === 'note1')

    expect(result).toBeTruthy()
    expect(result![0].itemId).toBe('note1')
    expect(result![1].itemId).toBe('folder1')
    expect(result![2].id).toBe('root')
  })

  it('should find a deeply nested item', () => {
    const result = findFolderItem(mockFolder, (item) => item.itemId === 'note2')

    expect(result).toBeTruthy()
    expect(result![0].itemId).toBe('note2')
    expect(result![1].itemId).toBe('project1')
    expect(result![2].itemId).toBe('folder1')
    expect(result![3].id).toBe('root')
  })

  it('should return null for non-existent item', () => {
    const result = findFolderItem(
      mockFolder,
      (item) => item.itemId === 'nonexistent'
    )

    expect(result).toBeNull()
  })

  it('should find items by type', () => {
    const result = findFolderItem(
      mockFolder,
      (item) => item.itemType === 'PROJECT'
    )

    expect(result).toBeTruthy()
    expect(result![0].itemType).toBe('PROJECT')
    expect(result![0].itemId).toBe('project1')
  })

  it('should handle custom predicates', () => {
    const result = findFolderItem(
      mockFolder,
      (item) => item.itemType === 'NOTE' && item.itemId === 'note2'
    )

    expect(result).toBeTruthy()
    expect(result![0].itemType).toBe('NOTE')
    expect(result![0].itemId).toBe('note2')
  })
})
