import {
  type ReceivableChannel,
  type SendableChannel,
  type SendableChannelMap,
} from '../channels'

export type IpcCallback<T extends SendableChannel> = (
  ...args: Parameters<SendableChannelMap[T]>
) => void
export type Unsubscribe = () => void

// These are swapped because the desktop app is the server
export type ReceivableChannels = SendableChannel
export type SendableChannels = ReceivableChannel
