import crypto from 'crypto'
import { readJson, writeJson } from '@/lib/local-store'
import type { InterestCardData, InterestStatus } from '@/lib/content'

export const collectionFiles = {
  interest: 'interest-submissions.json',
  availability: 'availability-submissions.json',
  verifiedListing: 'verified-listing-requests.json',
  investor: 'investor-posts.json',
  agent: 'agent-submissions.json',
  newsletter: 'newsletter-subscribers.json'
} as const

export type CollectionKey = keyof typeof collectionFiles

export type SubmissionRecord = {
  id: string
  submittedAt: string
  submissionType: CollectionKey
  approvalStatus: string
  publicStatus: string
  status: string
  verificationLevel?: string
  complianceNotes?: string
  decisionAt?: string
  documentChecklist?: string[]
  uploadedDocuments?: Array<{ name: string; size: number; type: string; field: string }>
  [key: string]: unknown
}

const labels: Record<CollectionKey, string> = {
  interest: 'Interest Posts',
  availability: 'Private Availability',
  verifiedListing: 'Private Club Posts',
  investor: 'Investor Posts',
  agent: 'Agent Registrations',
  newsletter: 'Newsletter'
}

export function getCollectionLabel(collection: CollectionKey) {
  return labels[collection]
}

export function makeSubmissionId(prefix: CollectionKey) {
  return `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
}

export function makeSubmissionPayload<T extends Record<string, unknown>>(collection: CollectionKey, data: T, extra: Record<string, unknown> = {}): SubmissionRecord & T {
  return {
    id: makeSubmissionId(collection),
    submittedAt: new Date().toISOString(),
    submissionType: collection,
    approvalStatus: 'pending',
    publicStatus: 'Hidden',
    status: 'Pending Review',
    verificationLevel: 'Not started',
    ...data,
    ...extra
  } as SubmissionRecord & T
}

export async function getCollection(collection: CollectionKey): Promise<SubmissionRecord[]> {
  return readJson<SubmissionRecord[]>(collectionFiles[collection], [])
}

export async function saveCollection(collection: CollectionKey, records: SubmissionRecord[]) {
  await writeJson(collectionFiles[collection], records as never)
}

export async function addSubmission(record: SubmissionRecord) {
  const records = await getCollection(record.submissionType)
  records.unshift(record)
  await saveCollection(record.submissionType, records)
}

export async function updateSubmissionDecision({
  collection,
  id,
  approvalStatus,
  publicStatus,
  verificationLevel,
  complianceNotes
}: {
  collection: CollectionKey
  id: string
  approvalStatus: string
  publicStatus: string
  verificationLevel: string
  complianceNotes: string
}) {
  const records = await getCollection(collection)
  const next = records.map((record) => {
    if (record.id !== id) return record
    return {
      ...record,
      approvalStatus,
      publicStatus,
      verificationLevel,
      complianceNotes,
      status: statusLabel(approvalStatus, publicStatus),
      decisionAt: new Date().toISOString()
    }
  })
  await saveCollection(collection, next)
}

function statusLabel(approvalStatus: string, publicStatus: string) {
  if (approvalStatus === 'approved' && publicStatus !== 'Hidden') return publicStatus
  if (approvalStatus === 'verified') return publicStatus === 'Hidden' ? 'Verified Private' : publicStatus
  if (approvalStatus === 'request_documents') return 'Documents Requested'
  if (approvalStatus === 'compliance_hold') return 'Compliance Hold'
  if (approvalStatus === 'rejected') return 'Rejected'
  if (approvalStatus === 'archived') return 'Archived'
  return 'Pending Review'
}

export async function getAllAdminCollections() {
  const entries = await Promise.all((Object.keys(collectionFiles) as CollectionKey[]).map(async (key) => ({ key, label: getCollectionLabel(key), records: await getCollection(key) })))
  return entries
}

export async function getAdminSummary() {
  const collections = await getAllAdminCollections()
  const total = collections.reduce((sum, collection) => sum + collection.records.length, 0)
  const pending = collections.reduce((sum, collection) => sum + collection.records.filter((record) => record.approvalStatus === 'pending').length, 0)
  const approved = collections.reduce((sum, collection) => sum + collection.records.filter((record) => ['approved', 'verified'].includes(record.approvalStatus)).length, 0)
  const holds = collections.reduce((sum, collection) => sum + collection.records.filter((record) => ['request_documents', 'compliance_hold'].includes(record.approvalStatus)).length, 0)
  return { total, pending, approved, holds, collections }
}

export async function getApprovedInterestCards(): Promise<InterestCardData[]> {
  const records = await getCollection('interest')
  return records
    .filter((record) => ['approved', 'verified'].includes(String(record.approvalStatus)) && ['Open', 'Matching', 'Matched', 'Archived'].includes(String(record.publicStatus)))
    .map((record) => ({
      id: record.id,
      status: String(record.publicStatus) as InterestStatus,
      badge: String(record.role || record.investorProfile || 'Verified Interest'),
      title: String(record.title || `${record.purpose || 'Interest'} request in ${record.country || 'Global'}`),
      country: String(record.country || 'Global'),
      area: String(record.cityArea || record.area || 'Private area'),
      type: String(record.propertyType || record.marketSegment || 'Property'),
      size: String(record.size || 'Flexible'),
      budget: String(record.budget || record.budgetVisibility || 'Hidden publicly'),
      timeline: String(record.timeline || 'Private timeline'),
      accepts: String(record.agentPreference || record.responsePreference || 'Verified responders only'),
      description: String(record.description || 'Approved interest. Full profile available only after mutual approval.')
    }))
}
