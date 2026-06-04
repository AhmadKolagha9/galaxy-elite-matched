import { propertyTypes } from '@/lib/site'

export const countryOptions = ['UAE', 'UK', 'India', 'Global', 'Saudi Arabia', 'Qatar', 'Oman', 'Bahrain', 'USA', 'Canada', 'Australia', 'Singapore', 'Portugal', 'Spain', 'France', 'Italy', 'Greece', 'Turkey', 'South Africa', 'Kenya', 'Other']

export const areaOptionsByCountry: Record<string, string[]> = {
  UAE: ['Abu Dhabi', 'Al Ain', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain', 'Other UAE area'],
  UK: ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Other UK area'],
  India: ['India'],
  Global: ['Open to recommendations', 'Best for investment', 'Best for lifestyle', 'Best for relocation', 'Best for yield', 'Other global market']
}

export const propertyTypeOptions = propertyTypes

export const projectNameExamples = ['Optional project name', 'Master community', 'Tower / building name', 'Development name', 'Not applicable / private']

export const verifiedListingVisibilityOptions = [
  'Private match only',
  'Verified listing request - admin approval required',
  'Public listing only after permit and compliance approval',
  'Deal room reveal only'
]

export const propertyPurposeOptions = [
  'Sell',
  'Rent',
  'Lease commercial',
  'Sell land',
  'Joint venture / development',
  'Private matching only',
  'Developer inventory'
]

export const ownerRoleOptions = [
  'Direct owner',
  'Direct landlord',
  'Developer',
  'Licensed agent with authority',
  'Property manager with authority',
  'Representative with written mandate'
]

export const complianceDocumentTypes = [
  'Title deed / ownership proof',
  'Owner ID / passport / Emirates ID',
  'Owner consent / authority letter',
  'Power of attorney, if applicable',
  'Broker licence, if agent submits',
  'Company trade licence, if company-owned',
  'Developer registration / project approval, if applicable',
  'DLD / RERA / Trakheesi / Madmoun permit, if public UAE advertising is requested',
  'Floor plan, if available',
  'Photos, if approved for private deal room',
  'Tenancy status / vacancy proof, if rental availability',
  'NOC or building/community permission, if required'
]

export const adminDecisionOptions = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approve' },
  { value: 'verified', label: 'Mark Verified' },
  { value: 'request_documents', label: 'Request Documents' },
  { value: 'compliance_hold', label: 'Compliance Hold' },
  { value: 'rejected', label: 'Reject' },
  { value: 'archived', label: 'Archive' }
]

export const publicStatusOptions = ['Hidden', 'Open', 'Matching', 'Matched', 'Archived']

export const verificationLevels = [
  'Not started',
  'Identity received',
  'Ownership/authority received',
  'Compliance review',
  'Galaxy Elite Reviewed',
  'Verified listing approved',
  'Rejected / insufficient documents'
]
