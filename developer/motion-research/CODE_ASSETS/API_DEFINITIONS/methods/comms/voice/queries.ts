import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../../types'

type GetVoiceModels = RouteTypes<'VoiceModel_GetVoiceModels'>
export const getVoiceModels = defineApi<
  GetVoiceModels['request'],
  GetVoiceModels['response']
>().using({
  key: () => queryKeys.voiceModels(),
  uri: () => `${__NET_HOST__}/v1/communications/voice-models`,
})

type GetVoiceModelById = RouteTypes<'VoiceModel_GetVoiceModelById'>
export const getVoiceModelById = defineApi<
  GetVoiceModelById['request'],
  GetVoiceModelById['response']
>().using({
  key: (args) => queryKeys.voiceModels(args.id),
  uri: (args) => `${__NET_HOST__}/v1/communications/voice-models/${args.id}`,
})
