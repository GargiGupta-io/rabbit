import { CrmBootstrapResponse, RecordEntity } from '@motion/motion-net-types'
import { createKey, typedKey } from '@motion/rpc'

import {
  RecordGetRequest,
  RecordListResponseOf,
  RecordQueryRequest,
  RecordSingleResponseOf,
} from './types'

const sortParams = (values?: readonly string[]) =>
  values != null && values.length > 0 ? [...values].sort() : undefined

export const queryKeys = {
  root: () => createKey('crm/records'),
  bootstrap: () =>
    typedKey<CrmBootstrapResponse>().define(queryKeys.root(), 'bootstrap'),

  records: <T extends RecordQueryRequest['$collection']>(
    entity: RecordEntity['$collection']
  ) => typedKey<RecordListResponseOf<T>>().define(queryKeys.root(), entity),

  record: <T extends RecordGetRequest['$collection']>(entity: T, id: string) =>
    typedKey<RecordSingleResponseOf<T>>().define(queryKeys.records(entity), id),

  recordsShapes: () => createKey(queryKeys.root(), 'shapes'),
  activityFeed: (
    entityType: string,
    entityId: string,
    filters?: { includes?: readonly string[]; excludes?: readonly string[] }
  ) => {
    const includes = sortParams(filters?.includes)
    const excludes = sortParams(filters?.excludes)

    if (includes?.length && excludes?.length) {
      return createKey(
        queryKeys.root(),
        'activity-feed',
        entityType,
        entityId,
        ['includes', ...includes],
        ['excludes', ...excludes]
      )
    }

    if (includes?.length) {
      return createKey(
        queryKeys.root(),
        'activity-feed',
        entityType,
        entityId,
        ['includes', ...includes]
      )
    }

    if (excludes?.length) {
      return createKey(
        queryKeys.root(),
        'activity-feed',
        entityType,
        entityId,
        ['excludes', ...excludes]
      )
    }

    return createKey(queryKeys.root(), 'activity-feed', entityType, entityId)
  },
}
