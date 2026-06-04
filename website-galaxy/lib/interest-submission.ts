import { z } from 'zod'

export const interestUserRoles = ['Buyer', 'Investor', 'Developer', 'agent', 'Property manager', 'Corporate client', 'Admin'] as const
export const availabilityTypeOptions = [
  'May rent privately',
  'Upcoming vacancy',
  'May sell privately',
  'Developer inventory',
  'Land opportunity',
  'Commercial opportunity',
  'Verified listing request',
  'Private matching only'
] as const
export const listingIntentOptions = [
  'Keep private - match only',
  'Request verified private listing',
  'Request public listing after compliance approval',
  'Deal room reveal only'
] as const
export const marketSegmentOptions = ['Residential', 'Commercial', 'Off-plan', 'Secondary', 'Land', 'Industrial', 'Hospitality', 'Investment', 'Special purpose', 'Other'] as const
export const propertyTypeOptions = [
  'Apartment / flat',
  'Studio apartment',
  'Serviced apartment',
  'Villa',
  'Townhouse',
  'Duplex',
  'Penthouse',
  'Mansion / luxury home',
  'Residential building',
  'Whole building / bulk units',
  'Land / development plot',
  'Residential land',
  'Commercial land',
  'Agricultural land',
  'Industrial land',
  'Mixed-use land',
  'Office',
  'Retail shop',
  'Showroom',
  'Warehouse',
  'Industrial unit',
  'Labour camp / staff accommodation',
  'Camp',
  'Commercial building',
  'Hotel / hospitality',
  'Restaurant / F&B space',
  'Clinic / medical space',
  'Farmhouse / rural property',
  'Short-term rental opportunity',
  'Off-plan unit',
  'New development unit',
  'Branded residence',
  'Investment property',
  'Other / bespoke requirement'
] as const
export const privacyLevelOptions = ['Admin only', 'Matched users only', 'Deal room only', 'Public advertising only with permit'] as const
export const categoryOptions = ['residential', 'commercial'] as const
export const offeringTypeOptions = ['rent', 'sell'] as const
export const furnishingTypeOptions = ['unfurnished', 'semi-furnished', 'Furnished'] as const
export const projectStatusOptions = ['resale', 'ready to move', 'on plan', 'under construction'] as const
export const preferredPaymentMethodOptions = ['Cash', 'Crypto', 'Installments'] as const
export const amenitiesOptions = [
  'Balcony',
  'Built-in wardrobes',
  'central A/C',
  'covered Parking',
  'private Gym',
  'Private jacuzzi',
  'kitchen appliances',
  'Maids room',
  'pets allowed',
  'private garden',
  'private pool',
  'study',
  'view of water',
  'security',
  'concierge',
  'shared spa',
  'shared Gym',
  'Maid service',
  'walk-in closet',
  'view of landmark',
  "children's play Area",
  'lobby in building',
  'childer;s pool',
  'vastu-copliant'
] as const

type TaxonomyItem = {
  label: string
  slug: string
  countryScope: string | null
}

export const fallbackCountries: TaxonomyItem[] = [
  { label: 'UAE', slug: 'uae', countryScope: null },
  { label: 'UK', slug: 'uk', countryScope: null },
  { label: 'India', slug: 'india', countryScope: null },
  { label: 'Global', slug: 'global', countryScope: null }
]

export const fallbackAreas: TaxonomyItem[] = [
  { label: 'Abu Dhabi', slug: 'abu-dhabi', countryScope: 'uae' },
  { label: 'Al Ain', slug: 'al-ain', countryScope: 'uae' },
  { label: 'Dubai', slug: 'dubai', countryScope: 'uae' },
  { label: 'Sharjah', slug: 'sharjah', countryScope: 'uae' },
  { label: 'Ajman', slug: 'ajman', countryScope: 'uae' },
  { label: 'Fujairah', slug: 'fujairah', countryScope: 'uae' },
  { label: 'Ras Al Khaimah', slug: 'ras-al-khaimah', countryScope: 'uae' },
  { label: 'Umm Al Quwain', slug: 'umm-al-quwain', countryScope: 'uae' },
  { label: 'England', slug: 'england', countryScope: 'uk' },
  { label: 'Scotland', slug: 'scotland', countryScope: 'uk' },
  { label: 'Wales', slug: 'wales', countryScope: 'uk' },
  { label: 'Northern Ireland', slug: 'northern-ireland', countryScope: 'uk' },
  { label: 'India', slug: 'india', countryScope: 'india' }
]

const emptyToUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value)
const requiredText = (max: number) => z.string().trim().min(1).max(max)
const optionalText = (max: number) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional())
const numericInput = (value: unknown) => (typeof value === 'string' ? Number(value.trim()) : value)
const decimalField = z.preprocess(numericInput, z.number().finite().min(0))
const intField = z.preprocess(numericInput, z.number().int().min(0).max(2147483647))

export const interestPayloadSchema = z
  .object({
    title: requiredText(255),
    user_role: z.enum(interestUserRoles),
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
    private_description: requiredText(65535),
    category: z.enum(categoryOptions),
    offering_type: z.enum(offeringTypeOptions),
    rooms: intField,
    bedrooms: intField,
    total_floors: intField,
    parking_spaces: intField,
    furnishing_type: z.enum(furnishingTypeOptions),
    project_status: z.enum(projectStatusOptions),
    amenities: z.array(z.enum(amenitiesOptions)).min(1),
    preferred_payment_method: z.enum(preferredPaymentMethodOptions)
  })
  .superRefine((payload, context) => {
    if (payload.price_max < payload.price_min) {
      context.addIssue({ code: 'custom', path: ['price_max'], message: 'Maximum budget must be greater than or equal to minimum budget.' })
    }
  })

export type InterestPayload = z.infer<typeof interestPayloadSchema>

export function formDataToInterestPayload(formData: FormData) {
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
    preferred_payment_method: formData.get('preferred_payment_method')
  }
}

export function countryScopeFromValue(value: string, countries: TaxonomyItem[]) {
  const country = countries.find((item) => item.slug === value || item.label === value)
  if (!country || country.slug === 'global') return null
  return country.slug
}

export function areaMatchesCountry(areaCity: string, country: string, countries: TaxonomyItem[], areas: TaxonomyItem[]) {
  const countryScope = countryScopeFromValue(country, countries)
  const area = areas.find((item) => item.slug === areaCity || item.label === areaCity)
  if (!area) return false
  if (!countryScope) return true
  return area.countryScope === null || area.countryScope === countryScope
}

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'form'}: ${issue.message}`).join(' ')
}
