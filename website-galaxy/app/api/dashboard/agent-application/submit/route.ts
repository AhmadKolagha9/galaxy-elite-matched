import { NextResponse } from 'next/server'
import { getBackendApiUrl, apiErrorMessage, parseApiResponse } from '@/lib/backend-api'
import { getBackendAuthToken } from '@/lib/native-session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const token = await getBackendAuthToken()
  if (!token) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'Request body must be a JSON object.' }, { status: 400 })
  }

  const response = await fetch(`${getBackendApiUrl()}/api/agent-applications/submit`, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: 'no-store'
  })
  const responseBody = await parseApiResponse(response)
  if (!response.ok) return NextResponse.json({ ok: false, error: apiErrorMessage(responseBody, 'Agent application request failed.') }, { status: response.status })
  return NextResponse.json(responseBody, { status: response.status })
}
