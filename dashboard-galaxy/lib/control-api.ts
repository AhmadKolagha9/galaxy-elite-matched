import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE, adminDashboardOrigin } from '@/lib/admin-auth'

import { dealFlowStages, queueStatusOptions, queueTypeOptions, type AuditLogEntry, type ControlTaxonomyItem, type DealFlowStage, type QueueStatus, type QueueType, type TaxonomyMutationPayload, type TaxonomyType } from '@/lib/control-model'
export { dealFlowStages, queueStatusOptions, queueTypeOptions } from '@/lib/control-model'
export type { AuditLogEntry, ControlTaxonomyItem, DealFlowStage, QueueStatus, QueueType, TaxonomyMutationPayload, TaxonomyType } from '@/lib/control-model'

export type SubmissionQueueFilters = {
  type?: QueueType
  approvalStatus?: QueueStatus
  country?: string
  areaCity?: string
}

export type ControlSubmissionRecord = {
  id: string
  submittedAt?: string
  submissionType?: string
  approvalStatus?: string
  publicStatus?: string
  verificationLevel?: string
  status?: string
  approvalStatusRaw?: string
  publicStatusRaw?: string
  verificationStatusRaw?: string
  data?: Record<string, unknown>
  [key: string]: unknown
}

export type ControlDocumentRecord = {
  id: string
  ownerUserId?: string
  relatedObjectType?: string
  relatedObjectId?: string
  documentType?: string
  originalFilename?: string
  mimeType?: string
  fileSize?: number
  expiryDate?: string
  verificationStatus?: string
  verifiedBy?: string
  verifiedAt?: string
  rejectionReason?: string
  createdAt?: string
}

export class ControlApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function controlErrorStatus(error: unknown) {
  return error instanceof ControlApiError ? error.status : 500
}

