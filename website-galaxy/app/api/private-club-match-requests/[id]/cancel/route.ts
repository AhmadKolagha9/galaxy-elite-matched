import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { readPrivateClubRequests, writePrivateClubRequests } from '@/lib/private-club-store'

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })
  const { id } = await context.params
  const requests = await readPrivateClubRequests()
  let updated = null
  const next = requests.map((request) => {
    if (request.id !== id) return request
    if (request.requesterUserId !== user.id && request.requesterEmail.toLowerCase() !== user.email.toLowerCase()) return request
    updated = { ...request, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
    return updated
  })
  await writePrivateClubRequests(next)
  if (!updated) return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, request: updated, message: 'Matched request cancelled.' })
}
