import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { readPrivateClubRequests, writePrivateClubRequests } from '@/lib/private-club-store'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })
  const { id } = await context.params
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const action = body?.action === 'approve' ? 'approve' : body?.action === 'reject' ? 'reject' : ''
  const note = typeof body?.note === 'string' ? body.note.trim() : ''
  if (!action) return NextResponse.json({ ok: false, error: 'action must be approve or reject.' }, { status: 400 })
  if (action === 'reject' && note.length < 3) return NextResponse.json({ ok: false, error: 'Rejection feedback is required.' }, { status: 400 })
  const requests = await readPrivateClubRequests()
  let updated = null
  const next = requests.map((item) => {
    if (item.id !== id) return item
    if (item.ownerUserId !== user.id && item.ownerEmail.toLowerCase() !== user.email.toLowerCase()) return item
    updated = { ...item, status: action === 'approve' ? 'admin_review' as const : 'owner_rejected' as const, adminStatus: action === 'approve' ? 'pending_review' as const : item.adminStatus, ownerNote: note, updatedAt: new Date().toISOString() }
    return updated
  })
  await writePrivateClubRequests(next)
  if (!updated) return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, request: updated, message: action === 'approve' ? 'Matched request sent to admin for manual processing.' : 'Matched request rejected.' })
}
