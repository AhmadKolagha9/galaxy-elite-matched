'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  type IdentityDocument,
  useIdentityDetail,
  useIdentityReviewDecision,
  useSecureDocumentView
} from '@/lib/use-admin-identity-review'

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not captured'
}

function formatSize(value: number | null) {
  return value ? `${(value / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'
}

function documentLabel(document: IdentityDocument | null) {
  if (!document) return 'Secure document viewer'
  return `${document.documentType} · ${document.originalFilename || 'Private verification file'}`
}

export function AdminIdentityReviewWorkspace({ id }: { id: string }) {
  const router = useRouter()
  const { detail, loading, error: detailError, setError: setDetailError } = useIdentityDetail(id)
  const { activeDocument, signedUrl, loading: documentLoading, error: documentError, openDocument } = useSecureDocumentView()
  const { decisionLoading, error: decisionError, setError: setDecisionError, submitDecision } = useIdentityReviewDecision(id, () => {
    router.replace('/admin/compliance/identities')
    router.refresh()
  })
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!detail?.documents.length || activeDocument) return
    openDocument(detail.documents[0])
  }, [activeDocument, detail, openDocument])

  function approveIdentity() {
    submitDecision('approve')
  }

  function onReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const reason = rejectionReason.trim()
    if (!reason) {
      setDecisionError('Rejection feedback is required before rejecting identity files.')
      return
    }
    submitDecision('reject', reason)
  }

  if (loading) return <div className="admin-section"><p className="form-note">Loading identity workspace...</p></div>
  if (detailError && !detail) return <div className="admin-section"><p className="form-error">{detailError}</p></div>
  if (!detail) return null

  const disabled = Boolean(decisionLoading)
  const displayedError = decisionError || detailError

  return (
    <>
      <section className="identity-workspace identity-workspace-split">
        <div className="identity-detail-panel">
          <p className="eyebrow">Customer Identity</p>
          <h2>{detail.user.email}</h2>
          <dl>
            <div><dt>Customer ID</dt><dd><code>{detail.user.id}</code></dd></div>
            <div><dt>Name</dt><dd>{detail.user.fullName || 'Not provided'}</dd></div>
            <div><dt>Phone</dt><dd>{detail.user.phone || 'Not provided'}</dd></div>
            <div><dt>Registration role</dt><dd>{detail.user.primaryRole}</dd></div>
            <div><dt>Submitted</dt><dd>{formatDate(detail.user.submittedAt)}</dd></div>
            <div><dt>Status</dt><dd><span className="status status-matching">{detail.user.verificationStatus}</span></dd></div>
            {detail.user.verificationReviewNote ? <div><dt>Last review note</dt><dd>{detail.user.verificationReviewNote}</dd></div> : null}
          </dl>
        </div>

        <div className="identity-documents-panel">
          <div className="section-heading-inline"><h2>Compliance documents</h2><span>{detail.documents.length} file(s)</span></div>
          <div className="identity-document-list">
            {detail.documents.length ? detail.documents.map((document) => (
              <article className={`identity-document-card ${activeDocument?.id === document.id ? 'is-active' : ''}`} key={document.id}>
                <div>
                  <strong>{document.documentType}</strong>
                  <p>{document.originalFilename || 'Private verification file'} · {formatSize(document.fileSize)}</p>
                  <small>{formatDate(document.createdAt)} · {document.verificationStatus}</small>
                </div>
                <button className="button button-small button-outline" type="button" disabled={disabled} onClick={() => openDocument(document)}>View Securely</button>
              </article>
            )) : <p className="form-note">No compliance documents are attached to this identity record.</p>}
          </div>

          <div className="document-vault-card">
            <div className="section-heading-inline">
              <h2>Sandboxed Vault Card</h2>
              <span>{documentLabel(activeDocument)}</span>
            </div>
            {documentError ? <p className="form-error">{documentError}</p> : null}
            {!activeDocument ? <p className="form-note">Select a document to generate an expiring secure view link.</p> : null}
            {documentLoading ? <p className="form-note">Preparing secure document viewer...</p> : null}
            {!documentLoading && !documentError && signedUrl ? (
              <iframe title="Secure compliance document viewer" src={signedUrl} sandbox="allow-same-origin" />
            ) : null}
          </div>

          {displayedError ? <p className="form-error">{displayedError}</p> : null}
          <div className="identity-actions">
            <button className="button button-gold" type="button" disabled={disabled} onClick={approveIdentity}>
              {decisionLoading === 'approve' ? 'Approving...' : 'Approve Profile Verification'}
            </button>
            <button className="button button-outline" type="button" disabled={disabled} onClick={() => { setDetailError(''); setDecisionError(''); setRejectOpen(true) }}>
              {decisionLoading === 'reject' ? 'Rejecting...' : 'Reject Profile Verification'}
            </button>
          </div>
        </div>
      </section>

      {rejectOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="reject-modal" onSubmit={onReject}>
            <h2>Reject identity files</h2>
            <p>Feedback is mandatory and will be saved to the customer verification record.</p>
            <label>Rejection feedback<textarea rows={5} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} required disabled={disabled} /></label>
            <div className="hero-actions">
              <button className="button button-outline" type="button" disabled={disabled} onClick={() => setRejectOpen(false)}>Cancel</button>
              <button className="button button-gold" type="submit" disabled={disabled || !rejectionReason.trim()}>{decisionLoading === 'reject' ? 'Rejecting...' : 'Submit Rejection'}</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}
