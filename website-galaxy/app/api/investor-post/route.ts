import { NextResponse } from 'next/server'
import { getBackendApiUrl, apiErrorMessage, parseApiResponse } from '@/lib/backend-api'
import { getCurrentUser } from '@/lib/auth'
import { createBackendUserToken } from '@/lib/backend-token'
import { investorPostPayloadSchema } from '@/lib/investor-post-submission'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Member login is required before submitting.' }, { status: 401 })
  }

  let authorization: string
  try {
    authorization = `Bearer ${createBackendUserToken(user)}`
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Backend token signing failed.' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const parsed = investorPostPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 })
  }

  const response = await fetch(`${getBackendApiUrl()}/api/private-opportunities`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization
    },
    body: JSON.stringify({ opportunity_type: 'investor', ...parsed.data }),
    cache: 'no-store'
  })

  const payload = await parseApiResponse(response)
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: apiErrorMessage(payload, 'Investor post submission failed.') },
      { status: response.status }
    )
  }

  return NextResponse.json(
    payload ?? { ok: true, message: 'Investor demand profile securely submitted and pending Galaxy Elite review.' },
    { status: response.status }
  )
}
