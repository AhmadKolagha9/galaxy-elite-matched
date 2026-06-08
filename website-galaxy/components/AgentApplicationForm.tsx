"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'

type AgentStatus = 'draft' | 'pending_review' | 'approved' | 'rejected'
type DocumentType = 'owner_id' | 'broker_licence'
type UiState = 'idle' | 'loading' | 'saving' | 'sending' | 'sent' | 'error'

type AgentApplication = {
  id: string
  companyName: string
  brokerLicenceNumber: string
  country: string
  notes?: string | null
  status: AgentStatus
  reviewNote?: string | null
}

type AgentDocument = {
  id: string
  documentType: DocumentType
  originalFilename: string | null
  fileSize: number | null
  verificationStatus: string
}

type AgentApplicationResponse = {
  ok?: boolean
  application?: AgentApplication | null
  documents?: AgentDocument[]
  message?: string
  error?: string
}

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

const fileSlots: { type: DocumentType; label: string; help: string }[] = [
  { type: 'owner_id', label: 'ID document', help: 'Passport, Emirates ID, or government ID.' },
  { type: 'broker_licence', label: 'Broker licence', help: 'Current licence showing broker authority.' }
]
const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg']
const maxFileSize = 10 * 1024 * 1024

async function readJson<T extends { error?: string; message?: string }>(response: Response, fallback: string): Promise<T> {
  const body = response.headers.get('content-type')?.includes('application/json')
    ? await response.json().catch(() => null)
    : null
  if (!response.ok) {
    const message = body && typeof body === 'object' ? String((body as T).error || (body as T).message || fallback) : fallback
    throw new Error(message)
  }
  return body as T
}

function validateFile(file: File) {
  if (!allowedMimeTypes.includes(file.type)) throw new Error('Upload PDF, PNG, or JPEG documents only.')
  if (file.size < 1) throw new Error('Attached document is empty.')
  if (file.size > maxFileSize) throw new Error('Each document must be 10MB or smaller.')
}

function formatSize(value: number | null) {
  return value ? `${(value / 1024 / 1024).toFixed(2)} MB` : 'Size not captured'
}

