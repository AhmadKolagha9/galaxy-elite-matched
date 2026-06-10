'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PrivateClubMatchRequest, PrivateClubPostCard } from '@/lib/private-club-store'

type TabKey = 'posts' | 'received' | 'sent'
type ApiList<T> = { ok?: boolean; posts?: T[]; requests?: T[]; error?: string; message?: string }

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not captured'
}

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  const body = await response.json().catch(() => null) as (T & { ok?: boolean; error?: string; message?: string }) | null
  if (!response.ok || body?.ok === false) throw new Error(body?.error || body?.message || fallback)
  return body as T
}

export function PrivateClubManager() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('posts')
  const [posts, setPosts] = useState<PrivateClubPostCard[]>([])
  const [received, setReceived] = useState<PrivateClubMatchRequest[]>([])
  const [sent, setSent] = useState<PrivateClubMatchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [postBody, receivedBody, sentBody] = await Promise.all([
        fetch('/api/private-club/me', { cache: 'no-store' }).then((response) => readJson<ApiList<PrivateClubPostCard>>(response, 'Could not load Private Club posts.')),
        fetch('/api/private-club-match-requests/received', { cache: 'no-store' }).then((response) => readJson<ApiList<PrivateClubMatchRequest>>(response, 'Could not load received Private Club requests.')),
        fetch('/api/private-club-match-requests/sent', { cache: 'no-store' }).then((response) => readJson<ApiList<PrivateClubMatchRequest>>(response, 'Could not load sent Private Club requests.'))
      ])
      setPosts(postBody.posts || [])
      setReceived(receivedBody.requests || [])
      setSent(sentBody.requests || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load Private Club management data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function updatePost(id: string, action: 'publish' | 'unpublish' | 'draft' | 'delete') {
    setBusyId(id + action)
    setMessage('')
    setError('')
    try {
      const body = await readJson<{ ok?: boolean; message?: string }>(await fetch(`/api/private-club/me/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action })
      }), 'Could not update Private Club post.')
      setMessage(body.message || 'Private Club post updated.')
      await load()
      if (action === 'draft') router.push('/private-club?add=1')
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update Private Club post.')
    } finally {
      setBusyId('')
    }
  }

  async function ownerDecision(id: string, action: 'approve' | 'reject') {
    const note = action === 'reject' ? window.prompt('Add rejection feedback for the requester.') : ''
    if (action === 'reject' && !note?.trim()) return
    setBusyId(id + action)
    setMessage('')
    setError('')
    try {
      const body = await readJson<{ ok?: boolean; message?: string }>(await fetch(`/api/private-club-match-requests/${id}/owner-decision`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, note })
      }), 'Could not update Private Club matched request.')
      setMessage(body.message || 'Private Club matched request updated.')
      await load()
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Could not update Private Club matched request.')
    } finally {
      setBusyId('')
    }
  }

  async function cancelRequest(id: string) {
    setBusyId(id + 'cancel')
    setMessage('')
    setError('')
    try {
      const body = await readJson<{ ok?: boolean; message?: string }>(await fetch(`/api/private-club-match-requests/${id}/cancel`, { method: 'PATCH' }), 'Could not cancel Private Club matched request.')
      setMessage(body.message || 'Private Club matched request cancelled.')
      await load()
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Could not cancel Private Club matched request.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <section className="policy-card profile-management-card interest-manager-card">
      <div className="section-heading-inline">
        <div><h2>Private Club Manager</h2><p>Manage your property posts, incoming matched requests, and sent request history.</p></div>
        <button className="button button-gold button-small" type="button" onClick={() => router.push('/private-club?add=1')}>Add Private Club Post</button>
      </div>
      <div className="segmented-tabs" role="tablist">
        <button type="button" className={tab === 'posts' ? 'is-active' : ''} onClick={() => setTab('posts')}>My Posts</button>
        <button type="button" className={tab === 'received' ? 'is-active' : ''} onClick={() => setTab('received')}>Received Requests</button>
        <button type="button" className={tab === 'sent' ? 'is-active' : ''} onClick={() => setTab('sent')}>Sent History</button>
      </div>
      {loading ? <p className="form-note">Loading Private Club activity...</p> : null}
      {message ? <p className="form-status form-status-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && tab === 'posts' ? (
        <div className="interest-manager-list">
          {posts.length ? posts.map((post) => (
            <article className="interest-manager-row" key={post.id}>
              <div><strong>{post.title}</strong><p><span className="reference-code-pill">Ref {post.referenceCode}</span></p><p>{post.country} / {post.cityArea} / {post.propertyType}</p><span className="status status-matching">{post.status}</span></div>
              <div className="manager-actions">
                <button className="button button-small button-outline" type="button" disabled={Boolean(busyId)} onClick={() => updatePost(post.id, 'publish')}>Publish</button>
                <button className="button button-small button-outline" type="button" disabled={Boolean(busyId)} onClick={() => updatePost(post.id, 'unpublish')}>Unpublish</button>
                <button className="button button-small button-outline" type="button" disabled={Boolean(busyId)} onClick={() => updatePost(post.id, 'draft')}>Edit / Draft</button>
                <button className="button button-small button-dark" type="button" disabled={Boolean(busyId)} onClick={() => updatePost(post.id, 'delete')}>Delete</button>
              </div>
            </article>
          )) : <p className="form-note">No Private Club posts yet.</p>}
        </div>
      ) : null}

      {!loading && tab === 'received' ? (
        <div className="interest-manager-list">
          {received.length ? received.map((request) => (
            <article className="interest-manager-row" key={request.id}>
              <div><strong>{request.post.title}</strong><p><span className="reference-code-pill">Ref {request.post.referenceCode}</span></p><p>{request.requesterRole} / {request.requesterEmail} / {formatDate(request.createdAt)}</p><p>{request.message}</p><span className="status status-matching">{request.status} / {request.adminStatus}</span></div>
              <div className="manager-actions">
                <button className="button button-small button-gold" type="button" disabled={Boolean(busyId) || request.status !== 'pending_owner'} onClick={() => ownerDecision(request.id, 'approve')}>Approve</button>
                <button className="button button-small button-outline" type="button" disabled={Boolean(busyId) || request.status !== 'pending_owner'} onClick={() => ownerDecision(request.id, 'reject')}>Reject</button>
              </div>
            </article>
          )) : <p className="form-note">No received Private Club matched requests yet.</p>}
        </div>
      ) : null}

      {!loading && tab === 'sent' ? (
        <div className="interest-manager-list">
          {sent.length ? sent.map((request) => (
            <article className="interest-manager-row" key={request.id}>
              <div><strong>{request.post.title}</strong><p><span className="reference-code-pill">Ref {request.post.referenceCode}</span></p><p>{request.requesterRole} / {formatDate(request.createdAt)}</p><p>{request.message}</p><span className="status status-matching">{request.status} / {request.adminStatus}</span></div>
              <div className="manager-actions">
                <button className="button button-small button-outline" type="button" disabled={Boolean(busyId) || !['pending_owner', 'admin_review'].includes(request.status)} onClick={() => cancelRequest(request.id)}>Cancel</button>
              </div>
            </article>
          )) : <p className="form-note">No sent Private Club matched requests yet.</p>}
        </div>
      ) : null}
    </section>
  )
}
