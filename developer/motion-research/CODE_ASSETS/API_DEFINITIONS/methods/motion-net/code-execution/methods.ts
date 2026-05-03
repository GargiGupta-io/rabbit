import { defineMutation } from '@motion/rpc'

import { RouteTypes } from '../../types'

type Endpoint = RouteTypes<'CodeExecution_TestCodeSnippet'>
export type CodeExecutionTestRequest = Endpoint['request']
export type CodeExecutionTestResponse = Endpoint['response']

export const testCode = defineMutation<
  CodeExecutionTestRequest,
  CodeExecutionTestResponse
>().using({
  method: 'POST',
  uri: `${__NET_HOST__}/api/code-execution/test`,
  body: (opts) => opts,
  fetchOptions(opts) {
    return {
      ...opts,
      method: 'POST',
      headers: {
        ...opts.headers,
        'content-type': 'text/plain',
      },
    }
  },
})
