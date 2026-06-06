import { NextResponse } from 'next/server'
import { BACKEND_AUTH_COOKIE } from '@/lib/auth-constants'
import { getBackendApiUrl } from '@/lib/backend-api'

export const runtime = 'nodejs'

type BackendProfileResponse = {
  ok?: boolean
  user?: {
    id?: string
    email?: string
  }
}

type JwtPayload = {
  exp?: number
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const [, encodedPayload] = token.split('.')
  if (!encodedPayload) return null

  try {
    return JSON.parse(
      Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    ) as JwtPayload
  } catch {
    return null
  }
}

async function validateBackendToken(token: string) {
  const response = await fetch(`${getBackendApiUrl()}/api/profile/me`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      origin: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourpropertymatch.cloud'
    },
    cache: 'no-store'
  })

  if (!response.ok) return false

  const body = (await response.json().catch(() => null)) as BackendProfileResponse | null
  return Boolean(body?.ok && body.user?.id && body.user?.email)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const token = body && typeof body === 'object' && 'token' in body ? String(body.token || '').trim() : ''

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Backend authorization token is required.' }, { status: 400 })
  }

  const isValid = await validateBackendToken(token)
  if (!isValid) {
    return NextResponse.json({ ok: false, error: 'Invalid backend authorization token.' }, { status: 401 })
  }

  const payload = decodeJwtPayload(token)
  const maxAge = payload?.exp ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 0) : 60 * 60 * 8
  if (maxAge <= 0) {
    return NextResponse.json({ ok: false, error: 'Backend authorization token expired.' }, { status: 401 })
  }

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
