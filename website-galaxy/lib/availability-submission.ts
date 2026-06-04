import { z } from 'zod'
import type { AvailabilityVerificationDocument } from '@/lib/availability-document-upload'
import {
  amenitiesOptions,
  areaMatchesCountry,
  availabilityTypeOptions,
  categoryOptions,
  countryScopeFromValue,
  fallbackAreas,
  fallbackCountries,
  formatZodIssues,
  furnishingTypeOptions,
  listingIntentOptions,
  marketSegmentOptions,
  offeringTypeOptions,
  privacyLevelOptions,
  projectStatusOptions,
  preferredPaymentMethodOptions,
  propertyTypeOptions
} from '@/lib/interest-submission'

export {
  amenitiesOptions,
  areaMatchesCountry,
  availabilityTypeOptions,
  categoryOptions,
  countryScopeFromValue,
  fallbackAreas,
  fallbackCountries,
  formatZodIssues,
  furnishingTypeOptions,
  listingIntentOptions,
  marketSegmentOptions,
  offeringTypeOptions,
  privacyLevelOptions,
  projectStatusOptions,
  preferredPaymentMethodOptions,
  propertyTypeOptions
}

export const availabilityUserRoles = [
  'Direct owner',
  'Direct landlord',
  'Developer',
  'Licensed agent with authority',
  'Property manager with authority',
  'Representative with written mandate'
] as const

export const authorityDeclarationOptions = [
  'I am the direct owner/landlord',
  'I have written authority',
  'I represent a developer',
  'I am a licensed agent and will upload proof later'
] as const

const directPrincipalRoles = new Set<string>(['Direct owner', 'Direct landlord', 'Developer'])
const emptyToUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value)
const requiredText = (max: number) => z.string().trim().min(1).max(max)
const optionalText = (max: number) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional())
const numericInput = (value: unknown) => (typeof value === 'string' ? Number(value.trim()) : value)
const decimalField = z.preprocess(numericInput, z.number().finite().min(0))
const intField = z.preprocess(numericInput, z.number().int().min(0).max(2147483647))
const verificationDocumentSchema = z.object({
  document_type: z.string().trim().max(120).optional(),
  storage_path: z.string().trim().max(500).optional(),
  file_path: z.string().trim().max(500).optional(),
  url: z.string().trim().max(500).optional(),
  original_filename: z.string().trim().max(255).optional(),
  mime_type: z.string().trim().max(120).optional(),
  file_size: z.number().int().min(1).max(10 * 1024 * 1024).optional()
}).passthrough()
const amenitiesJsonField = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value
    try {
      return JSON.parse(value) as unknown
    } catch {
      return value
    }
  },
  z.array(z.enum(amenitiesOptions)).min(1).transform((values) => JSON.stringify(Array.from(new Set(values))))
)

export const availabilityPayloadSchema = z
  .object({
    title: requiredText(255),
    user_role: z.enum(availabilityUserRoles),
    availability_type: z.enum(availabilityTypeOptions),
    listing_intent: z.enum(listingIntentOptions),
    market_segment: z.enum(marketSegmentOptions),
    property_type: z.enum(propertyTypeOptions),
    country: requiredText(100),
    area_city: requiredText(100),
    project_name: optionalText(255),
    building_name: optionalText(255),
    size_sqft: decimalField,
    price_min: decimalField,
    price_max: decimalField,
    availability_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format.'),
    privacy_level: z.enum(privacyLevelOptions),
    authority_declaration: z.enum(authorityDeclarationOptions),
    private_description: requiredText(65535),
    category: z.enum(categoryOptions),
    offering_type: z.enum(offeringTypeOptions),
    rooms: intField,
    bedrooms: intField,
    total_floors: intField,
    parking_spaces: intField,
    furnishing_type: z.enum(furnishingTypeOptions),
    project_status: z.enum(projectStatusOptions),
    amenities: amenitiesJsonField,
    preferred_payment_method: z.enum(preferredPaymentMethodOptions),
    verification_documents: z.array(verificationDocumentSchema).max(20).optional()
  })
  .superRefine((payload, context) => {
    if (payload.price_max < payload.price_min) {
      context.addIssue({ code: 'custom', path: ['price_max'], message: 'Maximum price must be greater than or equal to minimum price.' })
    }
  })

export type AvailabilityPayload = z.infer<typeof availabilityPayloadSchema>

export function formDataToAvailabilityPayload(formData: FormData, verificationDocuments: AvailabilityVerificationDocument[] = []) {
  return {
    title: formData.get('title'),
    user_role: formData.get('user_role'),
    availability_type: formData.get('availability_type'),
    listing_intent: formData.get('listing_intent'),
    market_segment: formData.get('market_segment'),
    property_type: formData.get('property_type'),
    country: formData.get('country'),
    area_city: formData.get('area_city'),
    project_name: formData.get('project_name'),
    building_name: formData.get('building_name'),
    size_sqft: formData.get('size_sqft'),
    price_min: formData.get('price_min'),
    price_max: formData.get('price_max'),
    availability_date: formData.get('availability_date'),
    privacy_level: formData.get('privacy_level'),
    authority_declaration: formData.get('authority_declaration'),
    private_description: formData.get('private_description'),
    category: formData.get('category'),
    offering_type: formData.get('offering_type'),
    rooms: formData.get('rooms'),
    bedrooms: formData.get('bedrooms'),
    total_floors: formData.get('total_floors'),
    parking_spaces: formData.get('parking_spaces'),
    furnishing_type: formData.get('furnishing_type'),
    project_status: formData.get('project_status'),
    amenities: formData.getAll('amenities'),
    preferred_payment_method: formData.get('preferred_payment_method'),
    verification_documents: verificationDocuments
  }
}

export function requiresProfessionalVerification(role: string) {
  return !directPrincipalRoles.has(role)
}
