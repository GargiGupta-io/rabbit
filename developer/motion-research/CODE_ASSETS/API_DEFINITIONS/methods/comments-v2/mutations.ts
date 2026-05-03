import {
  defineMutation,
  optimisticUpdate,
  SKIP_UPDATE,
  updateOnSuccess,
} from '@motion/rpc'
import { createNoneId, isNoneId } from '@motion/shared/identifiers'
import { type CommentSchema } from '@motion/zod/client'

import { queryKeys as feedKeys } from '../feed-v2'
import type { RouteTypes } from '../types'

export const createComment = defineMutation<
  RouteTypes<'CommentsController_createComment'>['request'],
  RouteTypes<'CommentsController_createComment'>['response']
>().using({
  method: 'POST',
  uri: '/v2/comments',
  body: (args) => args,
  effects: [
    updateOnSuccess({
      key: (args) => feedKeys.feedById(args.targetId),
      merge: (value, prev) => {
        if (!prev) return value

        // Remove all temporary comments, which ends with '|<none>'
        for (const key in prev.models[prev.meta.model]) {
          if (isNoneId(key)) {
            delete prev.models[prev.meta.model][key]
          }
        }

        prev.models[prev.meta.model][value.id] =
          value.models[value.meta.model][value.id]
        return prev
      },
    }),
    optimisticUpdate({
      key: (args) => feedKeys.feedById(args.targetId),
      merge(value, prev) {
        if (!prev) return SKIP_UPDATE

        const currentFeedEntries = prev.models[prev.meta.model]

        if (!currentFeedEntries) {
          return prev
        }

        const tempComment: CommentSchema = {
          createdByUserId: value.createdByUserId,
          body: value.bodyHtml,
          targetId: value.targetId,
          targetType: value.targetType,
          reactions: {},
          id: createNoneId(),
          activityType: 'COMMENT',
          type: 'COMMENT',
          createdTime: new Date().toISOString(),
          editedTime: null,
          mentionIds: [],
        }

        currentFeedEntries[tempComment.id] = tempComment
        prev.models[prev.meta.model] = currentFeedEntries

        return prev
      },
    }),
  ],
})

export const deleteComment = defineMutation<
  RouteTypes<'CommentsController_deleteComment'>['request'] & {
    targetId: string
    targetType?: string
  },
  void
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/comments/${args.commentId}`,
  effects: [
    optimisticUpdate({
      key: (args) => feedKeys.feedById(args.targetId),
      merge: (value, prev) => {
        if (!prev) return SKIP_UPDATE
        delete prev.models[prev.meta.model][value.commentId]
        return prev
      },
    }),
  ],
})

export const editComment = defineMutation<
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
      key: (args) => feedKeys.feedById(args.targetId),
      merge: (value, prev) => {
        if (!prev) return SKIP_UPDATE
        const comment = prev.models[prev.meta.model][value.commentId]
        if (!comment || comment.type !== 'COMMENT') return SKIP_UPDATE
        comment.body = value.bodyHtml
        comment.editedTime = new Date().toISOString()
        return prev
      },
    }),
  ],
})

export const addReaction = defineMutation<
  RouteTypes<'CommentsController_addCommentReaction'>['request'] & {
    targetId: string
    targetType?: string
    userId: string
  },
  RouteTypes<'CommentsController_addCommentReaction'>['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/comments/${args.commentId}/reactions`,
  body: ({ commentId, targetId, targetType, ...args }) => args,
  effects: [
    optimisticUpdate({
      key: (args) => feedKeys.feedById(args.targetId),
      merge: (value, prev) => {
        if (prev == null) return SKIP_UPDATE

        const comment = prev.models[prev.meta.model][value.commentId]
        if (comment == null || comment.type !== 'COMMENT') return SKIP_UPDATE
        const currentReactions = comment.reactions

        if (
          currentReactions[value.value] &&
          currentReactions[value.value].includes(value.userId)
        ) {
          return prev
        }

        if (currentReactions[value.value]) {
          currentReactions[value.value].push(value.userId)
        } else {
          currentReactions[value.value] = [value.userId]
        }

        comment.reactions = currentReactions
        return prev
      },
    }),
  ],
})

export const removeReaction = defineMutation<
  RouteTypes<'CommentsController_deleteCommentReactions'>['request'] & {
    targetId: string
    targetType?: string
    userId: string
  },
  RouteTypes<'CommentsController_deleteCommentReactions'>['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/comments/${args.commentId}/reactions`,
  body: ({ commentId, targetId, targetType, ...args }) => args,
  effects: [
    optimisticUpdate({
      key: (args) => feedKeys.feedById(args.targetId),
      merge: (value, prev) => {
        if (prev == null) return SKIP_UPDATE
        const comment = prev.models[prev.meta.model][value.commentId]
        if (comment == null || comment.type !== 'COMMENT') return SKIP_UPDATE

        const currentReactions = comment.reactions

        if (!currentReactions[value.value]) {
          return prev
        }

        currentReactions[value.value] = currentReactions[value.value].filter(
          (id: string) => id !== value.userId
        )

        comment.reactions = currentReactions
        return prev
      },
    }),
  ],
})
