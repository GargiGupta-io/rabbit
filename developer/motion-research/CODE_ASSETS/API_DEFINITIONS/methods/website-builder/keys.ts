import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('website-builder'),
  sites: (limit?: number, offset?: number, query?: string) =>
    createKey(
      queryKeys.root(),
      'sites',
      String(limit ?? 9),
      String(offset ?? 0),
      query || ''
    ),
  site: (siteId: string) => createKey(queryKeys.root(), 'site', siteId),
  pages: (siteId: string) => createKey(queryKeys.root(), 'pages', siteId),
  page: (siteId: string, pageId: string) =>
    createKey(queryKeys.root(), 'page', siteId, pageId),
  domains: (siteId: string) => createKey(queryKeys.root(), 'domains', siteId),
  analytics: (
    siteId: string,
    startDate: string,
    endDate: string,
    pageId?: string,
    category?: string
  ) =>
    createKey(
      queryKeys.root(),
      'analytics',
      siteId,
      startDate,
      endDate,
      pageId || '',
      category || ''
    ),
  job: (jobId: string) => createKey(queryKeys.root(), 'job', jobId),
  unsplashSearch: (query: string, page?: number, perPage?: number) =>
    createKey(
      queryKeys.root(),
      'unsplash-search',
      query,
      String(page || 1),
      String(perPage || 20)
    ),
  assets: (siteId: string) => createKey(queryKeys.root(), 'assets', siteId),
}
