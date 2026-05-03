import {
  createKey,
  defineApi,
  defineMutation,
  optimisticUpdate,
  SKIP_UPDATE,
  typedKey,
  updateOnSuccess,
} from '@motion/rpc'

import { type RouteTypes } from '../types'

type GetNoteById = RouteTypes<'BetaNotesController_getNoteById'>

const factory = typedKey<GetNoteById['response']>().define

export const queryKeys = {
  root: createKey(['v2', 'notes']),
  noteById: (args: Pick<GetNoteById['request'], 'id'>) =>
    factory(queryKeys.root, args.id),
  query: (args: QueryNotes['request']) => [queryKeys.root, args],
  snapshots: (args: Pick<GetNoteById['request'], 'id'>) =>
    createKey(queryKeys.noteById(args), 'snapshots'),
  snapshotById: (
    args: Pick<GetNoteById['request'], 'id'>,
    snapshotId: string
  ) => createKey(queryKeys.snapshots(args), snapshotId),
  editorState: (args: Pick<GetNoteById['request'], 'id'>) =>
    createKey(queryKeys.noteById(args), 'editorState'),
}

export const getNoteById = defineApi<
  GetNoteById['request'],
  GetNoteById['response']
>().using({
  key: (args) => queryKeys.noteById(args),
  uri: (args) => `/v2/beta/notes/${args.id}`,
  method: 'GET',
})

type QueryNotes = RouteTypes<'BetaNotesController_queryForNotes'>
export const queryNotes = defineMutation<
  QueryNotes['request'],
  QueryNotes['response']
>().using({
  key: (args) => queryKeys.query(args),
  uri: () => `/v2/beta/notes/query`,
  method: 'POST',
})

type CreateNote = RouteTypes<'BetaNotesController_createNote'>
export const createNote = defineMutation<
  CreateNote['request'],
  CreateNote['response']
>().using({
  method: 'POST',
  uri: () => `/v2/beta/notes`,
})

type UpdateNote = RouteTypes<'BetaNotesController_updateNote'>
export const updateNote = defineMutation<
  UpdateNote['request'],
  UpdateNote['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/beta/notes/${args.id}`,
  body: (args) => args,
})

type DeleteNote = RouteTypes<'BetaNotesController_deleteNote'>
export const deleteNote = defineMutation<
  DeleteNote['request'],
  DeleteNote['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/beta/notes/${args.id}`,
})

type CopyNote = RouteTypes<'BetaNotesController_copyNote'>
export const copyNote = defineMutation<
  CopyNote['request'],
  CopyNote['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/beta/notes/${args.id}/copy`,
})

export const createNoteComment = defineMutation<
  RouteTypes<'CommentsController_createComment'>['request'],
  RouteTypes<'CommentsController_createComment'>['response']
>().using({
  method: 'POST',
  uri: '/v2/comments',
  body: (args) => args,
  effects: [
    updateOnSuccess({
      key: (args) => queryKeys.noteById({ id: args.targetId }),
      merge: (value, prev) => {
        if (!prev) return value

        prev.models['feedEntries'] = Object.assign(
          prev.models['feedEntries'],
          value.models['feedEntries']
        )
        prev.models['threads'] = Object.assign(
          prev.models['threads'],
          value.models['threads']
        )

        return prev
      },
    }),
  ],
})

export const deleteNoteComment = defineMutation<
  RouteTypes<'CommentsController_deleteComment'>['request'] & {
    targetId: string
  },
  void
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/comments/${args.commentId}`,
  effects: [
    optimisticUpdate({
      key: (args) => queryKeys.noteById({ id: args.targetId }),
      merge: (value, prev) => {
        if (!prev) return SKIP_UPDATE
        delete prev.models['feedEntries'][value.commentId]
        return prev
      },
    }),
  ],
})

export const editNoteComment = defineMutation<
  RouteTypes<'CommentsController_updateComment'>['request'] & {
    targetId: string
  },
  RouteTypes<'CommentsController_updateComment'>['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/comments/${args.commentId}`,
  body: ({ commentId, targetId, ...args }) => args,
  effects: [
    optimisticUpdate({
      key: (args) => queryKeys.noteById({ id: args.targetId }),
      merge: (value, prev) => {
        if (!prev) return SKIP_UPDATE
        const comment = prev.models['feedEntries'][value.commentId]
        if (!comment || comment.type !== 'COMMENT') return SKIP_UPDATE
        comment.body = value.bodyHtml
        comment.editedTime = new Date().toISOString()
        return prev
      },
    }),
  ],
})

