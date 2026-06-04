export type AvailabilityVerificationDocument = {
  document_type: 'title_deed'
  storage_path: string
  original_filename: string
  mime_type: string
  file_size: number
  storage_bucket?: string
  document_id?: string
}

type SignedUploadResponse = {
  ok?: boolean
  id?: string
  bucket?: string
  storagePath?: string
  signedUrl?: string
  error?: string
  message?: string
}

const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg']
const maxFileSize = 10 * 1024 * 1024

async function readJsonResponse<T extends { error?: string; message?: string }>(response: Response, fallback: string): Promise<T> {
  const body = response.headers.get('content-type')?.includes('application/json')
    ? await response.json().catch(() => null)
    : null

  if (!response.ok) {
    const message = body && typeof body === 'object'
      ? String((body as T).error || (body as T).message || fallback)
      : fallback
    throw new Error(message)
  }

  return body as T
}

export function validateOwnershipDocumentFile(file: File) {
  if (!allowedMimeTypes.includes(file.type)) throw new Error('Attach a PDF, PNG, or JPEG ownership document.')
  if (file.size < 1) throw new Error('Attached ownership document is empty.')
  if (file.size > maxFileSize) throw new Error('Ownership document must be 10MB or smaller.')
}

export async function uploadAvailabilityOwnershipDocument(file: File): Promise<AvailabilityVerificationDocument> {
  validateOwnershipDocumentFile(file)

  const signedUpload = await readJsonResponse<SignedUploadResponse>(
    await fetch('/api/upload/sign-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        documentType: 'title_deed',
        filename: file.name,
        mimeType: file.type,
        fileSize: file.size,
        relatedObjectType: 'private_availability'
      })
    }),
    'Could not reserve a private upload slot.'
  )

  if (!signedUpload.signedUrl || !signedUpload.storagePath) throw new Error('Signed upload response was incomplete.')

  const uploadResponse = await fetch(signedUpload.signedUrl, {
    method: 'PUT',
    headers: { 'content-type': file.type },
    body: file
  })
  if (!uploadResponse.ok) throw new Error('Could not stream the ownership document to private storage.')

  return {
    document_type: 'title_deed',
    storage_path: signedUpload.storagePath,
    original_filename: file.name,
    mime_type: file.type,
    file_size: file.size,
    storage_bucket: signedUpload.bucket,
    document_id: signedUpload.id
  }
}
