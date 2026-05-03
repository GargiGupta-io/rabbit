import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

export const getTemplates = defineApi<
  void,
  Array<{
    id: string
    name: string | null
    linkSlug: string
  }>
>().using({
  method: 'GET',
  uri: `${__BACKEND_HOST__}/booking/templates`,
  key: queryKeys.templates(),
})

export const getSettings = defineApi<
  void,
  {
    urlPrefix: string | null
  }
>().using({
  method: 'GET',
  uri: `${__BACKEND_HOST__}/booking/settings`,
  key: queryKeys.settings(),
})
