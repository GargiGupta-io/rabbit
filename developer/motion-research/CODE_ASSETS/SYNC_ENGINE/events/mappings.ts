import { createLookupBy, entries } from '@motion/utils/object'

import {
  CalendarEventCreated,
  CalendarEventDeleted,
  CalendarEventUpdated,
  CalendarSyncExecuteEvent,
} from './calendar-events'
import { CalendarAdded, CalendarRemoved, CalendarUpdated } from './calendars'
import { BootstrapCompleted, ResetStore } from './control-events'
import {
  CustomFieldCreated,
  CustomFieldDeleted,
  CustomFieldUpdated,
  PushCopyCustomField,
  PushCreateCustomField,
  PushDeleteCustomField,
  PushUpdateCustomField,
} from './custom-fields'
import {
  FolderCreated,
  FolderDeleted,
  FolderItemCreated,
  FolderItemDeleted,
  FolderItemUpdated,
  FolderUpdated,
} from './folders'
import {
  LabelCreated,
  LabelDeleted,
  LabelUpdated,
  PushCreateLabel,
  PushDeleteLabel,
  PushUpdateLabel,
} from './labels'
import {
  NoteCreated,
  NoteDeleted,
  NoteUpdated,
  PushCreateNote,
  PushDeleteNote,
  PushUpdateNote,
} from './notes'
import {
  ProjectDefinitionCreated,
  ProjectDefinitionDeleted,
  ProjectDefinitionUpdated,
  PushCopyProjectDefinition,
  PushCreateProjectDefinition,
  PushDeleteProjectDefinition,
  PushUpdateProjectDefinition,
} from './project-definitions'
import {
  PushCreateStatus,
  PushDeleteStatus,
  PushUpdateStatus,
  StatusCreated,
  StatusDeleted,
  StatusUpdated,
} from './status'
import {
  ChunkCreated,
  ChunkDeleted,
  ChunkUpdated,
  TaskCreated,
  TaskDeleted,
  TasksScheduledEvent,
  TaskUpdated,
} from './tasks'
import type { PushEventModel, PushEventType } from './types/push'
import type { AllSyncEvents } from './types/sync'
import {
  PushDeleteUploadedFile,
  PushUpdateUploadedFile,
  UploadedFileCreated,
  UploadedFileDeleted,
  UploadedFileUpdated,
} from './uploaded-file'
import {
  UserAddedToWorkspaceEventSchema,
  UserCreated,
  UserDeleted,
  UserRemovedFromWorkspaceEventSchema,
  UserUpdated,
} from './user'
import {
  PushCreateWorkspace,
  PushDeleteWorkspace,
  PushUpdateWorkspace,
  WorkspaceCreated,
  WorkspaceDeleted,
  WorkspaceUpdated,
} from './workspace'
import {
  PushCreateWorkspaceMember,
  PushDeleteWorkspaceMember,
  WorkspaceMemberCreated,
  WorkspaceMemberDeleted,
  WorkspaceMemberUpdated,
} from './workspace-member'

import { ModelNames } from '../models'
import { flattenEvents } from '../utils/flatten'

export const PushEventMap = {
  label: {
    create: PushCreateLabel,
    update: PushUpdateLabel,
    delete: PushDeleteLabel,
  },
  status: {
    create: PushCreateStatus,
    update: PushUpdateStatus,
    delete: PushDeleteStatus,
  },
  note: {
    create: PushCreateNote,
    update: PushUpdateNote,
    delete: PushDeleteNote,
  },
  workspace: {
    create: PushCreateWorkspace,
    update: PushUpdateWorkspace,
    delete: PushDeleteWorkspace,
  },
  'workspace-member': {
    create: PushCreateWorkspaceMember,
    delete: PushDeleteWorkspaceMember,
  },
  'custom-field': {
    create: PushCreateCustomField,
    copy: PushCopyCustomField,
    update: PushUpdateCustomField,
    delete: PushDeleteCustomField,
  },
  'uploaded-file': {
    // handle create not through sync engine
    update: PushUpdateUploadedFile,
    delete: PushDeleteUploadedFile,
  },
  'project-definition': {
    create: PushCreateProjectDefinition,
    copy: PushCopyProjectDefinition,
    update: PushUpdateProjectDefinition,
    delete: PushDeleteProjectDefinition,
  },
  // folder: {
  //   create: PushFolderCreate,
  //   update: PushFolderUpdate,
  //   delete: PushFolderDelete,
  // },
  // 'folder-item': {
  //   create: PushFolderItemCreate,
  //   update: PushFolderItemUpdate,
  //   delete: PushFolderItemDelete,
  // },
}

