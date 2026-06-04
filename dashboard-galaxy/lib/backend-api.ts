import type { CollectionKey, SubmissionRecord } from '@/lib/admin-store'
import type { InterestCardData, InterestStatus } from '@/lib/content'

const collectionPath: Record<CollectionKey, string> = {
  interest: 'interest',
  availability: 'availability',
  verifiedListing: 'verified-listing',
  investor: 'investor-post',
  agent: 'agent',
  newsletter: 'newsletter'
}

function baseUrl() {
  return (process.env.BACKEND_API_URL || '').replace(/\/$/, '')
}

export function isBackendApiConfigured() {
  return Boolean(baseUrl())
}

async function backendFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  if (process.env.BACKEND_INTERNAL_API_KEY) headers.set('x-internal-api-key', process.env.BACKEND_INTERNAL_API_KEY)

  const response = await fetch(url, { ...init, headers, cache: 'no-store' })
  const json = await response.json().catch(() => null)
  if (!response.ok || json?.ok === false) {
    throw new Error(json?.error || `Backend API request failed: ${response.status}`)
  }
  return json as T
}

export async function submitToBackend(collection: CollectionKey, data: Record<string, unknown>) {
  return backendFetch<{ ok: true; id?: string; status?: string; message?: string }>(`/api/${collectionPath[collection]}`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function getBackendAdminCollections() {
  const json = await backendFetch<{ ok: true; collections: Array<{ key: CollectionKey; label: string; records: SubmissionRecord[] }> }>('/api/admin/submissions/collections')
  return json.collections
}

export async function getBackendAdminSummary() {
  const json = await backendFetch<{ ok: true; summary: { total: number; pending: number; approved: number; holds: number; collections: Array<{ key: CollectionKey; label: string; records: SubmissionRecord[] }> } }>('/api/admin/submissions/summary')
  return json.summary
}

export async function getBackendCollection(collection: CollectionKey) {
  const collections = await getBackendAdminCollections()
  return collections.find((item) => item.key === collection)?.records ?? []
}

export async function updateBackendSubmissionDecision(input: {
  id: string
  approvalStatus: string
  publicStatus: string
  verificationLevel: string
  complianceNotes: string
}) {
  await backendFetch(`/api/admin/submissions/${input.id}/decision`, {
    method: 'POST',
    body: JSON.stringify({ ...input, note: input.complianceNotes })
  })
}

export async function getBackendApprovedInterestCards(): Promise<InterestCardData[]> {
  const json = await backendFetch<{ ok: true; records: Array<{ id: string; data: Record<string, unknown>; publicStatus: string }> }>('/api/interest')
  return json.records.map((record) => {
    const data = record.data || {}
    return {
      id: record.id,
      status: (record.publicStatus[0]?.toUpperCase() + record.publicStatus.slice(1)) as InterestStatus,
      badge: String(data.role || data.investorProfile || 'Verified Interest'),
      title: String(data.title || `${data.purpose || 'Interest'} request in ${data.country || 'Global'}`),
      country: String(data.country || 'Global'),
      area: String(data.cityArea || data.area || 'Private area'),
      type: String(data.propertyType || data.marketSegment || 'Property'),
      size: String(data.size || 'Flexible'),
      budget: String(data.budget || data.budgetVisibility || 'Hidden publicly'),
      timeline: String(data.timeline || 'Private timeline'),
      accepts: String(data.agentPreference || data.responsePreference || 'Verified responders only'),
      description: String(data.description || 'Approved interest. Full profile available only after mutual approval.')
    }
  })
}
