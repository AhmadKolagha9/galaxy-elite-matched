import { NextResponse } from 'next/server'
import { controlErrorMessage, controlErrorStatus, getAuditLog } from '@/lib/control-api'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = Number(url.searchParams.get('limit') || 250)

  try {
    const actions = await getAuditLog(Number.isFinite(limit) ? limit : 250)
    return NextResponse.json({ ok: true, actions })
  } catch (error) {
    return NextResponse.json({ ok: false, error: controlErrorMessage(error, 'Could not load audit log.') }, { status: controlErrorStatus(error) })
  }
}