export const SyncEventMap = {
  control: {
    'reset-store': ResetStore,
    'bootstrap-completed': BootstrapCompleted,
  },
  status: {
    created: StatusCreated,
    updated: StatusUpdated,
    deleted: StatusDeleted,
  },
  label: {
    created: LabelCreated,
    updated: LabelUpdated,
    deleted: LabelDeleted,
  },
  workspace: {
    created: WorkspaceCreated,
    updated: WorkspaceUpdated,
    deleted: WorkspaceDeleted,
    'tasks-scheduled': TasksScheduledEvent,
  },
  'workspace-member': {
    created: WorkspaceMemberCreated,
    updated: WorkspaceMemberUpdated,
    deleted: WorkspaceMemberDeleted,
  },
  task: {
    created: TaskCreated,
    updated: TaskUpdated,
    deleted: TaskDeleted,
  },
  chunk: {
    created: ChunkCreated,
    updated: ChunkUpdated,
    deleted: ChunkDeleted,
  },
  folder: {
    created: FolderCreated,
    updated: FolderUpdated,
    deleted: FolderDeleted,
  },
  'folder-item': {
    created: FolderItemCreated,
    updated: FolderItemUpdated,
    deleted: FolderItemDeleted,
  },
  user: {
    created: UserCreated,
    updated: UserUpdated,
    deleted: UserDeleted,
    'added-to-workspace': UserAddedToWorkspaceEventSchema,
    'removed-from-workspace': UserRemovedFromWorkspaceEventSchema,
  },
  calendar: {
    added: CalendarAdded,
    removed: CalendarRemoved,
    updated: CalendarUpdated,
  },
  notes: {
    created: NoteCreated,
    updated: NoteUpdated,
    deleted: NoteDeleted,
  },
  'calendar-event': {
    created: CalendarEventCreated,
    updated: CalendarEventUpdated,
    deleted: CalendarEventDeleted,
  },
  'custom-field': {
    created: CustomFieldCreated,
    updated: CustomFieldUpdated,
    deleted: CustomFieldDeleted,
  },
  'calendar-sync': {
    execute: CalendarSyncExecuteEvent,
  },
  'uploaded-file': {
    created: UploadedFileCreated,
    updated: UploadedFileUpdated,
    deleted: UploadedFileDeleted,
  },
  'project-definition': {
    created: ProjectDefinitionCreated,
    updated: ProjectDefinitionUpdated,
    deleted: ProjectDefinitionDeleted,
  },
}

export const syncEventsByType = flattenEvents(SyncEventMap)

/**
 * Mapping from sync engine model names to actual model registry names
 */
export const SyncEngineModelMapping = {
  label: 'labels',
  status: 'statuses',
  note: 'notes',
  'uploaded-file': 'uploadedFiles',
  workspace: 'workspaces',
  'workspace-member': 'workspaceMembers',
  'custom-field': 'customFields',
  'project-definition': 'projectDefinitions',
  // task: 'tasks',
  // folder: 'folders',
  // 'folder-item': 'folderItems',
  // user: 'users',
} as const satisfies Record<PushEventModel, ModelNames>

export type SyncEngineModelName = keyof typeof SyncEngineModelMapping
export type SyncEngineToModelRegistryName<T extends SyncEngineModelName> =
  (typeof SyncEngineModelMapping)[T]

export const getModelNameBySyncEngineName = <T extends SyncEngineModelName>(
  syncEngineName: T
): SyncEngineToModelRegistryName<T> => {
  return SyncEngineModelMapping[syncEngineName]
}

// Helper type to invert the mapping
type InvertMapping<T extends Record<string, string>> = {
  [K in T[keyof T]]: {
    [P in keyof T]: T[P] extends K ? P : never
  }[keyof T]
}

// Derive ModelRegistryToSyncEngineMapping from SyncEngineModelMapping
export const ModelRegistryToSyncEngineMapping = createLookupBy(
  entries(SyncEngineModelMapping),
  ([, registryName]) => registryName,
  ([syncEngineName]) => syncEngineName
) as InvertMapping<typeof SyncEngineModelMapping>

export type ModelRegistryToSyncEngineMapping =
  typeof ModelRegistryToSyncEngineMapping

export type ModelRegistryToSyncEngineName<
  T extends keyof ModelRegistryToSyncEngineMapping,
> = ModelRegistryToSyncEngineMapping[T]

export const getSyncEngineModelNameByRegistryName = <
  T extends keyof ModelRegistryToSyncEngineMapping,
>(
  modelType: T
): ModelRegistryToSyncEngineName<T> => {
  return ModelRegistryToSyncEngineMapping[modelType]
}

/**
 * Maps push event types to their corresponding sync event types
 * Used to correlate requests with responses
 */
