import { createKey, defineMutation } from '@motion/rpc'

export const downloadUserData = defineMutation<void, void>().using({
  key: createKey(['privacy', 'downloadUserData']),
  method: 'GET',
  uri: () => `/privacy/user_data`,
})

export const deleteUserData = defineMutation<void, void>().using({
  key: createKey(['privacy', 'deleteUserData']),
  uri: () => `/privacy/user_data`,
  method: 'DELETE',
})