type CreateNoteMentions = RouteTypes<'BetaNotesController_createMentions'>
export const createNoteMentions = defineMutation<
  CreateNoteMentions['request'],
  CreateNoteMentions['response']
>().using({
  method: 'POST',
  body: ({ id, ...args }) => args,
  uri: (args) => `/v2/beta/notes/${args.id}/mentions`,
})

type DeleteNoteMentions = RouteTypes<'BetaNotesController_deleteMentions'>
export const deleteNoteMentions = defineMutation<
  DeleteNoteMentions['request'],
  DeleteNoteMentions['response']
>().using({
  method: 'DELETE',
  body: ({ id, ...args }) => args,
  uri: (args) => `/v2/beta/notes/${args.id}/mentions`,
})

type CreateTaskFromSelection =
  RouteTypes<'NotesAiController_createTaskFromSelection'>
export const createTaskFromSelection = defineMutation<
  CreateTaskFromSelection['request'],
  CreateTaskFromSelection['response']
>().using({
  method: 'POST',
  uri: () => `/v2/beta/notes/ai/create-task-from-selection`,
})

type CreateTasksFromSelection =
  RouteTypes<'NotesAiController_createTasksFromSelection'>
export const createTasksFromSelection = defineMutation<
  CreateTasksFromSelection['request'],
  CreateTasksFromSelection['response']
>().using({
  method: 'POST',
  uri: () => `/v2/beta/notes/ai/create-tasks-from-selection`,
})

type QueryNoteSnapshots = RouteTypes<'BetaNotesController_getNoteSnapshots'>
export const queryNoteSnapshots = defineApi<
  QueryNoteSnapshots['request'],
  QueryNoteSnapshots['response']
>().using({
  key: queryKeys.snapshots,
  uri: (args) => `/v2/beta/notes/${args.id}/snapshots`,
  method: 'GET',
})

type ApplyNoteSnapshot = RouteTypes<'BetaNotesController_applySnapshot'>
export const applySnapshot = defineMutation<
  ApplyNoteSnapshot['request'],
  void
>().using({
  key: queryKeys.snapshots,
  uri: (args) => `/v2/beta/notes/${args.id}/snapshots/${args.snapshotId}`,
  method: 'POST',
})

type GetNoteSnapshotPreview =
  RouteTypes<'BetaNotesController_getSnapshotPreview'>
export const getNoteSnapshotPreview = defineApi<
  GetNoteSnapshotPreview['request'],
  GetNoteSnapshotPreview['response']
>().using({
  key: (args) => queryKeys.snapshotById(args, args.snapshotId),
  uri: (args) =>
    `/v2/beta/notes/${args.id}/snapshots/${args.snapshotId}/preview`,
  method: 'GET',
})

type EstimateTaskProps = RouteTypes<'NotesAiController_estimateTaskProps'>
export const estimateTaskProps = defineMutation<
  EstimateTaskProps['request'],
  EstimateTaskProps['response']
>().using({
  method: 'POST',
  uri: () => '/v2/beta/notes/ai/estimate-task-props',
})

type SummarizeText = RouteTypes<'NotesAiController_summarizeText'>
export const summarizeText = defineMutation<
  SummarizeText['request'],
  SummarizeText['response']
>().using({
  method: 'POST',
  uri: () => `/v2/beta/notes/ai/summarize-text`,
})

type RewriteText = RouteTypes<'NotesAiController_rewriteText'>
export const rewriteText = defineMutation<
  RewriteText['request'],
  RewriteText['response']
>().using({
  method: 'POST',
  uri: () => `/v2/beta/notes/ai/rewrite-text`,
})

type CreateContent = RouteTypes<'NotesAiController_createContent'>
export const createContent = defineMutation<
  CreateContent['request'],
  CreateContent['response']
>().using({
  method: 'POST',
  uri: () => `/v2/beta/notes/ai/create-content`,
})

type GetNoteEditorState = RouteTypes<'BetaNotesController_getNoteEditorState'>

// Define explicit response type to avoid complex type inference issues
export type NoteEditorStateResponse = GetNoteEditorState['response'] & {
  editorState: {
    root: {
      children: any[]
      direction: string | null
      format: string
      indent: number
      type: string
      version: number
    }
  }
}

export const getNoteEditorState = defineApi<
  GetNoteEditorState['request'],
  NoteEditorStateResponse
>().using({
  key: (args) => queryKeys.editorState(args),
  uri: (args) => `/v2/beta/notes/${args.id}/editor-state`,
  method: 'GET',
})
