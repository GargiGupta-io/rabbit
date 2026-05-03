import { createContext } from 'react'

import {
  type IpcCallback,
  type ReceivableChannels,
  type SendableChannels,
  type Unsubscribe,
} from './types'

import { type ReceivableChannel, type ReceivableChannelMap } from '../channels'

type DesktopIpcContextType = {
  send(
    message: SendableChannels,
    ...args: Parameters<ReceivableChannelMap[ReceivableChannel]>
  ): void
  on<T extends ReceivableChannels>(message: T, cb: IpcCallback<T>): Unsubscribe
}

const THROW_NO_CONTEXT = () => {
  throw new Error('Context not found')
}

export const DesktopIpcContext = createContext<DesktopIpcContextType>({
  on: THROW_NO_CONTEXT,
  send: THROW_NO_CONTEXT,
})
