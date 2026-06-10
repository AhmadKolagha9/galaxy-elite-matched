import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { readPrivateClubRequests, writePrivateClubRequests } from '@/lib/private-club-store'

const statuses = new Set(['pending_review', 'in_progress', 'approved', 'rejected', 'closed'])

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await context.params
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const adminStatus = typeof body?.adminStatus === 'string' ? body.adminStatus : typeof body?.admin_status === 'string' ? body.admin_status : ''
  const adminNote = typeof body?.adminNote === 'string' ? body.adminNote.trim() : typeof body?.admin_note === 'string' ? body.admin_note.trim() : ''
  if (!statuses.has(adminStatus)) return NextResponse.json({ ok: false, error: 'Invalid admin status.' }, { status: 400 })
  const requests = await readPrivateClubRequests()
  let updated = null
  const next = requests.map((item) => {
    if (item.id !== id) return item
    updated = { ...item, adminStatus: adminStatus as 'pending_review' | 'in_progress' | 'approved' | 'rejected' | 'closed', adminNote, updatedAt: new Date().toISOString() }
    return updated
  })
  await writePrivateClubRequests(next)
  if (!updated) return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, request: updated, message: 'Private Club matched request updated.' })
}
