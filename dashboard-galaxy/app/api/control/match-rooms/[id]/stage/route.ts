import { NextResponse } from 'next/server'
import { dealFlowStages, type DealFlowStage } from '@/lib/control-model'
import { controlErrorMessage, controlErrorStatus, patchMatchRoomStage } from '@/lib/control-api'

const validStages = new Set(dealFlowStages.map((stage) => stage.value))

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await request.json().catch(() => null)) as { nextStage?: unknown; note?: unknown } | null
  const nextStage = typeof body?.nextStage === 'string' ? body.nextStage : ''
  const note = typeof body?.note === 'string' ? body.note.trim() : ''

  if (!validStages.has(nextStage as DealFlowStage)) {
    return NextResponse.json({ ok: false, error: 'Invalid deal stage.' }, { status: 400 })
  }
  if (!note) {
    return NextResponse.json({ ok: false, error: 'Audit note is required for stage changes.' }, { status: 400 })
  }

  try {
    const result = await patchMatchRoomStage(id, { nextStage: nextStage as DealFlowStage, note })
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    return NextResponse.json({ ok: false, error: controlErrorMessage(error, 'Stage update failed.') }, { status: controlErrorStatus(error) })
  }
}
