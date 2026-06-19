import { getBackendApiUrl } from '@/lib/backend-api'

export type PublicNewProject = {
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
  status: 'published'
  createdAt: string
  updatedAt: string
}

export type NewProjectSearchParams = {
  country?: string
  city?: string
  developer?: string
  keyword?: string
  min_price?: string
  max_price?: string
}

type RawProject = Record<string, unknown>

function text(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function parseImages(value: unknown) {
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

function rawProjectsFromResponse(body: unknown): RawProject[] {
  if (Array.isArray(body)) return body.filter((item): item is RawProject => item !== null && typeof item === 'object')
  if (!body || typeof body !== 'object') return []
  const record = body as RawProject
  for (const key of ['projects', 'records', 'items', 'data', 'results']) {
    const value = record[key]
    if (Array.isArray(value)) return value.filter((item): item is RawProject => item !== null && typeof item === 'object')
  }
  return []
}

function rawProjectFromResponse(body: unknown): RawProject | null {
  if (!body || typeof body !== 'object') return null
  const record = body as RawProject
  const project = record.project ?? record.record ?? record.item ?? record.data ?? body
  return project && typeof project === 'object' && !Array.isArray(project) ? project as RawProject : null
}

export function toPublicNewProject(record: RawProject): PublicNewProject {
  return {
    id: text(record.id, text(record.reference, 'new-project')),
    reference: text(record.reference, text(record.id, 'NP-PENDING')),
    projectName: text(record.projectName ?? record.project_name, 'New project'),
    developerName: text(record.developerName ?? record.developer_name) || null,
    startPrice: numberOrNull(record.startPrice ?? record.start_price),
    endPrice: numberOrNull(record.endPrice ?? record.end_price),
    images: parseImages(record.images),
    video: text(record.video) || null,
    description: text(record.description, 'Approved development project available through Galaxy Elite.'),
    cityId: text(record.cityId ?? record.city_id) || null,
    countryId: text(record.countryId ?? record.country_id) || null,
    publicAddressLabel: text(record.publicAddressLabel ?? record.public_address_label) || null,
    publicMapLocation: text(record.publicMapLocation ?? record.public_map_location) || null,
    status: 'published',
    createdAt: text(record.createdAt ?? record.created_at, new Date().toISOString()),
    updatedAt: text(record.updatedAt ?? record.updated_at, new Date().toISOString())
  }
}

function buildProjectQuery(params: NewProjectSearchParams) {
  const query = new URLSearchParams()
  if (params.country) query.set('country', params.country)
  if (params.city) query.set('city', params.city)
  if (params.developer) query.set('developer', params.developer)
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.min_price) query.set('min_price', params.min_price)
  if (params.max_price) query.set('max_price', params.max_price)
  return query.toString()
}

export async function getPublicNewProjects(params: NewProjectSearchParams = {}) {
  try {
    const query = buildProjectQuery(params)
    const response = await fetch(getBackendApiUrl() + '/api/new-projects' + (query ? `?${query}` : ''), {
      headers: { accept: 'application/json' },
      next: { revalidate: 120 }
    })
    if (!response.ok) return []
    const body: unknown = await response.json()
    return rawProjectsFromResponse(body).map(toPublicNewProject)
  } catch {
    return []
  }
}

export async function getPublicNewProject(reference: string) {
  try {
    const response = await fetch(getBackendApiUrl() + '/api/new-projects/' + encodeURIComponent(reference), {
      headers: { accept: 'application/json' },
      next: { revalidate: 120 }
    })
    if (!response.ok) return null
    const body: unknown = await response.json()
    const raw = rawProjectFromResponse(body)
    return raw ? toPublicNewProject(raw) : null
  } catch {
    return null
  }
}

export function formatProjectPrice(project: Pick<PublicNewProject, 'startPrice' | 'endPrice'>) {
  const format = (value: number) => new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(value)
  if (project.startPrice !== null && project.endPrice !== null) return `AED ${format(project.startPrice)} - ${format(project.endPrice)}`
  if (project.startPrice !== null) return `From AED ${format(project.startPrice)}`
  if (project.endPrice !== null) return `Up to AED ${format(project.endPrice)}`
  return 'Price on request'
}

export function projectLocation(project: Pick<PublicNewProject, 'publicAddressLabel' | 'cityId' | 'countryId'>) {
  return project.publicAddressLabel || [project.cityId, project.countryId].filter(Boolean).join(', ') || 'Location shared by Galaxy Elite'
}