export function AgentApplicationForm() {
  const [companyName, setCompanyName] = useState('')
  const [brokerLicenceNumber, setBrokerLicenceNumber] = useState('')
  const [country, setCountry] = useState('UAE')
  const [notes, setNotes] = useState('')
  const [documents, setDocuments] = useState<AgentDocument[]>([])
  const [files, setFiles] = useState<Record<DocumentType, File | null>>({ owner_id: null, broker_licence: null })
  const [status, setStatus] = useState<AgentStatus>('draft')
  const [uiState, setUiState] = useState<UiState>('loading')
  const [message, setMessage] = useState('')

  const locked = status === 'pending_review' || status === 'approved' || uiState === 'saving' || uiState === 'sending'
  const documentState = useMemo(() => ({
    owner_id: documents.some((document) => document.documentType === 'owner_id') || Boolean(files.owner_id),
    broker_licence: documents.some((document) => document.documentType === 'broker_licence') || Boolean(files.broker_licence)
  }), [documents, files])
  const readyToSend = documentState.owner_id && documentState.broker_licence

  useEffect(() => {
    let active = true
    async function loadApplication() {
      setUiState('loading')
      try {
        const body = await readJson<AgentApplicationResponse>(await fetch('/api/dashboard/agent-application', { cache: 'no-store' }), 'Could not load agent application.')
        if (!active) return
        if (body.application) {
          setCompanyName(body.application.companyName || '')
          setBrokerLicenceNumber(body.application.brokerLicenceNumber || '')
          setCountry(body.application.country || 'UAE')
          setNotes(body.application.notes || '')
          setStatus(body.application.status || 'draft')
          setMessage(body.application.reviewNote ? `Review note: ${body.application.reviewNote}` : '')
        }
        setDocuments(body.documents || [])
        setUiState('idle')
      } catch (error) {
        if (!active) return
        setUiState('error')
        setMessage(error instanceof Error ? error.message : 'Could not load agent application.')
      }
    }
    loadApplication()
    return () => { active = false }
  }, [])

  function onFileChange(type: DocumentType, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || locked) return
    try {
      validateFile(file)
      setFiles((current) => ({ ...current, [type]: file }))
      setMessage('')
      setUiState('idle')
    } catch (error) {
      setUiState('error')
      setMessage(error instanceof Error ? error.message : 'Invalid file.')
    }
  }

  function payload() {
    return { companyName: companyName.trim(), brokerLicenceNumber: brokerLicenceNumber.trim(), country: country.trim(), notes: notes.trim() }
  }

  async function saveApplication(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    setUiState('saving')
    setMessage('')
    try {
      const body = await readJson<AgentApplicationResponse>(
        await fetch('/api/dashboard/agent-application/save', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload())
        }),
        'Could not save agent application.'
      )
      if (body.application) setStatus(body.application.status)
      setDocuments(body.documents || documents)
      setUiState('idle')
      setMessage(body.message || 'Agent application draft saved.')
    } catch (error) {
      setUiState('error')
      setMessage(error instanceof Error ? error.message : 'Could not save agent application.')
    }
  }

  async function uploadDocument(type: DocumentType, file: File): Promise<UploadedDocument> {
    validateFile(file)
    const signedUpload = await readJson<SignedUploadResponse>(
      await fetch('/api/dashboard/agent-application/sign-upload', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ documentType: type, filename: file.name, mimeType: file.type, fileSize: file.size })
      }),
      'Could not reserve a private upload slot.'
    )
    if (!signedUpload.signedUrl || !signedUpload.storagePath) throw new Error('Signed upload response was incomplete.')
    const uploadResponse = await fetch(signedUpload.signedUrl, { method: 'PUT', headers: { 'content-type': file.type }, body: file })
    if (!uploadResponse.ok) throw new Error('Could not stream the document to private storage.')
    return { documentType: type, storagePath: signedUpload.storagePath, originalFilename: file.name, mimeType: file.type, fileSize: file.size }
  }

  async function sendApplication() {
    if (!readyToSend) {
      setUiState('error')
      setMessage('Attach both an ID document and broker licence before sending.')
      return
    }
    setUiState('sending')
    setMessage('')
    try {
      const uploadedDocuments: UploadedDocument[] = []
      for (const slot of fileSlots) {
        const file = files[slot.type]
        if (file) uploadedDocuments.push(await uploadDocument(slot.type, file))
      }

      const body = await readJson<AgentApplicationResponse>(
        await fetch('/api/dashboard/agent-application/submit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...payload(), documents: uploadedDocuments })
        }),
        'Could not send agent application.'
      )
      if (body.application) setStatus(body.application.status)
      setDocuments(body.documents || documents)
      setFiles({ owner_id: null, broker_licence: null })
      setUiState('sent')
      setMessage(body.message || 'Agent application sent for compliance review.')
    } catch (error) {
      setUiState('error')
      setMessage(error instanceof Error ? error.message : 'Could not send agent application.')
    }
  }

  if (uiState === 'loading') return <p className="form-note">Loading agent application...</p>

  return (
    <form className="agent-application-form" onSubmit={saveApplication}>
      <div className="verification-status-pill" data-state={status === 'approved' ? 'submitted' : uiState}>
        {status === 'approved' ? 'Approved agent account' : status === 'pending_review' ? 'Application sent for admin review' : status === 'rejected' ? 'Application needs updates' : 'Draft application'}
      </div>

      <div className="form-grid">
        <label>Company name<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} disabled={locked} required maxLength={255} /></label>
        <label>Broker licence number<input value={brokerLicenceNumber} onChange={(event) => setBrokerLicenceNumber(event.target.value)} disabled={locked} required maxLength={120} /></label>
        <label>Country<input value={country} onChange={(event) => setCountry(event.target.value)} disabled={locked} required maxLength={120} /></label>
        <label>Notes<textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} disabled={locked} maxLength={1000} /></label>
      </div>

      <div className="agent-document-grid">
        {fileSlots.map((slot) => {
          const existing = documents.find((document) => document.documentType === slot.type)
          const selected = files[slot.type]
          return (
            <label className="agent-document-slot" key={slot.type}>
              <span>{slot.label}</span>
              <small>{existing ? `${existing.originalFilename || slot.label} · ${existing.verificationStatus} · ${formatSize(existing.fileSize)}` : slot.help}</small>
              <input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => onFileChange(slot.type, event)} disabled={locked} />
              {selected ? <strong>{selected.name}</strong> : null}
            </label>
          )
        })}
      </div>

      {message ? <p className={uiState === 'error' ? 'form-error' : 'form-success'}>{message}</p> : null}

      <div className="profile-form-actions">
        <button className="button button-outline" type="submit" disabled={locked}>
          {uiState === 'saving' ? 'Saving...' : 'Save'}
        </button>
        <button className="button button-gold" type="button" onClick={sendApplication} disabled={locked || !readyToSend}>
          {uiState === 'sending' ? 'Sending...' : status === 'pending_review' ? 'Sent' : 'Send'}
        </button>
      </div>
    </form>
  )
}
