import { useCallback, useContext, useEffect, useRef } from 'react'

import { type SendableChannel, type SendableChannelMap } from '../channels'
import { DesktopIpcContext } from '../provider/context'

export function useClosure<T extends (...args: any[]) => any>(handler: T): T {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  // @ts-expect-error - type is handled in the signature
  return useCallback((...args) => {
    return handlerRef.current(...args)
  }, [])
}

export const useOnDesktopEvent = <T extends SendableChannel>(
  key: T,
  cb: (...args: Parameters<SendableChannelMap[T]>) => void
) => {
  const ctx = useContext(DesktopIpcContext)

  const callback = useClosure(cb)

  useEffect(() => {
    return ctx.on(key, callback)
  }, [key, callback, ctx])
}
