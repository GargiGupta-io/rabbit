import { useCallback, useContext } from 'react'

import { type ReceivableChannel, type ReceivableChannelMap } from '../channels'
import { DesktopIpcContext } from '../provider/context'

export const useSendToDesktop = () => {
  const ctx = useContext(DesktopIpcContext)
  return useCallback(
    <T extends ReceivableChannel>(
      message: T,
      ...args: Parameters<ReceivableChannelMap[T]>
    ) => {
      ctx.send(message, ...args)
    },
    [ctx]
  )
}
