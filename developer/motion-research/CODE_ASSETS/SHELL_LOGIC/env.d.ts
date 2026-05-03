/// <reference types="vite/client" />

interface IpcRender {
  send: (channel: string, ...args: any) => void
  receive: (channel: string, func: (...args: any) => void) => void
}

interface Window {
  ipcRender: IpcRender
}
