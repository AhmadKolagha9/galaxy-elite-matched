import { z } from 'zod'

const consentSchema = z.literal(true).or(z.string().transform((value) => value === 'on'))
const optionalText = z.string().optional().default('')

export const interestSchema = z.object({
  role: z.string().min(2),
  purpose: z.string().min(2),
  marketSegment: optionalText,
  country: z.string().min(2),
  area: optionalText,
  cityArea: z.string().min(1),
  projectName: optionalText,
  propertyType: z.string().min(2),
  size: optionalText,
  budget: optionalText,
  budgetVisibility: z.string().min(2),
  timeline: z.string().min(2),
  agentPreference: z.string().min(2),
  description: z.string().min(10),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  consent: consentSchema
})

export const availabilitySchema = z.object({
  role: z.string().min(2),
  availabilityType: z.string().min(2),
  listingIntent: z.string().min(2),
  marketSegment: z.string().min(2),
  country: z.string().min(2),
  cityArea: z.string().min(1),
  projectName: optionalText,
  buildingName: optionalText,
  propertyType: z.string().min(2),
  size: optionalText,
  priceRange: z.string().min(1),
  availabilityDate: z.string().min(1),
  privacyLevel: z.string().min(2),
  authority: z.string().min(2),
  description: z.string().min(10),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  consent: consentSchema
})

export const verifiedListingSchema = z.object({
  submitterRole: z.string().min(2),
  listingIntent: z.string().min(2),
  marketSegment: z.string().min(2),
  purpose: z.string().min(2),
  country: z.string().min(2),
  cityArea: z.string().min(1),
  projectName: optionalText,
  buildingName: optionalText,
  propertyType: z.string().min(2),
  size: optionalText,
  priceRange: z.string().min(1),
  availabilityDate: optionalText,
  ownershipStatus: z.string().min(2),
  permitStatus: z.string().min(2),
  description: z.string().min(10),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  strictVerification: consentSchema,
  consent: consentSchema
})

export const investorPostSchema = z.object({
  investorProfile: z.string().min(2),
  investorGoal: z.string().min(2),
  marketSegment: z.string().min(2),
  country: z.string().min(2),
  cityArea: z.string().min(1),
  propertyType: z.string().min(2),
  ticketSize: z.string().min(1),
  targetYield: optionalText,
  riskPreference: z.string().min(2),
  timeline: z.string().min(2),
  budgetVisibility: z.string().min(2),
  agentPreference: z.string().min(2),
  description: z.string().min(10),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  consent: consentSchema
})

export const agentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  company: z.string().min(2),
  licenceNumber: z.string().min(2),
  country: z.string().min(2),
  representation: z.string().min(2),
  authority: z.string().min(2),
  disclosure: consentSchema
})

export const newsletterSchema = z.object({
  email: z.string().email(),
  name: optionalText,
  segment: optionalText
})

export function formDataToObject(formData: FormData) {
  const entries = Object.fromEntries(formData.entries())
  return entries
}

export function filesFromFormData(formData: FormData) {
  const files: Array<{ name: string; size: number; type: string; field: string }> = []
  for (const [field, value] of formData.entries()) {
    if (typeof value !== 'string' && value.name && value.size > 0) {
      files.push({ field, name: value.name, size: value.size, type: value.type || 'application/octet-stream' })
    }
  }
  return files
}
