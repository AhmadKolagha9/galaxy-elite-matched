import { NextResponse } from 'next/server'
import { controlErrorMessage, controlErrorStatus, getDocumentView } from '@/lib/control-api'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const result = await getDocumentView(id)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ ok: false, error: controlErrorMessage(error, 'Could not create signed view URL.') }, { status: controlErrorStatus(error) })
  }
}
