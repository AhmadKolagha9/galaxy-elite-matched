import { NextResponse } from 'next/server'
import { getBackendApiUrl, apiErrorMessage, parseApiResponse } from '@/lib/backend-api'
import { getBackendAuthToken } from '@/lib/native-session'

export const runtime = 'nodejs'

export async function GET() {
  const token = await getBackendAuthToken()
  if (!token) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })

  const response = await fetch(`${getBackendApiUrl()}/api/agent-applications/me`, {
    headers: { accept: 'application/json', authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
  const body = await parseApiResponse(response)
  if (!response.ok) return NextResponse.json({ ok: false, error: apiErrorMessage(body, 'Could not load agent application.') }, { status: response.status })
  return NextResponse.json(body, { status: response.status })
}
