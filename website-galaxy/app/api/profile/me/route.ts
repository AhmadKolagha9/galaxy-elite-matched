import { NextResponse } from 'next/server'
import { BACKEND_AUTH_COOKIE } from '@/lib/auth-constants'
import { apiErrorMessage, getBackendApiUrl, parseApiResponse } from '@/lib/backend-api'
import { getBackendAuthToken } from '@/lib/native-session'

export const runtime = 'nodejs'

type ProfileUpdateResponse = {
  ok?: boolean
  token?: string
  user?: unknown
  message?: string
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

export async function PATCH(request: Request) {
  const token = await getBackendAuthToken()
  if (!token) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'Request body must be a JSON object.' }, { status: 400 })
  }

  const response = await fetch(`${getBackendApiUrl()}/api/profile/me`, {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  })

  const payload = (await parseApiResponse(response)) as ProfileUpdateResponse | null
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: apiErrorMessage(payload, 'Profile update failed.') },
      { status: response.status }
    )
  }

  const nextResponse = NextResponse.json(payload ?? { ok: true }, { status: response.status })
  if (payload?.token) {
    const decoded = decodeJwtPayload(payload.token)
    const maxAge = decoded?.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 0) : 60 * 60 * 8
    if (maxAge > 0) {
      nextResponse.cookies.set(BACKEND_AUTH_COOKIE, payload.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge
      })
    }
  }

  return nextResponse
}
