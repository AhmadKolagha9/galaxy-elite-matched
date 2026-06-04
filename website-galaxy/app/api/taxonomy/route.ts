import { NextResponse } from 'next/server'
import { getBackendApiUrl, parseApiResponse } from '@/lib/backend-api'

export const runtime = 'nodejs'

type TaxonomyItem = {
  id?: string
  label: string
  slug: string
  countryScope?: string | null
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type')
  const countryScope = url.searchParams.get('country_scope')
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (countryScope) params.set('country_scope', countryScope)

  const response = await fetch(`${getBackendApiUrl()}/api/taxonomy?${params.toString()}`, {
    headers: { accept: 'application/json' },
    next: { revalidate: 3600 }
  })
  const payload = await parseApiResponse(response)

  if (!response.ok || !payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false, items: [] }, { status: response.status || 502 })
  }

  const record = payload as { items?: TaxonomyItem[] }
  return NextResponse.json({ ok: true, items: record.items ?? [] })
}
