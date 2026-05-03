import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: createKey('recently-opened'),
  tasks: createKey('recently-opened', 'tasks'),
}
