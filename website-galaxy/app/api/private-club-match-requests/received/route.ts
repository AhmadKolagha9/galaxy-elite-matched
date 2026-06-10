import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { readPrivateClubRequests } from '@/lib/private-club-store'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })
  const requests = (await readPrivateClubRequests()).filter((request) => request.ownerUserId === user.id || request.ownerEmail.toLowerCase() === user.email.toLowerCase())
  return NextResponse.json({ ok: true, requests })
}
