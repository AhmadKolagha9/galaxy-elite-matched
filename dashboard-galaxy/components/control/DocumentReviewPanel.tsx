"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ControlDocumentRecord } from '@/lib/control-api'

type VerifyStatus = 'verified' | 'failed'

export function DocumentReviewPanel({ document }: { document: ControlDocumentRecord }) {
  const router = useRouter()
  const [signedUrl, setSignedUrl] = useState('')
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [status, setStatus] = useState<VerifyStatus>('verified')
  const [note, setNote] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState<'view' | VerifyStatus | null>(null)
  const [message, setMessage] = useState('')

  async function loadSignedView() {
    setMessage('')
    setLoading('view')
    try {
      const response = await fetch(`/api/control/documents/${encodeURIComponent(document.id)}/view`)
      const body = (await response.json().catch(() => null)) as { ok?: boolean; signedUrl?: string; expiresIn?: number; error?: string } | null
      if (!response.ok || body?.ok === false || !body?.signedUrl) throw new Error(body?.error || 'Could not load signed document view.')
      setSignedUrl(body.signedUrl)
      setExpiresIn(typeof body.expiresIn === 'number' ? body.expiresIn : null)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load signed document view.')
    } finally {
      setLoading(null)
    }
  }

  async function verify(nextStatus: VerifyStatus) {
    setStatus(nextStatus)
    setMessage('')
    const cleanNote = note.trim()
    const cleanReason = rejectionReason.trim()
    if (!cleanNote) {
      setMessage('Administrative review note is required.')
      return
    }
    if (nextStatus === 'failed' && !cleanReason) {
      setMessage('Failure reason is required.')
      return
    }

    setLoading(nextStatus)
    try {
      const response = await fetch(`/api/control/documents/${encodeURIComponent(document.id)}/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, note: cleanNote, rejectionReason: cleanReason })
      })
      const body = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!response.ok || body?.ok === false) throw new Error(body?.error || 'Verification update failed.')
      setMessage('Document verification updated.')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Verification update failed.')
    } finally {
      setLoading(null)
    }
  }

  const disabled = Boolean(loading)
  const failedSelected = status === 'failed'

  return (
    <section className="review-split">
      <article className="admin-card document-viewer">
        <div className="section-heading-inline">
          <div>
            <p className="eyebrow">Secure preview</p>
            <h2>{document.originalFilename || document.documentType || document.id}</h2>
          </div>
          <button className="button button-outline button-small" type="button" disabled={disabled} onClick={loadSignedView}>
            {loading === 'view' ? 'Creating Link...' : 'Create Signed View'}
          </button>
        </div>
        {expiresIn ? <p className="admin-meta">Signed view expires in {expiresIn} seconds.</p> : null}
        {signedUrl ? (
          <iframe title="Secure document preview" className="signed-document-frame" src={signedUrl} sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" />
        ) : (
          <div className="empty-state compact-empty"><p>Document URL is not present in the DOM until an authorized signed view is requested.</p></div>
        )}
      </article>
      <article className="admin-card action-panel">
        <h3>Verification decision</h3>
        <div className="admin-detail-grid">
          <div><dt>Type</dt><dd>{document.documentType || 'Document'}</dd></div>
          <div><dt>Status</dt><dd>{document.verificationStatus || 'under_review'}</dd></div>
          <div><dt>MIME</dt><dd>{document.mimeType || 'Unknown'}</dd></div>
          <div><dt>Related object</dt><dd>{document.relatedObjectId || 'Unassigned'}</dd></div>
        </div>
        <label>
          Decision
          <select value={status} disabled={disabled} onChange={(event) => setStatus(event.target.value === 'failed' ? 'failed' : 'verified')}>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label>
          Required review note
          <textarea value={note} disabled={disabled} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Record the basis for this verification decision." />
        </label>
        {failedSelected ? (
          <label>
            Required failure reason
            <textarea value={rejectionReason} disabled={disabled} onChange={(event) => setRejectionReason(event.target.value)} rows={3} placeholder="Example: Expired broker card or name mismatch on title deed." />
          </label>
        ) : null}
        {message ? <p className={message.includes('updated') ? 'form-success' : 'form-error'}>{message}</p> : null}
        <div className="action-row">
          <button className="button button-gold" type="button" disabled={disabled} onClick={() => verify('verified')}>
            {loading === 'verified' ? 'Verifying...' : 'Mark Verified'}
          </button>
          <button className="button button-dark" type="button" disabled={disabled} onClick={() => verify('failed')}>
            {loading === 'failed' ? 'Failing...' : 'Mark Failed'}
          </button>
        </div>
      </article>
    </section>
  )
}
