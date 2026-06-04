'use client'

import { ChangeEvent, DragEvent, FormEvent, useMemo, useState } from 'react'

type VerificationState = 'unverified' | 'under_review' | 'action_required' | 'verified' | 'unknown'
type DocumentType = 'owner_id' | 'company_licence' | 'broker_licence'
type UiState = 'idle' | 'uploading' | 'submitted' | 'error'

type SignedUploadResponse = {
  ok?: boolean
  signedUrl?: string
  storagePath?: string
  bucket?: string
  error?: string
  message?: string
}

type UploadedDocument = {
  documentType: DocumentType
  storagePath: string
  originalFilename: string
  mimeType: string
  fileSize: number
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'owner_id', label: 'Owner ID' },
  { value: 'company_licence', label: 'Company Licence' },
  { value: 'broker_licence', label: 'Broker Licence' }
]

const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg']
const maxFileSize = 10 * 1024 * 1024

async function readResponse<T extends { error?: string; message?: string }>(response: Response, fallback: string): Promise<T> {
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

function validateFile(file: File) {
  if (!allowedMimeTypes.includes(file.type)) throw new Error('Upload a PDF, PNG, or JPEG file.')
  if (file.size > maxFileSize) throw new Error('File size must be 10MB or smaller.')
}

export function VerificationCenterForm({ initialStatus }: { initialStatus: VerificationState }) {
  const [documentType, setDocumentType] = useState<DocumentType>('owner_id')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<UiState>(initialStatus === 'under_review' || initialStatus === 'verified' ? 'submitted' : 'idle')
  const [message, setMessage] = useState('')
  const [dragging, setDragging] = useState(false)

  const locked = status === 'uploading' || status === 'submitted'
  const statusCopy = useMemo(() => {
    if (status === 'submitted') return 'Verification files are locked after submission and queued for compliance review.'
    if (status === 'uploading') return 'Uploading and submitting verification files...'
    return 'Attach one sharp identity or licence document to begin verification review.'
  }, [status])

  function acceptFile(nextFile: File | undefined) {
    if (!nextFile || locked) return
    try {
      validateFile(nextFile)
      setFile(nextFile)
      setMessage('')
      setStatus('idle')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Invalid file.')
      setStatus('error')
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0])
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    acceptFile(event.dataTransfer.files?.[0])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file || locked) return

    try {
      validateFile(file)
      setStatus('uploading')
      setMessage('')

      const signedUpload = await readResponse<SignedUploadResponse>(
        await fetch('/api/dashboard/verification/sign-upload', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            documentType,
            filename: file.name,
            mimeType: file.type,
            fileSize: file.size
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
      if (!uploadResponse.ok) throw new Error('Could not stream the file to private storage.')

      const uploadedDocument: UploadedDocument = {
        documentType,
        storagePath: signedUpload.storagePath,
        originalFilename: file.name,
        mimeType: file.type,
        fileSize: file.size
      }

      await readResponse(
        await fetch('/api/dashboard/verification/submit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ documents: [uploadedDocument] })
        }),
        'Could not submit verification documents.'
      )

      setStatus('submitted')
      setMessage('Documents submitted. Your verification status is now under review.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Verification upload failed.')
    }
  }

  return (
    <form className="verification-form" onSubmit={handleSubmit}>
      <div className="verification-toolbar">
        <label>Document category
          <select value={documentType} onChange={(event) => setDocumentType(event.target.value as DocumentType)} disabled={locked}>
            {documentTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <div className="verification-status-pill" data-state={status}>{statusCopy}</div>
      </div>

      <label
        className={`file-dropzone ${dragging ? 'is-dragging' : ''} ${locked ? 'is-locked' : ''}`}
        onDragOver={(event) => { event.preventDefault(); if (!locked) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input type="file" accept="application/pdf,image/png,image/jpeg" onChange={onFileChange} disabled={locked} />
        <span>{file ? file.name : 'Drop a PDF, PNG, or JPEG file here'}</span>
        <small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : 'Maximum file size: 10MB'}</small>
      </label>

      {message ? <p className={status === 'error' ? 'form-error' : 'form-success'}>{message}</p> : null}

      <button className="button button-gold" type="submit" disabled={locked || !file}>
        {status === 'uploading' ? 'Uploading...' : status === 'submitted' ? 'Submitted for Review' : 'Upload Verification Profile'}
      </button>
    </form>
  )
}
