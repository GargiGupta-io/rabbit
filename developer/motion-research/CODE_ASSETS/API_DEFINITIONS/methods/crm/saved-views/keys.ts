export const savedViewsQueryKeys = {
  root: ['crm', 'savedViews'] as const,
  savedViews: (collection?: string) =>
    collection
      ? (['crm', 'savedViews', collection] as const)
      : (['crm', 'savedViews'] as const),
  savedView: (id: string) => ['crm', 'savedViews', id] as const,
}