export function controlErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function backendBaseUrl() {
  return (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://api.yourpropertymatch.cloud').replace(/\/$/, '')
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function recordCountry(record: ControlSubmissionRecord) {
  return text(record.country ?? record.data?.country ?? record.data?.countries)
}

function recordArea(record: ControlSubmissionRecord) {
  return text(record.area_city ?? record.areaCity ?? record.cityArea ?? record.data?.area_city ?? record.data?.areaCity ?? record.data?.cityArea)
}

function matchesLocation(record: ControlSubmissionRecord, filters: SubmissionQueueFilters) {
  const country = filters.country?.trim().toLowerCase()
  const areaCity = filters.areaCity?.trim().toLowerCase()
  if (country && recordCountry(record).toLowerCase() !== country) return false
  if (areaCity && recordArea(record).toLowerCase() !== areaCity) return false
  return true
}

export function fieldText(record: ControlSubmissionRecord, keys: string[], fallback = 'Not provided') {
  for (const key of keys) {
    const value = text(record[key] ?? record.data?.[key])
    if (value) return value
  }
  return fallback
}

export async function controlFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!idToken) throw new Error('Admin session token is missing.')

  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  headers.set('authorization', `Bearer ${idToken}`)
  headers.set('origin', adminDashboardOrigin())
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')

  const response = await fetch(`${backendBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
    cache: 'no-store'
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || body?.ok === false) {
    throw new ControlApiError(response.status, body?.error || body?.message || `Admin API request failed with ${response.status}.`)
  }
  return body as T
}

export async function getSubmissionQueue(filters: SubmissionQueueFilters) {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.approvalStatus) params.set('approvalStatus', filters.approvalStatus)
  const query = params.toString()
  const body = await controlFetch<{ ok: true; records: ControlSubmissionRecord[] }>(`/api/admin/submissions${query ? `?${query}` : ''}`)
  return body.records.filter((record) => matchesLocation(record, filters))
}

export async function getSubmissionDetail(id: string) {
  return controlFetch<{ ok: true; record: ControlSubmissionRecord; type: string }>(`/api/admin/submissions/${encodeURIComponent(id)}`)
}

export async function mutateSubmission(id: string, input: { action: 'approve' | 'reject' | 'compliance-hold'; publicStatus?: 'open' | 'hidden'; note: string }) {
  const body = input.action === 'approve'
    ? { note: input.note, publicStatus: input.publicStatus || 'hidden' }
    : { note: input.note }
  return controlFetch<{ ok: true; record?: ControlSubmissionRecord }>(`/api/admin/submissions/${encodeURIComponent(id)}/${input.action}`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export async function getDocuments() {
  const body = await controlFetch<{ ok: true; documents: ControlDocumentRecord[] }>('/api/admin/documents')
  return body.documents
}

export async function getDocumentView(id: string) {
  return controlFetch<{ ok: true; document: ControlDocumentRecord; signedUrl: string; expiresIn: number }>(`/api/admin/documents/${encodeURIComponent(id)}/view`)
}

export async function verifyDocument(id: string, input: { status: 'verified' | 'failed'; rejectionReason?: string; note?: string }) {
  return controlFetch<{ ok: true; document: ControlDocumentRecord }>(`/api/admin/documents/${encodeURIComponent(id)}/verify`, {
    method: 'POST',
    body: JSON.stringify({ status: input.status, rejection_reason: input.rejectionReason, note: input.note })
  })
}

export async function patchMatchRoomStage(id: string, input: { nextStage: DealFlowStage; note: string }) {
  return controlFetch<{ ok: true; room: { id: string; currentStage: DealFlowStage; contactUnlocked?: boolean; documentsUnlocked?: boolean; status?: string } }>(
    `/api/admin/match-rooms/${encodeURIComponent(id)}/stage`,
    {
      method: 'PATCH',
      body: JSON.stringify({ next_stage: input.nextStage, note: input.note })
    }
  )
}


function taxonomyType(value: unknown): TaxonomyType {
  const textValue = text(value) as TaxonomyType
  const allowed: TaxonomyType[] = ['country', 'area_city', 'property_category', 'property_type', 'market_segment', 'purpose']
  return allowed.includes(textValue) ? textValue : 'property_type'
}

function booleanValue(value: unknown, fallback = true) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
  return fallback
}

function numberValue(value: unknown, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function normalizeTaxonomyItem(raw: Record<string, unknown>): ControlTaxonomyItem {
  return {
    id: text(raw.id),
    taxonomyType: taxonomyType(raw.taxonomyType ?? raw.taxonomy_type),
    label: text(raw.label, 'Untitled option'),
    slug: text(raw.slug),
    parentId: text(raw.parentId ?? raw.parent_id) || null,
    countryScope: text(raw.countryScope ?? raw.country_scope) || null,
    isActive: booleanValue(raw.isActive ?? raw.is_active, true),
    sortOrder: numberValue(raw.sortOrder ?? raw.sort_order, 0),
    createdAt: text(raw.createdAt ?? raw.created_at) || undefined,
    updatedAt: text(raw.updatedAt ?? raw.updated_at) || undefined
  }
}

export async function getTaxonomyItems(filters: { type?: TaxonomyType; countryScope?: string } = {}) {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.countryScope) params.set('country_scope', filters.countryScope)
  const query = params.toString()
  const body = await controlFetch<{ ok: true; items: Array<Record<string, unknown>> }>(`/api/admin/taxonomy${query ? `?${query}` : ''}`)
  return body.items.map(normalizeTaxonomyItem).filter((item) => item.id)
}

export async function saveTaxonomyItem(input: TaxonomyMutationPayload) {
  const payload = {
    taxonomyType: input.taxonomyType,
    label: input.label,
    slug: input.slug,
    parentId: input.parentId,
    countryScope: input.countryScope,
    isActive: input.isActive,
    sortOrder: input.sortOrder
  }
  const path = input.id ? `/api/admin/taxonomy/${encodeURIComponent(input.id)}` : '/api/admin/taxonomy'
  const body = await controlFetch<{ ok: true; item: Record<string, unknown> }>(path, {
    method: input.id ? 'PATCH' : 'POST',
    body: JSON.stringify(payload)
  })
  return normalizeTaxonomyItem(body.item)
}

export async function archiveTaxonomyItem(id: string) {
  const body = await controlFetch<{ ok: true; item: Record<string, unknown> }>(`/api/admin/taxonomy/${encodeURIComponent(id)}`, { method: 'DELETE' })
  return normalizeTaxonomyItem(body.item)
}

function normalizeAuditAction(raw: Record<string, unknown>): AuditLogEntry {
  return {
    id: text(raw.id),
    adminUserId: text(raw.adminUserId ?? raw.admin_user_id) || null,
    adminEmail: text(raw.adminEmail ?? raw.admin_email) || null,
    actionType: text(raw.actionType ?? raw.action_type) || null,
    targetObjectType: text(raw.targetObjectType ?? raw.objectType ?? raw.target_object_type ?? raw.object_type) || null,
    targetObjectId: text(raw.targetObjectId ?? raw.objectId ?? raw.target_object_id ?? raw.object_id) || null,
    previousStatus: text(raw.previousStatus ?? raw.previous_status) || null,
    newStatus: text(raw.newStatus ?? raw.new_status) || null,
    note: text(raw.note) || null,
    ipAddress: text(raw.ipAddress ?? raw.ip_address) || null,
    timestamp: raw.timestamp ?? raw.createdAt ?? raw.created_at ?? null
  }
}

export async function getAuditLog(limit = 250) {
  const params = new URLSearchParams({ limit: String(limit) })
  const body = await controlFetch<{ ok: true; actions: Array<Record<string, unknown>> }>(`/api/admin/audit-log?${params}`)
  return body.actions.map(normalizeAuditAction)
}


export type NewProjectStatus = 'draft' | 'published' | 'archived'

export type ControlNewProject = {
  id: string
  reference: string
  projectName: string
  developerName: string | null
  startPrice: number | null
  endPrice: number | null
  images: string[]
  video: string | null
  description: string
  cityId: string | null
  countryId: string | null
  publicAddressLabel: string | null
  publicMapLocation: string | null
  userId: string | null
  phone: string | null
  address: string | null
  mapLocation: string | null
  status: NewProjectStatus
  createdAt: string
  updatedAt: string
}

export type NewProjectFilters = {
  status?: NewProjectStatus
  country?: string
  city?: string
  developer?: string
  keyword?: string
  minPrice?: string
  maxPrice?: string
}

export type NewProjectPayload = {
  id?: string
  projectName: string
  developerName?: string | null
  startPrice?: number | null
  endPrice?: number | null
  images: string[]
  video?: string | null
  description: string
  mapLocation?: string | null
  phone?: string | null
  address?: string | null
  cityId?: string | null
  countryId?: string | null
  status?: NewProjectStatus
}

function nullableText(value: unknown) {
  return text(value) || null
}

function nullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function imagesValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map((item) => text(item)).filter(Boolean)
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
  }
  return []
}

function projectStatus(value: unknown): NewProjectStatus {
  const raw = text(value)
  return raw === 'published' || raw === 'archived' ? raw : 'draft'
}

export function normalizeNewProject(raw: Record<string, unknown>): ControlNewProject {
  return {
    id: text(raw.id),
    reference: text(raw.reference),
    projectName: text(raw.projectName ?? raw.project_name, 'Untitled project'),
    developerName: nullableText(raw.developerName ?? raw.developer_name),
    startPrice: nullableNumber(raw.startPrice ?? raw.start_price),
    endPrice: nullableNumber(raw.endPrice ?? raw.end_price),
    images: imagesValue(raw.images),
    video: nullableText(raw.video),
    description: text(raw.description),
    cityId: nullableText(raw.cityId ?? raw.city_id),
    countryId: nullableText(raw.countryId ?? raw.country_id),
    publicAddressLabel: nullableText(raw.publicAddressLabel ?? raw.public_address_label),
    publicMapLocation: nullableText(raw.publicMapLocation ?? raw.public_map_location),
    userId: nullableText(raw.userId ?? raw.user_id),
    phone: nullableText(raw.phone),
    address: nullableText(raw.address),
    mapLocation: nullableText(raw.mapLocation ?? raw.map_location),
    status: projectStatus(raw.status),
    createdAt: text(raw.createdAt ?? raw.created_at),
    updatedAt: text(raw.updatedAt ?? raw.updated_at)
  }
}

export async function getNewProjectSummary() {
  const body = await controlFetch<{ ok: true; summary: Record<NewProjectStatus, number> }>('/api/admin/new-projects/summary')
  return { draft: body.summary.draft || 0, published: body.summary.published || 0, archived: body.summary.archived || 0 }
}

export async function getNewProjects(filters: NewProjectFilters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.country) params.set('country', filters.country)
  if (filters.city) params.set('city', filters.city)
  if (filters.developer) params.set('developer', filters.developer)
  if (filters.keyword) params.set('keyword', filters.keyword)
  if (filters.minPrice) params.set('min_price', filters.minPrice)
  if (filters.maxPrice) params.set('max_price', filters.maxPrice)
  const query = params.toString()
  const body = await controlFetch<{ ok: true; projects: Array<Record<string, unknown>> }>(`/api/admin/new-projects${query ? `?${query}` : ''}`)
  return body.projects.map(normalizeNewProject).filter((project) => project.id)
}

export async function getNewProject(id: string) {
  const body = await controlFetch<{ ok: true; project: Record<string, unknown> }>(`/api/admin/new-projects/${encodeURIComponent(id)}`)
  return normalizeNewProject(body.project)
}

export async function saveNewProject(input: NewProjectPayload) {
  const payload = {
    projectName: input.projectName,
    developerName: input.developerName,
    startPrice: input.startPrice,
    endPrice: input.endPrice,
    images: input.images,
    video: input.video,
    description: input.description,
    mapLocation: input.mapLocation,
    phone: input.phone,
    address: input.address,
    cityId: input.cityId,
    countryId: input.countryId,
    status: input.status
  }
  const path = input.id ? `/api/admin/new-projects/${encodeURIComponent(input.id)}` : '/api/admin/new-projects'
  const body = await controlFetch<{ ok: true; project: Record<string, unknown> }>(path, {
    method: input.id ? 'PATCH' : 'POST',
    body: JSON.stringify(payload)
  })
  return normalizeNewProject(body.project)
}

export async function setNewProjectStatus(id: string, status: NewProjectStatus) {
  const body = await controlFetch<{ ok: true; project: Record<string, unknown> }>(`/api/admin/new-projects/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
  return normalizeNewProject(body.project)
}

export async function archiveNewProject(id: string) {
  const body = await controlFetch<{ ok: true; project: Record<string, unknown> }>(`/api/admin/new-projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
  return normalizeNewProject(body.project)
}
