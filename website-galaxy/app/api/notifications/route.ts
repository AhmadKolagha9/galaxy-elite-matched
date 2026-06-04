import { NextResponse } from 'next/server'
import { getBackendApiUrl, apiErrorMessage, parseApiResponse } from '@/lib/backend-api'
import { getCurrentUser } from '@/lib/auth'
import { createBackendUserToken } from '@/lib/backend-token'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Member login is required to view notifications.' }, { status: 401 })

  let authorization: string
  try {
    authorization = `Bearer ${createBackendUserToken(user)}`
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Backend token signing failed.' }, { status: 503 })
  }

  const response = await fetch(`${getBackendApiUrl()}/api/notifications`, {
    headers: { accept: 'application/json', authorization },
    cache: 'no-store'
  })

  const payload = await parseApiResponse(response)
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: apiErrorMessage(payload, 'Notifications could not be loaded.') }, { status: response.status })
  }

  return NextResponse.json(payload ?? { ok: true, notifications: [] }, { status: response.status })
}