export const pushToSyncEventMapping = {
  // Label events
  'push.label.create': 'label.created',
  'push.label.update': 'label.updated',
  'push.label.delete': 'label.deleted',

  // Status events
  'push.status.create': 'status.created',
  'push.status.update': 'status.updated',
  'push.status.delete': 'status.deleted',

  // Note events
  'push.note.create': 'note.created',
  'push.note.update': 'note.updated',
  'push.note.delete': 'note.deleted',

  // Uploaded file events
  // handle create not through sync engine
  'push.uploaded-file.update': 'uploaded-file.updated',
  'push.uploaded-file.delete': 'uploaded-file.hard-deleted',

  // // Task events
  // 'push.task.create': 'task.created',
  // 'push.task.update': 'task.updated',
  // 'push.task.delete': 'task.deleted',

  // Workspace events
  'push.workspace.create': 'workspace.created',
  'push.workspace.update': 'workspace.updated',
  'push.workspace.delete': 'workspace.hard-deleted',

  // Workspace member events
  'push.workspace-member.create': 'workspace-member.created',
  'push.workspace-member.delete': 'workspace-member.deleted',

  // // Custom fields events
  'push.custom-field.create': 'custom-field.created',
  'push.custom-field.copy': 'custom-field.created',
  'push.custom-field.update': 'custom-field.updated',
  'push.custom-field.delete': 'custom-field.hard-deleted',

  'push.project-definition.create': 'project-definition.created',
  'push.project-definition.update': 'project-definition.updated',
  'push.project-definition.copy': 'project-definition.created',
  'push.project-definition.delete': 'project-definition.hard-deleted',

  // // Folder events
  // 'push.folder.create': 'folder.created',
  // 'push.folder.update': 'folder.updated',
  // 'push.folder.delete': 'folder.deleted',

  // // Folder item events
  // 'push.folder-item.create': 'folder-item.created',
  // 'push.folder-item.update': 'folder-item.updated',
  // 'push.folder-item.delete': 'folder-item.deleted',
} as const satisfies Record<PushEventType, AllSyncEvents['type']>

export type PushToSyncEventMapping = typeof pushToSyncEventMapping
export type SyncEventTypeForPush<T extends PushEventType> =
  PushToSyncEventMapping[T]

/**
 * Get the expected sync event type for a given push event type
 */
export function getExpectedSyncEventType<T extends PushEventType>(
  pushEventType: T
): SyncEventTypeForPush<T> | undefined {
  return pushToSyncEventMapping[pushEventType]
}

/**
 * Check if a sync event type corresponds to a push event type
 */
export function isSyncEventForPush(
  syncEventType: AllSyncEvents['type'],
  pushEventType: PushEventType
): boolean {
  return pushToSyncEventMapping[pushEventType] === syncEventType
}

/**
 * Maps WebSocket event prefixes to their corresponding sync engine model names
 * Used to determine which store model should handle a given WebSocket event
 */
export const WebSocketEventPrefixToSyncEngineModel = {
  // TODO: we use full events for the project definitions, because there's 'reconciled' event
  // that refreshes projects and we didn't move projects onto the sync engine yet
  'workspace.project.definition.created': 'project-definition',
  'workspace.project.definition.updated': 'project-definition',
  'workspace.project.definition.deleted': 'project-definition',
  'workspace.stage.definition.': 'project-definition',

  'workspace.member.': 'workspace-member',
  'workspace.customField.': 'custom-field',
  'workspace.status.': 'status',
  'workspace.label.': 'label',
  'uploadedFile.': 'uploaded-file',
  // 'workspace.note.': 'note',
  'workspace.task.': 'task',
  'workspace.recurringTask.': 'task',
  'workspace.tasks.': 'task',
  'workspace.tasksScheduled': 'task',
  // 'workspace.project.': 'project',
  // 'workspace.stage.': 'stage',
  'folder.': 'folder',
  'folder.item.': 'folder-item',
  'workspace.created': 'workspace',
  'workspace.updated': 'workspace',
  'workspace.deleted': 'workspace',
} as const satisfies Record<string, keyof typeof SyncEventMap>

export type WebSocketEventPrefix =
  keyof typeof WebSocketEventPrefixToSyncEngineModel
export type SyncEngineModelForWebSocketPrefix<T extends WebSocketEventPrefix> =
  (typeof WebSocketEventPrefixToSyncEngineModel)[T]

/**
 * Get the store model name for a given WebSocket event type
 * Returns null if the event doesn't map to a store-managed model
 *
 * @example
 * getModelNameForWebSocketEvent('workspace.status.create') // 'statuses'
 * getModelNameForWebSocketEvent('workspace.member.added') // 'workspaceMembers'
 * getModelNameForWebSocketEvent('workspace.task.update') // null (if tasks not yet released)
 */
export function getModelNameForWebSocketEvent(
  wsEventType: string
): ModelNames | null {
  // Sort entries by prefix length (descending) to match longest prefix first
  // Eg: match workspace.project.definition before workspace.project
  const sortedEntries = entries(WebSocketEventPrefixToSyncEngineModel).sort(
    ([prefixA], [prefixB]) => prefixB.length - prefixA.length
  )

  // Find matching prefix (longest match wins)
  const matchingEntry = sortedEntries.find(([prefix]) =>
    wsEventType.startsWith(prefix)
  )

  if (!matchingEntry) {
    return null
  }

  const [, syncEngineModelName] = matchingEntry

  // Check if this sync engine model is mapped to a store model
  const storeModelName =
    SyncEngineModelMapping[syncEngineModelName as SyncEngineModelName]

  return storeModelName ?? null
}
