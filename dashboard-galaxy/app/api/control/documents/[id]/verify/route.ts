import { NextResponse } from 'next/server'
import { controlErrorMessage, controlErrorStatus, verifyDocument } from '@/lib/control-api'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await request.json().catch(() => null)) as { status?: unknown; rejectionReason?: unknown; note?: unknown } | null
  const status = body?.status
  const note = typeof body?.note === 'string' ? body.note.trim() : ''
  const rejectionReason = typeof body?.rejectionReason === 'string' ? body.rejectionReason.trim() : ''

  if (status !== 'verified' && status !== 'failed') {
    return NextResponse.json({ ok: false, error: 'Document status must be verified or failed.' }, { status: 400 })
  }
  if (status === 'failed' && !rejectionReason) {
    return NextResponse.json({ ok: false, error: 'Failure reason is required.' }, { status: 400 })
  }
  if (!note) {
    return NextResponse.json({ ok: false, error: 'Administrative review note is required.' }, { status: 400 })
  }

  try {
    const result = await verifyDocument(id, { status, rejectionReason, note })
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    return NextResponse.json({ ok: false, error: controlErrorMessage(error, 'Document verification failed.') }, { status: controlErrorStatus(error) })
  }
}
