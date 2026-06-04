import { NextResponse } from 'next/server'
import { controlErrorMessage, controlErrorStatus, mutateSubmission } from '@/lib/control-api'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await request.json().catch(() => null)) as { action?: unknown; publicStatus?: unknown; note?: unknown } | null
  const action = body?.action
  const note = typeof body?.note === 'string' ? body.note.trim() : ''
  const publicStatus = body?.publicStatus === 'open' ? 'open' : 'hidden'

  if (action !== 'approve' && action !== 'reject' && action !== 'compliance-hold') {
    return NextResponse.json({ ok: false, error: 'Unsupported moderation action.' }, { status: 400 })
  }
  if (!note) {
    return NextResponse.json({ ok: false, error: 'Administrative note is required.' }, { status: 400 })
  }

  try {
    const result = await mutateSubmission(id, { action, publicStatus, note })
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    return NextResponse.json({ ok: false, error: controlErrorMessage(error, 'Submission action failed.') }, { status: controlErrorStatus(error) })
  }
}
