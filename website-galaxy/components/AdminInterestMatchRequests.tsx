"use client"

import { useEffect, useState } from 'react'

type InterestMatchRequest = {
  id: string
  requesterUserId: string
  requesterRole: string
  message: string
  status: string
  adminStatus: string
  ownerNote?: string | null
  adminNote?: string | null
  createdAt: string
  interest: { title: string; referenceCode: string; country: string; areaCity: string; propertyType: string; marketSegment: string }
  requester?: { email?: string | null; fullName?: string | null; verificationStatus?: string | null }
  owner?: { email?: string | null; fullName?: string | null }
}

type AdminStatus = 'pending_review' | 'in_progress' | 'approved' | 'rejected' | 'closed'

const adminStatusOptions: AdminStatus[] = ['pending_review', 'in_progress', 'approved', 'rejected', 'closed']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  const body = await response.json().catch(() => null) as (T & { ok?: boolean; error?: string; message?: string }) | null
  if (!response.ok || body?.ok === false) throw new Error(body?.error || body?.message || fallback)
  return body as T
}

export function AdminInterestMatchRequests() {
  const [requests, setRequests] = useState<InterestMatchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, AdminStatus>>({})

  async function load() {
    setLoading(true)
    setError('')
    try {
      const body = await readJson<{ ok?: boolean; requests?: InterestMatchRequest[] }>(await fetch('/api/admin/compliance/interest-matches', { cache: 'no-store' }), 'Could not load interest match queue.')
      setRequests(body.requests || [])
      setStatuses(Object.fromEntries((body.requests || []).map((request) => [request.id, request.adminStatus as AdminStatus])))
      setNotes(Object.fromEntries((body.requests || []).map((request) => [request.id, request.adminNote || ''])))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load interest match queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function updateRequest(id: string) {
    setBusyId(id)
    setError('')
    setMessage('')
    try {
      const body = await readJson<{ ok?: boolean; message?: string }>(await fetch(`/api/admin/compliance/interest-matches/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ adminStatus: statuses[id] || 'pending_review', note: notes[id] || '' })
      }), 'Could not update interest match request.')
      setMessage(body.message || 'Interest match request updated.')
      await load()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update interest match request.')
    } finally {
      setBusyId('')
    }
  }

  if (loading) return <div className="admin-section"><p className="form-note">Loading interest match requests...</p></div>

  return (
    <section className="admin-section">
      <div className="section-heading-inline"><h2>Owner-approved matched requests</h2><span>{requests.length} request(s)</span></div>
      {message ? <p className="form-status form-status-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      <div className="interest-manager-list admin-interest-match-list">
        {requests.length ? requests.map((request) => (
          <article className="interest-manager-row" key={request.id}>
            <div>
              <strong>{request.interest.title}</strong>
              <p><span className="reference-code-pill">Ref {request.interest.referenceCode}</span></p>
              <p>{request.interest.country} / {request.interest.areaCity} / {request.interest.propertyType}</p>
              <p>Requester: {request.requester?.email || request.requesterUserId || 'Member'} / Role: {request.requesterRole}</p>
              <p>Owner: {request.owner?.email || 'Owner account'} / Submitted: {formatDate(request.createdAt)}</p>
              <p>{request.message}</p>
              <span className="status status-matching">{request.status} / {request.adminStatus}</span>
            </div>
            <div className="manager-actions admin-match-actions">
              <label>Admin status<select value={statuses[request.id] || 'pending_review'} onChange={(event) => setStatuses((current) => ({ ...current, [request.id]: event.target.value as AdminStatus }))}>{adminStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
              <label>Admin note<textarea rows={3} value={notes[request.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} /></label>
              <button className="button button-gold button-small" type="button" disabled={busyId === request.id} onClick={() => updateRequest(request.id)}>{busyId === request.id ? 'Saving...' : 'Save Status'}</button>
            </div>
          </article>
        )) : <p className="form-note">No owner-approved matched requests are waiting for admin processing.</p>}
      </div>
    </section>
  )
}
