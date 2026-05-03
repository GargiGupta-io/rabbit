import { SyncEventMap } from '../events'

export function eventOf<
  TModel extends keyof typeof SyncEventMap,
  TEvent extends keyof (typeof SyncEventMap)[TModel],
>(model: TModel, event: TEvent) {
  return SyncEventMap[model][event]
}
