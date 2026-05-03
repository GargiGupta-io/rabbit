import type {
  CreateAssetRequest,
  CreateDomainAliasRequest,
  CreatePageRequest,
  CreateSiteRequest,
  GenerateImagesRequest,
  SingleModelListResponse,
  SingleModelResponse,
  UpdatePageRequest,
  UpdateSiteRequest,
} from '@motion/motion-net-types'
import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

// Use the actual generated types from Motion Net
export type {
  CreateSiteRequest,
  CreatePageRequest,
  UpdateSiteRequest,
  UpdatePageRequest,
  CreateDomainAliasRequest,
}

/**
 * Clone job structure for site creation response
 * Matches the backend CloneJobDto structure
 */
type CloneJobInResponse = {
  id: string
  status: string
  type: string
  siteId: string
  currentStep?: string | null
  progressPercent?: number | null
  output?: {
    pageId: string
    sourceUrl: string
  } | null
  errorMessage?: string | null
}

/**
 * Site structure for clone response
 * Extracted from SingleModelResponse for type safety
 */
type SiteInResponse = SingleModelResponse['models']['sites'][string]

/**
 * CreateSiteResponse can be one of two formats:
 * 1. Standard SingleModelResponse (when scrapeOnCreate is false)
 * 2. Clone response with site and optional job (when scrapeOnCreate is true)
 */
export type CreateSiteResponse =
  | SingleModelResponse
  | {
      site: SiteInResponse
      job?: CloneJobInResponse | null
    }
export type CreatePageResponse = SingleModelResponse
export type UpdateSiteResponse = SingleModelResponse
export type UpdatePageResponse = SingleModelResponse
export type CreateDomainAliasResponse = SingleModelResponse

// Asset upload types
export type GenerateUploadUrlRequest = {
  siteId: string
  fileName: string
}

export type GenerateUploadUrlResponse = {
  uploadUrl: string
  publicUrl: string
  filePath: string
  expiresAt: string
}

export type GenerateDownloadUrlRequest = {
  siteId: string
  fileName: string
}

export type GenerateDownloadUrlResponse = {
  downloadUrl: string
}

export const createSite = defineMutation<
  CreateSiteRequest,
  CreateSiteResponse
>().using({
  uri: `${__NET_HOST__}/v1/api/website-builder/sites`,
  method: 'POST',
  body: (args) => args,
  invalidate: () => queryKeys.sites(),
})

export const createPage = defineMutation<
  { siteId: string } & CreatePageRequest,
  CreatePageResponse
>().using({
  uri: ({ siteId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/pages`,
  method: 'POST',
  body: ({ siteId, ...args }) => args,
  invalidate: (args) => queryKeys.pages(args.siteId),
})

export const updateSite = defineMutation<
  { siteId: string } & UpdateSiteRequest,
  UpdateSiteResponse
>().using({
  uri: ({ siteId }) => `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}`,
  method: 'PUT',
  body: ({ siteId, ...args }) => args,
  invalidate: (args) => [queryKeys.site(args.siteId), queryKeys.sites()],
})

export const updatePage = defineMutation<
  { siteId: string; pageId: string } & UpdatePageRequest,
  UpdatePageResponse
>().using({
  uri: ({ siteId, pageId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/pages/${pageId}`,
  method: 'PUT',
  body: ({ siteId, pageId, ...args }) => args,
  invalidate: (args) => [
    queryKeys.page(args.siteId, args.pageId),
    queryKeys.pages(args.siteId),
  ],
})

export const generateUploadUrl = defineMutation<
  GenerateUploadUrlRequest,
  GenerateUploadUrlResponse
>().using({
  uri: `${__NET_HOST__}/v1/api/website-builder/assets/upload-url`,
  method: 'POST',
  body: (args) => args,
})

export const generateDownloadUrl = defineMutation<
  GenerateDownloadUrlRequest,
  GenerateDownloadUrlResponse
>().using({
  uri: `${__NET_HOST__}/v1/api/website-builder/assets/download-url`,
  method: 'POST',
  body: (args) => args,
})

export const publishPage = defineMutation<
  { siteId: string; pageId: string },
  UpdatePageResponse
>().using({
  uri: ({ siteId, pageId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/pages/${pageId}`,
  method: 'PUT',
  body: () => ({
    publish: true, // This triggers PagePublishingService.PublishPageAsync
  }),
  invalidate: (args) => [
    queryKeys.page(args.siteId, args.pageId),
    queryKeys.pages(args.siteId),
  ],
})

export const unpublishPage = defineMutation<
  { siteId: string; pageId: string },
  UpdatePageResponse
>().using({
  uri: ({ siteId, pageId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/pages/${pageId}`,
  method: 'PUT',
  body: () => ({
    publish: false, // This unpublishes the page
  }),
  invalidate: (args) => [
    queryKeys.page(args.siteId, args.pageId),
    queryKeys.pages(args.siteId),
  ],
})

export const createDomainAlias = defineMutation<
  { siteId: string } & CreateDomainAliasRequest,
  CreateDomainAliasResponse
>().using({
  uri: ({ siteId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/domains`,
  method: 'POST',
  body: ({ siteId, ...args }) => args,
  invalidate: (args) => [queryKeys.domains(args.siteId)],
})

export const deleteDomainAlias = defineMutation<
  { siteId: string; domainId: string },
  void
>().using({
  uri: ({ siteId, domainId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/domains/${domainId}`,
  method: 'DELETE',
  invalidate: (args) => [queryKeys.domains(args.siteId)],
})

export const deleteSite = defineMutation<{ siteId: string }, void>().using({
  uri: ({ siteId }) => `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}`,
  method: 'DELETE',
  invalidate: () => [queryKeys.sites()],
})

export const createAsset = defineMutation<
  { siteId: string } & CreateAssetRequest,
  SingleModelResponse
>().using({
  uri: ({ siteId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/assets`,
  method: 'POST',
  body: ({ siteId, ...args }) => args,
  invalidate: (args) => [queryKeys.assets(args.siteId)],
})

export const deleteAsset = defineMutation<
  { siteId: string; id: string },
  void
>().using({
  uri: ({ siteId, id }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/assets/${id}`,
  method: 'DELETE',
  invalidate: (args) => [queryKeys.assets(args.siteId)],
})

export const generateImages = defineMutation<
  { siteId: string } & GenerateImagesRequest,
  SingleModelListResponse
>().using({
  uri: ({ siteId }) =>
    `${__NET_HOST__}/v1/api/website-builder/sites/${siteId}/images/generate`,
  method: 'POST',
  body: ({ siteId, ...args }) => args,
  invalidate: (args) => [queryKeys.assets(args.siteId)],
})

// NOTE: The separate clone endpoint has been removed from the backend.
// Cloning is now done via site creation with scrapeOnCreate: true and url fields.
// For cloning into existing sites, a replacement endpoint is needed.
