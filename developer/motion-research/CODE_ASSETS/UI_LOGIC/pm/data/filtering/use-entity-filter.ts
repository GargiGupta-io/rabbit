import { useMemoDeep } from '@motion/react-core/hooks'
import {
  useSharedState,
  useSharedStateSendOnly,
} from '@motion/react-core/shared-state'
import { FieldTypes } from '@motion/shared/custom-fields'

import { useCallback } from 'react'

import { normalizeFilter } from './normalize-filter'
import {
  ActiveFilterKey,
  DEFAULT_PROJECT_FILTERS,
  DEFAULT_TASK_FILTERS,
} from './state'
import { type AllFilters, type EntityFilterState } from './state/types'

import { getPrefixFromMaybeCustomFieldKey } from '../../custom-fields'
import { type AppDataContext } from '../types'

type FilterSetter<T extends keyof AllFilters> = <
  TKey extends keyof AllFilters[T]['filters'],
>(
  field: TKey,
  value: AllFilters[T]['filters'][TKey]
) => void

export type SelectedFilter<TEntity extends keyof AllFilters> =
  AllFilters[TEntity]

export function useEntityFilter<
  TEntity extends keyof AllFilters,
  TCustomFieldKey extends string,
>(
  ctx: AppDataContext,
  entity: TEntity,
  customFieldKey?: TCustomFieldKey
): [AllFilters[TEntity], FilterSetter<TEntity>] {
  const [state, setState] = useSharedState(ActiveFilterKey)

  function setValue<TKey extends keyof SelectedFilter<TEntity>['filters']>(
    maybeKey: TKey,
    value: SelectedFilter<TEntity>['filters'][TKey]
  ): void {
    setState((prev) => {
      let key = maybeKey

      const newFilter = getNewFilter<TEntity, TKey>({
        customFieldKey,
        prev,
        entity,
        value,
        key,
      })

      const newOrder = getNewOrder<TEntity, TKey>({
        prev,
        entity,
        newFilter,
        value,
        key,
        customFieldKey,
      })

      newFilter[entity].ordered =
        newOrder as EntityFilterState[TEntity]['ordered']

      return normalizeFilter(ctx, newFilter)
    })
  }

  return [state[entity], setValue]
}

type FilterProps<
  TEntity extends keyof AllFilters,
  TKey extends keyof SelectedFilter<TEntity>['filters'],
> = {
  customFieldKey: string | undefined
  prev: EntityFilterState
  entity: TEntity
  value: SelectedFilter<TEntity>['filters'][TKey]
  key: TKey
}

function getNewFilter<
  TEntity extends keyof AllFilters,
  TKey extends keyof SelectedFilter<TEntity>['filters'],
>({ customFieldKey, prev, entity, value, key }: FilterProps<TEntity, TKey>) {
  const prevFilters = prev[entity].filters as SelectedFilter<TEntity>['filters']

  const newValue =
    customFieldKey != null
      ? {
          ...prevFilters[key],
          [customFieldKey]: value,
        }
      : value

  const newFilter = {
    ...prev,
    [entity]: {
      ...prev[entity],
      filters: {
        ...prevFilters,
        [key]: newValue,
      },
    },
  }

  if (customFieldKey != null && value === null) {
    // @ts-expect-error - type clashing
    delete newFilter[entity].filters[key]?.[customFieldKey]
  }

  return newFilter
}

function getNewOrder<
  TEntity extends keyof AllFilters,
  TKey extends keyof AllFilters[TEntity]['filters'],
>({
  prev,
  entity,
  newFilter,
  value,
  key,
  customFieldKey,
}: FilterProps<TEntity, TKey> & {
  newFilter: EntityFilterState
}) {
  const oldOrder =
    value != null
      ? prev[entity].ordered
      : prev[entity].ordered.filter((item) => {
          // Check if custom field filter value
          if (
            FieldTypes.includes(
              getPrefixFromMaybeCustomFieldKey(item) as string
            )
          ) {
            if (item === customFieldKey) {
              return (
                // @ts-expect-error - type clashing
                newFilter[entity].filters[key]?.[customFieldKey] != null
              )
            }

            return true
          }

          return (
            // @ts-expect-error - type clashing
            newFilter[entity].filters[item] != null
          )
        })

  if (customFieldKey != null) {
    return value == null
      ? oldOrder.filter((x) => x !== customFieldKey)
      : oldOrder.includes(customFieldKey)
        ? oldOrder
        : [...oldOrder, customFieldKey]
  }

  return value == null
    ? oldOrder.filter((x) => x !== key)
    : oldOrder.includes(key as string)
      ? oldOrder
      : [...oldOrder, key]
}

export function useFieldFilter<
  TEntity extends keyof AllFilters,
  TField extends keyof SelectedFilter<TEntity>['filters'],
  TCustomFieldKey extends string,
>(
  ctx: AppDataContext,
  type: TEntity,
  field: TField,
  customFieldKey?: TCustomFieldKey
): [
  SelectedFilter<TEntity>['filters'][TField],
  (value: SelectedFilter<TEntity>['filters'][TField]) => void,
] {
  const [state, setState] = useEntityFilter(ctx, type, customFieldKey)

  const setter = useCallback(
    (value: SelectedFilter<TEntity>['filters'][TField]) => {
      setState(field, value)
    },
    [field, setState]
  )

  const memodState = useMemoDeep(
    customFieldKey != null
      ? // @ts-expect-error - properly typed from the signature
        state.filters[field]?.[customFieldKey]
      : // @ts-expect-error - properly typed from the signature
        state.filters[field]
  )

  return [memodState, setter]
}

/* c8 ignore start */
export function useResetFilter() {
  const setFilter = useSharedStateSendOnly(ActiveFilterKey)

  return (
    transform?: (
      prevState: EntityFilterState,
      newDefaultState: EntityFilterState
    ) => EntityFilterState
  ) => {
    setFilter((prev) => {
      const newState = {
        ...prev,
        tasks: {
          ordered: [],
          filters: Object.assign({}, DEFAULT_TASK_FILTERS, {
            completed: prev.tasks.filters.completed,
          }),
        },
        projects: {
          ordered: [],
          filters: Object.assign({}, DEFAULT_PROJECT_FILTERS, {
            completed: prev.projects.filters.completed,
          }),
        },
      }

      return transform ? transform(prev, newState) : newState
    })
  }
}

export function useActiveFilter() {
  return useSharedState(ActiveFilterKey)
}
