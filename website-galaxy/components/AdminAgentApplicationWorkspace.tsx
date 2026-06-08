"use client"

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  type AgentApplicationDocument,
  useAgentApplicationDecision,
  useAgentApplicationDetail,
  useAgentDocumentView
} from '@/lib/use-admin-agent-applications'

function formatDate(value: string | null | undefined) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not captured'
}

function formatSize(value: number | null) {
  return value ? `${(value / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'
}

function documentLabel(document: AgentApplicationDocument | null) {
  if (!document) return 'Secure document viewer'
  return `${document.documentType} · ${document.originalFilename || 'Private agent file'}`
}

export function AdminAgentApplicationWorkspace({ id }: { id: string }) {
  const router = useRouter()
  const { detail, loading, error: detailError } = useAgentApplicationDetail(id)
  const { activeDocument, signedUrl, loading: documentLoading, error: documentError, openDocument } = useAgentDocumentView()
  const { decisionLoading, error: decisionError, setError: setDecisionError, submitDecision } = useAgentApplicationDecision(id, () => {
    router.replace('/admin/compliance/agents')
    router.refresh()
  })
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!detail?.documents.length || activeDocument) return
    openDocument(detail.documents[0])
  }, [activeDocument, detail, openDocument])

  function approve() {
    submitDecision('approve')
  }

  function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const reason = rejectionReason.trim()
    if (!reason) {
      setDecisionError('Rejection feedback is required before rejecting an agent application.')
      return
    }
    submitDecision('reject', reason)
  }

  if (loading) return <div className="admin-section"><p className="form-note">Loading agent application...</p></div>
  if (detailError && !detail) return <div className="admin-section"><p className="form-error">{detailError}</p></div>
  if (!detail) return null

  const app = detail.application
  const disabled = Boolean(decisionLoading)
  const displayedError = decisionError || detailError

  return (
    <>
      <section className="identity-workspace identity-workspace-split">
        <div className="identity-detail-panel">
          <p className="eyebrow">Agent application</p>
          <h2>{app.user?.email || app.userId}</h2>
          <dl>
            <div><dt>Applicant</dt><dd>{app.user?.fullName || 'Not provided'}</dd></div>
            <div><dt>Company</dt><dd>{app.companyName}</dd></div>
            <div><dt>Broker licence</dt><dd>{app.brokerLicenceNumber}</dd></div>
            <div><dt>Country</dt><dd>{app.country}</dd></div>
            <div><dt>Current role</dt><dd>{app.user?.primaryRole || 'user'}</dd></div>
            <div><dt>Verification</dt><dd>{app.user?.verificationStatus || 'unverified'}</dd></div>
            <div><dt>Submitted</dt><dd>{formatDate(app.submittedAt)}</dd></div>
            <div><dt>Notes</dt><dd>{app.notes || 'No notes provided'}</dd></div>
          </dl>
          {displayedError ? <p className="form-error">{displayedError}</p> : null}
          <div className="identity-actions">
            <button className="button button-gold" type="button" disabled={disabled || !detail.documentState?.requiredComplete} onClick={approve}>
              {decisionLoading === 'approve' ? 'Approving...' : 'Approve Agent'}
            </button>
            <button className="button button-outline" type="button" disabled={disabled} onClick={() => setRejectOpen(true)}>
              {decisionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>

        <div className="identity-documents-panel">
          <div className="section-heading-inline"><h2>Private documents</h2><span>{detail.documents.length} file(s)</span></div>
          <div className="identity-document-list">
            {detail.documents.map((document) => (
              <button className={`identity-document-card ${activeDocument?.id === document.id ? 'is-active' : ''}`} type="button" key={document.id} onClick={() => openDocument(document)}>
                <span><strong>{document.documentType}</strong><p>{document.originalFilename || 'Private file'} · {formatSize(document.fileSize)}</p></span>
                <span className="status status-matching">{document.verificationStatus}</span>
              </button>
            ))}
          </div>
          <div className="document-vault-card">
            <p className="eyebrow">{documentLabel(activeDocument)}</p>
            {documentLoading ? <p className="form-note">Creating signed document view...</p> : null}
            {documentError ? <p className="form-error">{documentError}</p> : null}
            {signedUrl ? <iframe title={documentLabel(activeDocument)} src={signedUrl} sandbox="allow-same-origin" /> : null}
          </div>
        </div>
      </section>

      {rejectOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="reject-modal" onSubmit={reject}>
            <h2>Reject agent application</h2>
            <p>Feedback is mandatory and will be saved to the compliance audit trail.</p>
            <label>Rejection feedback<textarea rows={5} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} required disabled={disabled} /></label>
            <div className="hero-actions">
              <button className="button button-outline" type="button" disabled={disabled} onClick={() => setRejectOpen(false)}>Cancel</button>
              <button className="button button-gold" type="submit" disabled={disabled || !rejectionReason.trim()}>Submit Rejection</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}
