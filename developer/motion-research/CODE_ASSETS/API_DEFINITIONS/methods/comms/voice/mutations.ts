import { defineMutation } from '@motion/rpc'

import { RouteTypes } from '../../types'

type TestTextToSpeech = RouteTypes<'VoiceModel_TestTextToSpeech'>
export const testTextToSpeech = defineMutation<
  TestTextToSpeech['request'],
  TestTextToSpeech['response']
>().using({
  method: 'POST',
  uri: () =>
    `${__NET_HOST__}/v1/communications/voice-models/test/text-to-speech`,
})
