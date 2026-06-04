export type QueueType = 'interest' | 'availability' | 'investor'
export type QueueStatus = 'pending_review' | 'under_verification' | 'compliance_hold' | 'approved' | 'rejected'

export type DealFlowStage =
  | 'interest_received'
  | 'response_received'
  | 'identity_check'
  | 'authority_check'
  | 'match_proposed'
  | 'mutual_approval'
  | 'match_room_opened'
  | 'viewing_meeting'
  | 'offer_negotiation'
  | 'agreement_executed'
  | 'completed'

export type TaxonomyType = 'country' | 'area_city' | 'property_category' | 'property_type' | 'market_segment' | 'purpose'

export type ControlTaxonomyItem = {
  id: string
  taxonomyType: TaxonomyType
  label: string
  slug: string
  parentId: string | null
  countryScope: string | null
  isActive: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
  children?: ControlTaxonomyItem[]
}

export type TaxonomyMutationPayload = {
  id?: string
  taxonomyType: TaxonomyType
  label: string
  slug: string
  parentId: string | null
  countryScope: string | null
  isActive: boolean
  sortOrder: number
}

export type AuditLogEntry = {
  id: string
  adminUserId?: string | null
  adminEmail?: string | null
  actionType?: string | null
  targetObjectType?: string | null
  targetObjectId?: string | null
  previousStatus?: string | null
  newStatus?: string | null
  note?: string | null
  ipAddress?: string | null
  timestamp?: unknown
}

export const queueTypeOptions = [
  { value: 'interest', label: 'Interest' },
  { value: 'availability', label: 'Availability' },
  { value: 'investor', label: 'Investor Post' }
] as const

export const queueStatusOptions = [
  { value: 'pending_review', label: 'Pending review' },
  { value: 'under_verification', label: 'Under verification' },
  { value: 'compliance_hold', label: 'Compliance hold' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
] as const

export const dealFlowStages: Array<{ value: DealFlowStage; label: string }> = [
  { value: 'interest_received', label: 'Interest received' },
  { value: 'response_received', label: 'Response received' },
  { value: 'identity_check', label: 'Identity check' },
  { value: 'authority_check', label: 'Authority check' },
  { value: 'match_proposed', label: 'Match proposed' },
  { value: 'mutual_approval', label: 'Mutual approval' },
  { value: 'match_room_opened', label: 'Match room opened' },
  { value: 'viewing_meeting', label: 'Viewing / meeting' },
  { value: 'offer_negotiation', label: 'Offer / negotiation' },
  { value: 'agreement_executed', label: 'Agreement executed' },
  { value: 'completed', label: 'Completed' }
]


export const taxonomyTypeOptions: Array<{ value: TaxonomyType; label: string }> = [
  { value: 'country', label: 'Country' },
  { value: 'area_city', label: 'Area / City' },
  { value: 'property_category', label: 'Property Category' },
  { value: 'property_type', label: 'Property Type' },
  { value: 'market_segment', label: 'Market Segment' },
  { value: 'purpose', label: 'Purpose' }
]

export function slugifyControlValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}
