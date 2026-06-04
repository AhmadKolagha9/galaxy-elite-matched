import { NextResponse } from 'next/server'
import { controlErrorMessage, controlErrorStatus, saveTaxonomyItem } from '@/lib/control-api'
import { taxonomyTypeOptions, type TaxonomyMutationPayload, type TaxonomyType } from '@/lib/control-model'

const taxonomyTypes = new Set(taxonomyTypeOptions.map((item) => item.value))

function payloadFromBody(body: Record<string, unknown>): TaxonomyMutationPayload | null {
  const taxonomyType = typeof body.taxonomyType === 'string' && taxonomyTypes.has(body.taxonomyType as TaxonomyType) ? body.taxonomyType as TaxonomyType : null
  const label = typeof body.label === 'string' ? body.label.trim() : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  if (!taxonomyType || !label || !slug) return null

  return {
    taxonomyType,
    label,
    slug,
    parentId: typeof body.parentId === 'string' && body.parentId ? body.parentId : null,
    countryScope: typeof body.countryScope === 'string' && body.countryScope ? body.countryScope : null,
    isActive: body.isActive !== false,
    sortOrder: Number.isInteger(Number(body.sortOrder)) ? Number(body.sortOrder) : 0
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const payload = body ? payloadFromBody(body) : null
  if (!payload) return NextResponse.json({ ok: false, error: 'Valid taxonomy type, label, and slug are required.' }, { status: 400 })

  try {
    const item = await saveTaxonomyItem(payload)
    return NextResponse.json({ ok: true, item })
  } catch (error) {
    return NextResponse.json({ ok: false, error: controlErrorMessage(error, 'Could not save taxonomy item.') }, { status: controlErrorStatus(error) })
  }
}
