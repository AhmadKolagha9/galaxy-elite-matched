import { NextResponse } from 'next/server'
import { BACKEND_AUTH_COOKIE } from '@/lib/auth-constants'
import { readBackendJwtPayload } from '@/lib/native-session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const token = body && typeof body === 'object' && 'token' in body ? String(body.token || '') : ''
  const payload = token ? readBackendJwtPayload(token) : null

  if (!payload?.sub || !payload.email) {
    return NextResponse.json({ ok: false, error: 'Invalid backend authorization token.' }, { status: 401 })
  }

  const maxAge = payload.exp ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 0) : 60 * 60 * 8
  const response = NextResponse.json({ ok: true })
  response.cookies.set(BACKEND_AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge
  })

  return response
}
