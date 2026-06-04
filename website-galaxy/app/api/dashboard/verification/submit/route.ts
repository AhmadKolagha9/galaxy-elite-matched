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
  const documents = body && typeof body === 'object' && Array.isArray((body as Record<string, unknown>).documents)
    ? (body as { documents: Record<string, unknown>[] }).documents
    : []

  if (!documents.length) return NextResponse.json({ ok: false, error: 'At least one uploaded document is required.' }, { status: 400 })

  const cleanDocuments = documents.map((document) => {
    const documentType = String(document.documentType || document.document_type || '')
    const mimeType = String(document.mimeType || document.mime_type || '')
    const storagePath = String(document.storagePath || document.storage_path || '')
    const originalFilename = String(document.originalFilename || document.original_filename || document.filename || '')
    const fileSize = Number(document.fileSize || document.file_size || 0)

    if (!allowedTypes.has(documentType)) throw new Error('Invalid document type.')
    if (!allowedMimeTypes.has(mimeType)) throw new Error('Invalid file type.')
    if (!storagePath.startsWith(`private/${payload.sub}/`)) throw new Error('Invalid private storage path.')
    if (!originalFilename) throw new Error('original_filename is required.')
    if (!Number.isInteger(fileSize) || fileSize < 1 || fileSize > 10 * 1024 * 1024) throw new Error('Invalid file size.')

    return {
      document_type: documentType,
      storage_path: storagePath,
      original_filename: originalFilename,
      mime_type: mimeType,
      file_size: fileSize
    }
  })

  const response = await fetch(`${getBackendApiUrl()}/api/users/verification/submit`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ documents: cleanDocuments })
  })

  const responseBody = await parseApiResponse(response)
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: apiErrorMessage(responseBody, 'Could not submit verification documents.') }, { status: response.status })
  }

  return NextResponse.json(responseBody)
}
