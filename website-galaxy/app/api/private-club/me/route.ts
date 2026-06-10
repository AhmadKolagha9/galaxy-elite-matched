import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getMyPrivateClubPosts } from '@/lib/private-club-store'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })
  return NextResponse.json({ ok: true, posts: await getMyPrivateClubPosts(user) })
}
