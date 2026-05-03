import { createKey, defineApi } from '@motion/rpc'

import { type RouteTypes } from '../types'

type Search = RouteTypes<'SearchController_search'>
export const search = defineApi<
  Search['request'],
  Search['response']['entities']
>().using({
  key: (args) =>
    createKey(
      'search',
      args.query,
      args.entities?.sort() ?? [],
      JSON.stringify(args.filters ?? [])
    ),
  uri: '/search',
  method: 'POST',
  transform: (data: Search['response']) =>
    (data.entities ?? []).map((entity, index) => ({
      ...entity,
      score: data.scores[index] ?? {},
    })),
  queryOptions: {
    staleTime: 1000,
  },
})
