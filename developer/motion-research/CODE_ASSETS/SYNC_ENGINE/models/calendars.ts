import { z } from 'zod/v4'

export const CalendarTypeSchema = z.enum(['DEFAULT', 'FREQUENTLY_MET'])
export const CalendarAccessRoleSchema = z.enum(['EDITOR', 'OWNER', 'VIEWER'])
export const CalendarProviderTypeSchema = z.enum([
  'MICROSOFT',
  'GOOGLE',
  'APPLE',
])
export const CalendarStatusSchema = z.enum([
  'OK',
  'NOT_FOUND',
  'AUTH_ERROR',
  'UNKNOWN_ERROR',
])

export const AllowedConferenceTypesSchema = z.enum([
  'none',
  'zoom',
  'hangoutsMeet',
  'meet',
  'teamsForBusiness',
  'phone',
  'customLocation',
  // Other gcal conference types
  'eventHangout',
  'eventNamedHangout',
  // Other MS Graph conference types
  'unknown',
  'skypeForBusiness',
  'skypeForConsumer',
])

export const CalendarSchema = z.object({
  id: z.string(),
  userId: z.string(),
  emailAccountId: z.string(),
  type: CalendarTypeSchema,
  providerId: z.string(),
  accessRole: CalendarAccessRoleSchema,
  allowedConferenceTypes: AllowedConferenceTypesSchema.array(),
  colorId: z.string(),
  isEnabled: z.boolean(),
  isInMyCalendars: z.boolean(),
  isInFrequentlyMet: z.boolean(),
  isPrimary: z.boolean().default(false),
  providerType: CalendarProviderTypeSchema,
  title: z.string(),
  status: CalendarStatusSchema,
})
