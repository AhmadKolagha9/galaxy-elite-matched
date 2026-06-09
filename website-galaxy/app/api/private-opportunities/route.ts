import { NextResponse } from 'next/server'
import { getBackendApiUrl, apiErrorMessage, parseApiResponse } from '@/lib/backend-api'
import { getCurrentUser } from '@/lib/auth'
import { createBackendUserToken } from '@/lib/backend-token'
import { availabilityPayloadSchema } from '@/lib/availability-submission'
import { investorPostPayloadSchema } from '@/lib/investor-post-submission'

export const runtime = 'nodejs'

const opportunityTypes = new Set(['availability', 'investor'])

function opportunityTypeFrom(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return undefined
  const value = (body as Record<string, unknown>).opportunity_type ?? (body as Record<string, unknown>).opportunityType
  return typeof value === 'string' ? value : undefined
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Member login is required before submitting.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const opportunityType = opportunityTypeFrom(body)

  if (!opportunityType || !opportunityTypes.has(opportunityType)) {
    return NextResponse.json({ ok: false, error: 'opportunity_type must be availability or investor.' }, { status: 400 })
  }

  const parsed = opportunityType === 'availability'
    ? availabilityPayloadSchema.safeParse(body)
    : investorPostPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 })
  }

  let authorization: string
  try {
    authorization = `Bearer ${createBackendUserToken(user)}`
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Backend token signing failed.' }, { status: 503 })
  }

  const response = await fetch(`${getBackendApiUrl()}/api/private-opportunities`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization
    },
    body: JSON.stringify({ opportunity_type: opportunityType, ...parsed.data }),
    cache: 'no-store'
  })

  const payload = await parseApiResponse(response)
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: apiErrorMessage(payload, 'Private opportunity submission failed.') },
      { status: response.status }
    )
  }

  return NextResponse.json(
    payload ?? { ok: true, message: 'Private opportunity securely logged. Pending Galaxy Elite administrative review.' },
    { status: response.status }
  )
}
