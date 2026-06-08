import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getBackendJwtPayloadFromCookie, getVerificationState } from '@/lib/native-session'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, user: null }, { status: 401 })
  const payload = user.provider === 'backend' ? await getBackendJwtPayloadFromCookie() : null
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verificationStatus: getVerificationState(payload)
    }
  })
}

