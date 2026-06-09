import { NextResponse } from 'next/server'
import { getBackendApiUrl, apiErrorMessage, parseApiResponse } from '@/lib/backend-api'
import { getBackendAuthToken } from '@/lib/native-session'

export const runtime = 'nodejs'

async function forward(path: string, init: RequestInit = {}) {
  const token = await getBackendAuthToken()
  if (!token) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })

  const response = await fetch(`${getBackendApiUrl()}${path}`, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers || {}),
      authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  })
  const body = await parseApiResponse(response)
  if (!response.ok) return NextResponse.json({ ok: false, error: apiErrorMessage(body, 'Backend request failed.') }, { status: response.status })
  return NextResponse.json(body ?? { ok: true }, { status: response.status })
}

export async function POST(request: Request) {
  const body = await request.text()
  return forward('/api/interest-match-requests', { method: 'POST', body })
}
