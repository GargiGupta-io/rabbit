import type {
  WBDomainAlias,
  WBPage,
  WBSite,
  WebsiteBuilderAnalyticsOverview,
} from '@motion/motion-net-types'
import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

// Use the actual generated types from Motion Net
export type Site = WBSite
export type Page = WBPage
export type DomainAliasData = WBDomainAlias
export type AnalyticsOverview = WebsiteBuilderAnalyticsOverview

// Specific type for analytics overview response - now returns data directly
export type AnalyticsOverviewResponse = WebsiteBuilderAnalyticsOverview

export const getSites = defineApi<
  { limit?: number; offset?: number; query?: string },
  RouteTypes<'Site_GetSites'>['response']
>().using({
  method: 'GET',
  uri: ({ limit, offset, query }) => {
    // Validate parameters
    const validLimit =
      limit !== undefined ? Math.max(1, Math.min(limit, 100)) : 9
    const validOffset = offset !== undefined ? Math.max(0, offset) : 0

    return {
      pathname: `${__NET_HOST__}/v1/api/website-builder/sites`,
      search: {
        limit: String(validLimit),
        offset: String(validOffset),
        ...(query && query.trim() && { query: query.trim() }),
      },
    }
  },
  key: ({ limit, offset, query }) => queryKeys.sites(limit, offset, query),
})

export const getSite = defineApi<
  { siteId: string },
  RouteTypes<'Site_GetSite'>['response']
>().using({
  method: 'GET',
  uri: ({ siteId }) => `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}`,
  key: ({ siteId }) => queryKeys.site(siteId),
})

export const getPages = defineApi<
  { siteId: string },
  RouteTypes<'Page_GetPages'>['response']
>().using({
  method: 'GET',
  uri: ({ siteId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/pages`,
  key: ({ siteId }) => queryKeys.pages(siteId),
})

export const getPage = defineApi<
  { siteId: string; pageId: string },
  RouteTypes<'Page_GetPage'>['response']
>().using({
  method: 'GET',
  uri: ({ siteId, pageId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/pages/${pageId}`,
  key: ({ siteId, pageId }) => queryKeys.page(siteId, pageId),
})

export const getDomains = defineApi<
  { siteId: string },
  RouteTypes<'DomainAlias_GetDomainAliases'>['response']
>().using({
  method: 'GET',
  uri: ({ siteId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/domains`,
  key: ({ siteId }) => queryKeys.domains(siteId),
})

export const getAnalyticsOverview = defineApi<
  {
    siteId: string
    startDate: string
    endDate: string
    pageId?: string
    category?: string
  },
  AnalyticsOverviewResponse
>().using({
  method: 'GET',
  uri: ({ siteId, startDate, endDate, pageId, category }) => ({
    pathname: `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/analytics/overview`,
    search: { startDate, endDate, pageId, category },
  }),
  key: ({ siteId, startDate, endDate, pageId, category }) =>
    queryKeys.analytics(siteId, startDate, endDate, pageId, category),
})

// Job status types
export type JobStatusResponse = {
  id: string
  siteId: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  type: 'single_page_clone'
  currentStep?: string | null
  progressPercent?: number | null
  output?: {
    pageId: string
    sourceUrl: string
  }
  errorMessage?: string | null
}

export const getJobStatus = defineApi<
  { jobId: string },
  JobStatusResponse
>().using({
  method: 'GET',
  uri: ({ jobId }) => `${__NET_HOST__}/v1/api/website-builder/jobs/${jobId}`,
  key: ({ jobId }) => queryKeys.job(jobId),
})

export const searchUnsplashPhotos = defineApi<
  RouteTypes<'Unsplash_SearchPhotos'>['request'],
  RouteTypes<'Unsplash_SearchPhotos'>['response']
>().using({
  method: 'GET',
  uri: ({
    query,
    page,
    perPage,
    orderBy,
    collections,
    contentFilter,
    color,
    orientation,
  }) => ({
    pathname: `${__NET_HOST__}/v1/api/website-builder/unsplash/search/photos`,
    search: {
      query,
      ...(page !== undefined && { page: String(page) }),
      ...(perPage !== undefined && { perPage: String(perPage) }),
      ...(orderBy && { orderBy }),
      ...(collections && { collections }),
      ...(contentFilter && { contentFilter }),
      ...(color && { color }),
      ...(orientation && { orientation }),
    },
  }),
  key: ({ query, page, perPage }) =>
    queryKeys.unsplashSearch(query, page, perPage),
})

export const getAssets = defineApi<
  RouteTypes<'WebsiteAsset_GetAssets'>['request'],
  RouteTypes<'WebsiteAsset_GetAssets'>['response']
>().using({
  method: 'GET',
  uri: ({ siteId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/assets`,
  key: ({ siteId }) => queryKeys.assets(siteId),
})
