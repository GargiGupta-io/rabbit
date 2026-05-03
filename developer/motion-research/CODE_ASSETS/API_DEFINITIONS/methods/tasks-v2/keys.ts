const byIdRoot = ['v2/tasks', 'by-id'] as const

export const queryKeys = {
  query: ['v2/tasks', 'query'] as const,
  byIdRoot,
  taskById: (id: string) => ['v2/tasks', 'by-id', id] as const,
  pastDue: () => ['v2/tasks', 'past-due'] as const,
  taskFeedById: (id: string) => ['v2/tasks', 'feed', id] as const,
  lazyByIdRoot: ['lazy', ...byIdRoot] as const,
}
