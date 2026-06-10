import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { readPrivateClubRequests } from '@/lib/private-club-store'

export async function GET() {
  await requireAdmin()
  return NextResponse.json({ ok: true, requests: await readPrivateClubRequests() })
}
