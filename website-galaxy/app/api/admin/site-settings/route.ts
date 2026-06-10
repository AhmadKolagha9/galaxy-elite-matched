import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { cleanSiteSettings, getSiteSettings, saveSiteSettings } from '@/lib/site-settings'

export async function GET() {
  await requireAdmin()
  return NextResponse.json({ ok: true, settings: await getSiteSettings() })
}

export async function PATCH(request: Request) {
  await requireAdmin()
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Request body must be a JSON object.' }, { status: 400 })
  const settings = cleanSiteSettings(body)
  const saved = await saveSiteSettings(settings)
  return NextResponse.json({ ok: true, settings: saved, message: 'Site settings updated.' })
}
