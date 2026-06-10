import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateMyPrivateClubPost } from '@/lib/private-club-store'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })
  const { id } = await context.params
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const action = typeof body?.action === 'string' ? body.action : ''
  if (!['publish', 'unpublish', 'draft', 'delete'].includes(action)) return NextResponse.json({ ok: false, error: 'action must be publish, unpublish, draft, or delete.' }, { status: 400 })
  const post = await updateMyPrivateClubPost(user, id, action)
  if (!post) return NextResponse.json({ ok: false, error: 'Private Club post not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, post, message: 'Private Club post updated.' })
}
