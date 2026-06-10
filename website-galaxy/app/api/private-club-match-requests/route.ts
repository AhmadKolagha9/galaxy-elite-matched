import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getBackendJwtPayloadFromCookie, getVerificationState } from '@/lib/native-session'
import { createPrivateClubRequest, getPrivateClubPostById } from '@/lib/private-club-store'

const roles = new Set(['an agent', 'Buyer', 'tenant', 'other'])

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })
  const payload = user.provider === 'backend' ? await getBackendJwtPayloadFromCookie() : null
  if (user.provider === 'backend' && getVerificationState(payload) !== 'verified') {
    return NextResponse.json({ ok: false, error: 'Verified account required before sending a matched request.' }, { status: 403 })
  }
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const privateClubPostId = typeof body?.privateClubPostId === 'string' ? body.privateClubPostId.trim() : typeof body?.private_club_post_id === 'string' ? body.private_club_post_id.trim() : ''
  const requesterRole = typeof body?.requesterRole === 'string' ? body.requesterRole : typeof body?.requester_role === 'string' ? body.requester_role : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!privateClubPostId) return NextResponse.json({ ok: false, error: 'privateClubPostId is required.' }, { status: 400 })
  if (!roles.has(requesterRole)) return NextResponse.json({ ok: false, error: 'requesterRole must be an agent, Buyer, tenant, or other.' }, { status: 400 })
  if (message.length < 10) return NextResponse.json({ ok: false, error: 'Message must be at least 10 characters.' }, { status: 400 })
  const found = await getPrivateClubPostById(privateClubPostId)
  if (!found) return NextResponse.json({ ok: false, error: 'Private Club post not found.' }, { status: 404 })
  const requestRecord = await createPrivateClubRequest({ post: found.card, requester: user, requesterRole: requesterRole as 'an agent' | 'Buyer' | 'tenant' | 'other', message })
  return NextResponse.json({ ok: true, request: requestRecord, message: 'Matched request sent to the Private Club post owner.' }, { status: 201 })
}
