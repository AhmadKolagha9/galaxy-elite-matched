import { NextResponse } from 'next/server'
import { getBackendApiUrl, parseApiResponse, apiErrorMessage } from '@/lib/backend-api'
import { getBackendAuthToken, readBackendJwtPayload } from '@/lib/native-session'

export const runtime = 'nodejs'

const allowedTypes = new Set(['owner_id', 'company_licence', 'broker_licence'])
const allowedMimeTypes = new Set(['application/pdf', 'image/png', 'image/jpeg'])

export async function POST(request: Request) {
  const token = await getBackendAuthToken()
  const payload = token ? readBackendJwtPayload(token) : null
  if (!token || !payload?.sub) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'Request body must be a JSON object.' }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const documentType = String(record.documentType || record.document_type || '')
  const filename = String(record.filename || '')
  const mimeType = String(record.mimeType || record.mime_type || '')
  const fileSize = Number(record.fileSize || record.file_size || 0)

  if (!allowedTypes.has(documentType)) return NextResponse.json({ ok: false, error: 'Invalid document type.' }, { status: 400 })
  if (!filename) return NextResponse.json({ ok: false, error: 'filename is required.' }, { status: 400 })
  if (!allowedMimeTypes.has(mimeType)) return NextResponse.json({ ok: false, error: 'Invalid file type.' }, { status: 400 })
  if (!Number.isInteger(fileSize) || fileSize < 1 || fileSize > 10 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: 'File size must be between 1 byte and 10MB.' }, { status: 400 })
  }

  const response = await fetch(`${getBackendApiUrl()}/api/upload/sign-url`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      document_type: documentType,
      filename,
      mime_type: mimeType,
      file_size: fileSize,
      related_object_type: 'user_verification',
      related_object_id: payload.sub
    })
  })

  const responseBody = await parseApiResponse(response)
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: apiErrorMessage(responseBody, 'Could not create signed upload URL.') }, { status: response.status })
  }

  return NextResponse.json(responseBody)
}
