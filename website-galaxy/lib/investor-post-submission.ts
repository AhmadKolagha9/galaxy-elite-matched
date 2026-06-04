import { z } from 'zod'
import {
  amenitiesOptions,
  categoryOptions,
  fallbackAreas,
  fallbackCountries,
  formatZodIssues,
  furnishingTypeOptions,
  offeringTypeOptions,
  projectStatusOptions,
  propertyTypeOptions
} from '@/lib/interest-submission'

export {
  amenitiesOptions,
  categoryOptions,
  fallbackAreas,
  fallbackCountries,
  formatZodIssues,
  furnishingTypeOptions,
  offeringTypeOptions,
  projectStatusOptions,
  propertyTypeOptions
}

export type TaxonomyItem = {
  id?: string
  label: string
  slug: string
  countryScope: string | null
}

export const investorTypeOptions = [
  'Individual investor',
  'Private investor',
  'Family office',
  'Corporate investor',
  'Developer/JV partner',
  'Fund/institution',
  'Relocation/investment buyer'
] as const

export const propertyCategoryOptions = [
  'Residential',
  'Commercial',
  'Off-plan',
  'Secondary',
  'Land',
  'Industrial',
  'Hospitality',
  'Investment'
] as const

export const investorMarketSegmentOptions = [
  'Off-plan',
  'Secondary',
  'Ready',
  'Under construction',
  'Income-producing',
  'Development opportunity',
  'Distressed/opportunistic',
  'Bulk units'
] as const

export const budgetVisibilityOptions = ['Show exact range', 'Show broad range', 'Hide publicly', 'Verified privately', 'Negotiable'] as const
export const riskPreferenceOptions = ['low', 'medium', 'high', 'opportunistic'] as const
export const timelineOptions = ['Ready now', 'Within 30 days', '1-3 months', '3-6 months', '6+ months', 'Future / monitoring market'] as const
export const holdingPeriodOptions = ['0-2 years', '3-5 years', '5-10 years', '10+ years', 'Flexible'] as const
export const financingMethodOptions = ['cash', 'mortgage', 'mixed', 'not disclosed'] as const

const emptyToUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value)
const requiredText = (max: number) => z.string().trim().min(1).max(max)
const optionalText = (max: number) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional())
const numericInput = (value: unknown) => (typeof value === 'string' ? Number(value.trim()) : value)
const decimalField = z.preprocess(numericInput, z.number().finite().min(0))
const intField = z.preprocess(numericInput, z.number().int().min(0).max(2147483647))
const booleanField = z.preprocess((value) => value === true || value === 'on' || value === 'true', z.boolean())
const stringArrayField = z.preprocess((value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) return [value]
  return []
}, z.array(z.string().trim().min(1)).min(1))

export const investorPostPayloadSchema = z
  .object({
    title: requiredText(255),
    investor_type: z.enum(investorTypeOptions),
    investment_goal: requiredText(65535),
    countries: stringArrayField,
    area_city: requiredText(100),
    property_categories: z.array(z.enum(propertyCategoryOptions)).min(1),
    property_types: z.array(z.enum(propertyTypeOptions)).min(1),
    market_segments: z.array(z.enum(investorMarketSegmentOptions)).min(1),
    ticket_min: decimalField,
    ticket_max: decimalField,
    budget_visibility: z.enum(budgetVisibilityOptions),
    target_yield: decimalField,
    risk_preference: z.enum(riskPreferenceOptions),
    timeline: z.enum(timelineOptions),
    holding_period: z.enum(holdingPeriodOptions),
    exit_strategy: requiredText(5000),
    financing_method: z.enum(financingMethodOptions),
    accepts_direct_owner: booleanField,
    accepts_developer: booleanField,
    accepts_agent: booleanField,
    private_description: requiredText(65535),
    category: z.enum(categoryOptions),
    offering_type: z.enum(offeringTypeOptions),
    rooms: intField,
    bedrooms: intField,
    total_floors: intField,
    parking_spaces: intField,
    furnishing_type: z.enum(furnishingTypeOptions),
    project_status: z.enum(projectStatusOptions),
    amenities: z.array(z.enum(amenitiesOptions)).min(1)
  })
  .superRefine((payload, context) => {
    if (payload.ticket_max < payload.ticket_min) {
      context.addIssue({ code: 'custom', path: ['ticket_max'], message: 'Maximum ticket must be greater than or equal to minimum ticket.' })
    }
  })

export type InvestorPostPayload = z.infer<typeof investorPostPayloadSchema>

export function formDataToInvestorPostPayload(formData: FormData) {
  return {
    title: formData.get('title'),
    investor_type: formData.get('investor_type'),
    investment_goal: formData.get('investment_goal'),
    countries: formData.getAll('countries'),
    area_city: formData.get('area_city'),
    property_categories: formData.getAll('property_categories'),
    property_types: formData.getAll('property_types'),
    market_segments: formData.getAll('market_segments'),
    ticket_min: formData.get('ticket_min'),
    ticket_max: formData.get('ticket_max'),
    budget_visibility: formData.get('budget_visibility'),
    target_yield: formData.get('target_yield'),
    risk_preference: formData.get('risk_preference'),
    timeline: formData.get('timeline'),
    holding_period: formData.get('holding_period'),
    exit_strategy: formData.get('exit_strategy'),
    financing_method: formData.get('financing_method'),
    accepts_direct_owner: formData.get('accepts_direct_owner'),
    accepts_developer: formData.get('accepts_developer'),
    accepts_agent: formData.get('accepts_agent'),
    private_description: formData.get('private_description'),
    category: formData.get('category'),
    offering_type: formData.get('offering_type'),
    rooms: formData.get('rooms'),
    bedrooms: formData.get('bedrooms'),
    total_floors: formData.get('total_floors'),
    parking_spaces: formData.get('parking_spaces'),
    furnishing_type: formData.get('furnishing_type'),
    project_status: formData.get('project_status'),
    amenities: formData.getAll('amenities')
  }
}

export function countryScopeFromSelected(countries: string[]) {
  const first = countries.find((country) => country && country !== 'global')
  return first ?? null
}
