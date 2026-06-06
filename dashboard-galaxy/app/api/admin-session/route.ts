import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, adminDashboardOrigin, verifyAdminTokenWithBackend } from '@/lib/admin-auth'

const cookieMaxAge = 55 * 60

function backendBaseUrl() {
  return (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://api.yourpropertymatch.cloud').replace(/\/$/, '')
}

async function loginWithCredentials(email: string, password: string) {
  const response = await fetch(`${backendBaseUrl()}/api/auth/admin/login`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      origin: adminDashboardOrigin()
    },
    body: JSON.stringify({ email, password }),
    cache: 'no-store'
  })

  const body = (await response.json().catch(() => null)) as { ok?: boolean; token?: string; error?: string; message?: string } | null
  if (!response.ok || body?.ok === false || !body?.token) {
    return { token: '', error: body?.error || body?.message || 'Invalid staff email or password.' }
  }
  return { token: body.token, error: '' }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: unknown; idToken?: unknown; email?: unknown; password?: unknown } | null
  let token = typeof body?.token === 'string' ? body.token.trim() : typeof body?.idToken === 'string' ? body.idToken.trim() : ''

  if (!token) {
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    if (!email || !password) return NextResponse.json({ ok: false, error: 'Staff email and password are required.' }, { status: 400 })
    const login = await loginWithCredentials(email, password)
    if (!login.token) return NextResponse.json({ ok: false, error: login.error }, { status: 403 })
    token = login.token
  }

  const session = await verifyAdminTokenWithBackend(token)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'This account is not authorized for the corporate control platform.' }, { status: 403 })
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: cookieMaxAge
  })

  return NextResponse.json({
    ok: true,
    user: {
      uid: session.uid,
      email: session.email,
      roles: session.roles
    }
  })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return NextResponse.json({ ok: true })
}
