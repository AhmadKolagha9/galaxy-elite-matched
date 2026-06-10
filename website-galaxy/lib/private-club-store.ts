import crypto from 'crypto'
import { getCollection, saveCollection, type SubmissionRecord } from '@/lib/admin-store'
import { readJson, writeJson } from '@/lib/local-store'
import type { AppUser } from '@/lib/demo-auth'

export type PrivateClubPostCard = {
  id: string
  referenceCode: string
  title: string
  status: string
  country: string
  cityArea: string
  propertyType: string
  marketSegment: string
  purpose: string
  bedrooms: string
  availabilityDate: string
  priceRange: string
  paymentMethod: string
  description: string
  amenities: string[]
  ownerUserId?: string
  ownerEmail?: string
}

export type PrivateClubMatchRequest = {
  id: string
  privateClubPostId: string
  requesterUserId: string
  requesterEmail: string
  requesterName: string
  ownerUserId: string
  ownerEmail: string
  requesterRole: 'an agent' | 'Buyer' | 'tenant' | 'other'
  message: string
  status: 'pending_owner' | 'owner_approved' | 'owner_rejected' | 'cancelled' | 'admin_review'
  adminStatus: 'pending_review' | 'in_progress' | 'approved' | 'rejected' | 'closed'
  ownerNote?: string
  adminNote?: string
  createdAt: string
  updatedAt: string
  post: Pick<PrivateClubPostCard, 'id' | 'referenceCode' | 'title' | 'country' | 'cityArea' | 'propertyType'>
}

const requestFile = 'private-club-match-requests.json'

const publicStatuses = new Set(['Open', 'Matching', 'Matched', 'Archived', 'open', 'matching', 'matched', 'archived'])
const approvedStatuses = new Set(['approved', 'verified'])

function text(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function stringList(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : []
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
}

function refFrom(id: string) {
  return `PC-${id.replace(/[^a-z0-9]/gi, '').slice(0, 12).toUpperCase()}`
}

export function privateClubReferenceCode(id: string) {
  return refFrom(id || crypto.randomUUID())
}

export function toPrivateClubPostCard(record: SubmissionRecord): PrivateClubPostCard {
  const referenceCode = text(record.referenceCode ?? record.reference_code, refFrom(record.id))
  return {
    id: record.id,
    referenceCode,
    title: text(record.title ?? record.projectName ?? record.propertyType, 'Private Club property'),
    status: text(record.publicStatus, 'Hidden'),
    country: text(record.country, 'Private country'),
    cityArea: text(record.cityArea ?? record.area_city, 'Private city'),
    propertyType: text(record.propertyType ?? record.property_type, 'Property'),
    marketSegment: text(record.marketSegment ?? record.market_segment, 'Property'),
    purpose: text(record.purpose ?? record.offeringType ?? record.offering_type, 'Private match'),
    bedrooms: text(record.bedrooms, 'Flexible'),
    availabilityDate: text(record.availabilityDate ?? record.availability_date, 'By agreement'),
    priceRange: text(record.priceRange, 'Verified privately'),
    paymentMethod: text(record.preferredPaymentMethod ?? record.preferred_payment_method, 'By agreement'),
    description: text(record.description, 'Approved Private Club post available to verified members.'),
    amenities: stringList(record.amenities),
    ownerUserId: text(record.ownerUserId ?? record.userId),
    ownerEmail: text(record.ownerEmail ?? record.email)
  }
}

export async function getPrivateClubPosts() {
  const records = await getCollection('verifiedListing')
  return records
    .filter((record) => approvedStatuses.has(String(record.approvalStatus)) || publicStatuses.has(String(record.publicStatus)))
    .filter((record) => String(record.publicStatus || '').toLowerCase() !== 'hidden')
    .map(toPrivateClubPostCard)
}

export async function getPrivateClubPostById(id: string) {
  const records = await getCollection('verifiedListing')
  const record = records.find((item) => item.id === id)
  return record ? { record, card: toPrivateClubPostCard(record) } : null
}

export async function getMyPrivateClubPosts(user: AppUser) {
  const records = await getCollection('verifiedListing')
  return records
    .filter((record) => text(record.ownerUserId ?? record.userId) === user.id || text(record.ownerEmail ?? record.email).toLowerCase() === user.email.toLowerCase())
    .map(toPrivateClubPostCard)
}

export async function updateMyPrivateClubPost(user: AppUser, id: string, action: string) {
  const records = await getCollection('verifiedListing')
  let updated: SubmissionRecord | null = null
  const next = records.filter((record) => {
    if (record.id !== id) return true
    const owns = text(record.ownerUserId ?? record.userId) === user.id || text(record.ownerEmail ?? record.email).toLowerCase() === user.email.toLowerCase()
    if (!owns) return true
    if (action === 'delete') {
      updated = record
      return false
    }
    const patch: Partial<SubmissionRecord> = {}
    if (action === 'publish') patch.publicStatus = 'Open'
    if (action === 'unpublish') patch.publicStatus = 'Hidden'
    if (action === 'draft') patch.approvalStatus = 'pending'
    updated = { ...record, ...patch, status: action === 'draft' ? 'Draft' : record.status }
    return true
  }).map((record) => record.id === id && updated ? updated : record)
  await saveCollection('verifiedListing', next)
  return updated ? toPrivateClubPostCard(updated) : null
}

export async function readPrivateClubRequests() {
  return readJson<PrivateClubMatchRequest[]>(requestFile, [])
}

export async function writePrivateClubRequests(requests: PrivateClubMatchRequest[]) {
  await writeJson(requestFile, requests as unknown as never)
}

export async function createPrivateClubRequest(input: { post: PrivateClubPostCard; requester: AppUser; requesterRole: PrivateClubMatchRequest['requesterRole']; message: string }) {
  const now = new Date().toISOString()
  const request: PrivateClubMatchRequest = {
    id: `pcr-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    privateClubPostId: input.post.id,
    requesterUserId: input.requester.id,
    requesterEmail: input.requester.email,
    requesterName: input.requester.name,
    ownerUserId: input.post.ownerUserId || '',
    ownerEmail: input.post.ownerEmail || '',
    requesterRole: input.requesterRole,
    message: input.message,
    status: 'pending_owner',
    adminStatus: 'pending_review',
    createdAt: now,
    updatedAt: now,
    post: {
      id: input.post.id,
      referenceCode: input.post.referenceCode,
      title: input.post.title,
      country: input.post.country,
      cityArea: input.post.cityArea,
      propertyType: input.post.propertyType
    }
  }
  const requests = await readPrivateClubRequests()
  requests.unshift(request)
  await writePrivateClubRequests(requests)
  return request
}
