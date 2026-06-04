import { getBackendApiUrl } from '@/lib/backend-api'

export const hiddenPublicValue = 'Hidden publicly, verified privately'

export type PublicInterestBoardSearchParams = {
  country?: string
  market_segment?: string
  property_type?: string
}

export type PublicInterestCard = {
  id: string
  status: 'Open' | 'Matching' | 'Matched' | 'Archived'
  badge: string
  title: string
  country: string
  area: string
  type: string
  size: string
  budget: string
  timeline: string
  accepts: string
  description: string
  amenities: string[]
  verified: boolean
  budgetVisibility?: string
  ticketVisibility?: string
}

type RawInterestRecord = Record<string, unknown>

const activePublicStatuses = new Set(['open', 'matching', 'matched'])
const privateVisibilityValues = new Set(['hide publicly', 'hidden publicly', 'verified privately', 'visible to verified landlords only'])

function text(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function lower(value: unknown, fallback = '') {
  return text(value, fallback).toLowerCase()
}

function firstText(record: RawInterestRecord, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = text(record[key])
    if (value) return value
  }
  return fallback
}

function numberText(record: RawInterestRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value.toLocaleString()
    if (typeof value === 'string' && value.trim()) return Number.isFinite(Number(value)) ? Number(value).toLocaleString() : value.trim()
  }
  return ''
}

function moneyRange(record: RawInterestRecord) {
  const min = numberText(record, ['price_min', 'budget_min', 'ticket_min'])
  const max = numberText(record, ['price_max', 'budget_max', 'ticket_max'])
  const currency = firstText(record, ['currency', 'budget_currency'], '')
  if (min && max) return `${currency ? `${currency} ` : ''}${min}-${max}`
  return firstText(record, ['budget', 'budget_label', 'ticket_label'], hiddenPublicValue)
}

function isPrivateVisibility(value: unknown) {
  const normalized = lower(value)
  return privateVisibilityValues.has(normalized)
}

export function anonymousRoleLabel(userRole: unknown) {
  const role = lower(userRole)
  if (role.includes('investor')) return 'Verified Investor'
  if (role.includes('tenant')) return 'Registered Tenant'
  if (role.includes('buyer')) return 'Verified Buyer'
  if (role.includes('developer')) return 'Verified Developer'
  if (role.includes('corporate')) return 'Verified Corporate Client'
  if (role.includes('property manager')) return 'Verified Property Manager'
  return 'Verified Member'
}

export function publicBudgetLabel(record: RawInterestRecord) {
  if (
    isPrivateVisibility(record.budget_visibility) ||
    isPrivateVisibility(record.budgetVisibility) ||
    isPrivateVisibility(record.ticket_visibility) ||
    isPrivateVisibility(record.ticketVisibility)
  ) {
    return hiddenPublicValue
  }

  return moneyRange(record)
}

function parseAmenities(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  if (typeof value !== 'string' || !value.trim()) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }

  return []
}

function publicStatus(record: RawInterestRecord): PublicInterestCard['status'] {
  const status = lower(record.public_status ?? record.publicStatus, 'open')
  if (status === 'matching') return 'Matching'
  if (status === 'matched') return 'Matched'
  if (status === 'archived') return 'Archived'
  return 'Open'
}

function isApprovedAndOpen(record: RawInterestRecord) {
  const approval = lower(record.approval_status ?? record.approvalStatus, 'approved')
  const publicStatusValue = lower(record.public_status ?? record.publicStatus, 'open')
  return approval === 'approved' && activePublicStatuses.has(publicStatusValue)
}

function matchesSearch(record: RawInterestRecord, params: PublicInterestBoardSearchParams) {
  return (['country', 'market_segment', 'property_type'] as const).every((key) => {
    if (!params[key]) return true
    return lower(record[key]) === params[key]!.trim().toLowerCase()
  })
}

function rawRecordsFromResponse(body: unknown): RawInterestRecord[] {
  if (Array.isArray(body)) return body.filter((item): item is RawInterestRecord => item !== null && typeof item === 'object')
  if (!body || typeof body !== 'object') return []

  const record = body as RawInterestRecord
  for (const key of ['records', 'items', 'data', 'results']) {
    const value = record[key]
    if (Array.isArray(value)) return value.filter((item): item is RawInterestRecord => item !== null && typeof item === 'object')
  }

  return []
}

export function toPublicInterestCard(record: RawInterestRecord): PublicInterestCard {
  const fallbackId = firstText(record, ['title'], 'approved-interest').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'approved-interest'
  const id = firstText(record, ['id', 'interest_id', 'uuid'], fallbackId)
  const verified = lower(record.verification_status ?? record.verificationStatus) === 'verified'
  const area = firstText(record, ['area_city', 'area', 'city'], 'Area available after match')
  const size = firstText(record, ['size', 'size_label']) || `${numberText(record, ['size_sqft']) || 'Flexible'} sq ft`
  const date = firstText(record, ['availability_date', 'timeline'])

  return {
    id,
    status: publicStatus(record),
    badge: anonymousRoleLabel(record.user_role ?? record.userRole),
    title: firstText(record, ['title'], 'Approved demand profile'),
    country: firstText(record, ['country'], 'Global'),
    area,
    type: firstText(record, ['property_type', 'propertyType'], 'Property requirement'),
    size,
    budget: publicBudgetLabel(record),
    timeline: date ? `Target from ${date}` : 'Timeline available after match',
    accepts: firstText(record, ['accepts', 'accepted_counterparties'], 'Owners, developers and licensed representatives'),
    description: firstText(record, ['public_summary', 'summary', 'description'], 'Approved demand profile available for verified private matching.'),
    amenities: parseAmenities(record.amenities),
    verified,
    budgetVisibility: text(record.budget_visibility ?? record.budgetVisibility),
    ticketVisibility: text(record.ticket_visibility ?? record.ticketVisibility)
  }
}

export async function getPublicInterestCards(params: PublicInterestBoardSearchParams) {
  const query = new URLSearchParams()
  for (const key of ['country', 'market_segment', 'property_type'] as const) {
    if (params[key]) query.set(key, params[key]!)
  }

  try {
    const queryString = query.toString()
    const response = await fetch(getBackendApiUrl() + '/api/interest' + (queryString ? '?' + queryString : ''), {
      headers: { accept: 'application/json' },
      next: { revalidate: 60 }
    })
    if (!response.ok) return []
    const body: unknown = await response.json()
    return rawRecordsFromResponse(body)
      .filter((record) => isApprovedAndOpen(record))
      .filter((record) => matchesSearch(record, params))
      .map(toPublicInterestCard)
  } catch {
    return []
  }
}
