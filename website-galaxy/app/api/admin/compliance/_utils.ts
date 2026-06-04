import { NextResponse } from 'next/server'
import { getBackendApiUrl, parseApiResponse, apiErrorMessage } from '@/lib/backend-api'
import { getBackendAuthToken, readBackendJwtPayload, hasComplianceRole } from '@/lib/native-session'

export async function requireComplianceToken() {
  const token = await getBackendAuthToken()
  const payload = token ? readBackendJwtPayload(token) : null
  if (!token || !hasComplianceRole(payload)) return null
  return token
}

export function forbiddenResponse() {
  return NextResponse.json({ ok: false, error: 'Compliance or super admin role required.' }, { status: 403 })
}

export async function forwardBackendJson(path: string, init: RequestInit = {}) {
  const token = await requireComplianceToken()
  if (!token) return forbiddenResponse()

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
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: apiErrorMessage(body, 'Backend request failed.') }, { status: response.status })
  }

  return NextResponse.json(body)
}
