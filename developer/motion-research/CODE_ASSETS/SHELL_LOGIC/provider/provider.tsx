import { type ReactNode, useMemo } from 'react'

import { DesktopIpcContext } from './context'
import {
  type IpcCallback,
  type ReceivableChannels,
  type SendableChannels,
} from './types'

export type DesktopIpcProviderProps = {
  children: ReactNode
}

export const DesktopIpcProvider = (props: DesktopIpcProviderProps) => {
  const api = useMemo(() => {
    const handlers = new Map<
      ReceivableChannels,
      Array<IpcCallback<ReceivableChannels>>
    >()

    return {
      on<T extends ReceivableChannels>(channel: T, cb: IpcCallback<T>) {
        const typedCallback = cb as IpcCallback<ReceivableChannels>

        if (handlers.has(channel)) {
          handlers.get(channel)?.push(typedCallback)
        } else {
          handlers.set(channel, [typedCallback])
          window.ipcRender?.receive(channel, (...args: any) => {
            handlers.get(channel)?.forEach((callback) => {
              callback(...(args as any))
            })
          })
        }

        return () => {
          handlers.set(
            channel,
            handlers.get(channel)?.filter((x) => x !== typedCallback) ?? []
          )
        }
      },
      send<T extends SendableChannels>(channel: T, ...args: any) {
        window.ipcRender?.send(channel, ...args)
      },
    }
  }, [])

  return (
    <DesktopIpcContext.Provider value={api}>
      {props.children}
    </DesktopIpcContext.Provider>
  )
}
