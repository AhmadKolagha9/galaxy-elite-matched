'use client'

import { useEffect, useState } from 'react'
import type { PrivateClubMatchRequest } from '@/lib/private-club-store'

const statuses = ['pending_review', 'in_progress', 'approved', 'rejected', 'closed'] as const

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  const body = await response.json().catch(() => null) as (T & { ok?: boolean; error?: string; message?: string }) | null
  if (!response.ok || body?.ok === false) throw new Error(body?.error || body?.message || fallback)
  return body as T
}

export function AdminPrivateClubRequests() {
  const [requests, setRequests] = useState<PrivateClubMatchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const body = await readJson<{ ok?: boolean; requests?: PrivateClubMatchRequest[] }>(await fetch('/api/admin/private-club-match-requests', { cache: 'no-store' }), 'Could not load Private Club requests.')
      setRequests(body.requests || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load Private Club requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function updateRequest(id: string, adminStatus: string, adminNote: string) {
    setBusyId(id)
    setMessage('')
    setError('')
    try {
      const body = await readJson<{ ok?: boolean; message?: string }>(await fetch(`/api/admin/private-club-match-requests/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ adminStatus, adminNote })
      }), 'Could not update Private Club request.')
      setMessage(body.message || 'Private Club request updated.')
      await load()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update Private Club request.')
    } finally {
      setBusyId('')
    }
  }

  if (loading) return <div className="admin-section"><p className="form-note">Loading Private Club matched requests...</p></div>
  if (error) return <div className="admin-section"><p className="form-error">{error}</p></div>

  return (
    <section className="admin-section">
      <div className="section-heading-inline"><h2>Private Club matched requests</h2><span>{requests.length} request(s)</span></div>
      {message ? <p className="form-status form-status-success">{message}</p> : null}
      <div className="admin-card-grid">
        {requests.length ? requests.map((request) => (
          <article className="admin-card" key={request.id}>
            <div className="card-topline"><span className="verified-pill">Private Club</span><span className="status status-matching">{request.status} / {request.adminStatus}</span></div>
            <h3>{request.post.title}</h3>
            <p className="admin-meta">Ref {request.post.referenceCode} · {request.requesterRole} · {new Date(request.createdAt).toLocaleString()}</p>
            <p>{request.message}</p>
            {request.ownerNote ? <p className="form-note">Owner note: {request.ownerNote}</p> : null}
            <form className="admin-decision-form" onSubmit={(event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              void updateRequest(request.id, String(formData.get('adminStatus') || request.adminStatus), String(formData.get('adminNote') || ''))
            }}>
              <label>Admin status<select name="adminStatus" defaultValue={request.adminStatus}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label>Admin note<textarea name="adminNote" rows={3} defaultValue={request.adminNote || ''} /></label>
              <button className="button button-gold button-small" type="submit" disabled={busyId === request.id}>{busyId === request.id ? 'Saving...' : 'Save Status'}</button>
            </form>
          </article>
        )) : <p className="form-note">No Private Club matched requests yet.</p>}
      </div>
    </section>
  )
}
