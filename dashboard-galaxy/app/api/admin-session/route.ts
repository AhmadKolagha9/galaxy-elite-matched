import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifyAdminTokenWithBackend } from '@/lib/admin-auth'

const cookieMaxAge = 55 * 60

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: unknown; idToken?: unknown } | null
  const token = typeof body?.token === 'string' ? body.token.trim() : typeof body?.idToken === 'string' ? body.idToken.trim() : ''

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Backend staff token is required.' }, { status: 400 })
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
