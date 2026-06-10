'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { VerifiedListingForm } from '@/components/VerifiedListingForm'
import { StatusBadge } from '@/components/StatusBadge'
import { useMemberSession } from '@/lib/member-session-client'
import type { PrivateClubPostCard } from '@/lib/private-club-store'
import { areaCityOptions, countryOptions, marketSegmentOptions, propertyTypeOptions, purposeOptions } from '@/lib/taxonomy'
import { preferredPaymentMethodOptions } from '@/lib/availability-submission'

const requesterRoles = ['an agent', 'Buyer', 'tenant', 'other'] as const
const initialFilters = { bedrooms: '', dateFrom: '', dateTo: '', purpose: '', country: '', city: '', propertyType: '', marketSegment: '', paymentMethod: '', q: '' }

type RequestState = 'idle' | 'sending' | 'sent' | 'error'

function requireLoginPath(next = '/private-club') {
  return `/login?next=${encodeURIComponent(next)}`
}

function isVerified(status?: string) {
  return status === 'verified'
}

function dateValue(value: string) {
  const time = value ? new Date(`${value}T00:00:00`).getTime() : Number.NaN
  return Number.isFinite(time) ? time : null
}

function matchesText(value: string, filter: string) {
  if (!filter) return true
  return value.toLowerCase() === filter.toLowerCase()
}

export function PrivateClubClient({ posts }: { posts: PrivateClubPostCard[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useMemberSession()
  const [showForm, setShowForm] = useState(searchParams.get('add') === '1')
  const [activePost, setActivePost] = useState<PrivateClubPostCard | null>(null)
  const [matchPost, setMatchPost] = useState<PrivateClubPostCard | null>(null)
  const [requesterRole, setRequesterRole] = useState<(typeof requesterRoles)[number]>('Buyer')
  const [message, setMessage] = useState('')
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const [requestMessage, setRequestMessage] = useState('')
  const [filters, setFilters] = useState(initialFilters)

  const authenticated = Boolean(user)
  const verified = isVerified(user?.verificationStatus)

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const filteredPosts = useMemo(() => posts.filter((post) => {
    const postDate = dateValue(post.availabilityDate)
    const from = dateValue(filters.dateFrom)
    const to = dateValue(filters.dateTo)
    const q = filters.q.trim().toLowerCase()
    return (
      (!filters.bedrooms || post.bedrooms === filters.bedrooms) &&
      (!from || (postDate !== null && postDate >= from)) &&
      (!to || (postDate !== null && postDate <= to)) &&
      matchesText(post.purpose, filters.purpose) &&
      matchesText(post.country, filters.country) &&
      matchesText(post.cityArea, filters.city) &&
      matchesText(post.propertyType, filters.propertyType) &&
      matchesText(post.marketSegment, filters.marketSegment) &&
      matchesText(post.paymentMethod, filters.paymentMethod) &&
      (!q || [post.referenceCode, post.title, post.description, post.country, post.cityArea].join(' ').toLowerCase().includes(q))
    )
  }), [filters, posts])

  function setFilter(name: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function clearFilters() {
    setFilters(initialFilters)
  }

  function openAdd() {
    if (!authenticated && !loading) {
      router.push(requireLoginPath('/private-club?add=1'))
      return
    }
    setShowForm((current) => !current)
  }

  function viewFull(post: PrivateClubPostCard) {
    if (!authenticated && !loading) {
      router.push(requireLoginPath('/private-club'))
      return
    }
    setActivePost(post)
  }

  function openMatch(post: PrivateClubPostCard) {
    setRequestState('idle')
    setRequestMessage('')
    if (!authenticated && !loading) {
      router.push(requireLoginPath('/private-club'))
      return
    }
    if (!verified) {
      setRequestMessage('Verified account required before sending a matched request. Please complete account verification first.')
      setMatchPost(post)
      return
    }
    setMatchPost(post)
  }

  async function submitMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!matchPost) return
    if (!verified) {
      setRequestState('error')
      setRequestMessage('Verified account required before sending a matched request.')
      return
    }
    const trimmedMessage = message.trim()
    if (trimmedMessage.length < 10) {
      setRequestState('error')
      setRequestMessage('Add a message with at least 10 characters.')
      return
    }
    setRequestState('sending')
    try {
      const response = await fetch('/api/private-club-match-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ privateClubPostId: matchPost.id, requesterRole, message: trimmedMessage })
      })
      const body = await response.json().catch(() => null) as { ok?: boolean; message?: string; error?: string } | null
      if (!response.ok || !body?.ok) throw new Error(body?.error || 'Matched request failed.')
      setRequestState('sent')
      setRequestMessage(body.message || 'Matched request sent to the Private Club post owner.')
      setMessage('')
    } catch (error) {
      setRequestState('error')
      setRequestMessage(error instanceof Error ? error.message : 'Matched request failed.')
    }
  }

  return (
    <div className="interest-board-workspace private-club-workspace">
      <div className="section-heading-inline interest-board-toolbar">
        <div>
          <h2>Private Club Posts</h2>
          <p>Browse approved member-only property posts. Full details and matched requests require a logged-in verified account.</p>
        </div>
        <button className="button button-gold" type="button" onClick={openAdd}>{showForm ? 'Close Add Property' : 'Add Property Matched Post'}</button>
      </div>

      {showForm ? <div id="add-private-club" className="interest-board-form-panel"><VerifiedListingForm compact /></div> : null}

      <section className="private-club-filters" aria-label="Private Club filters">
        <div className="private-club-filter-head">
          <div>
            <strong>Find a match</strong>
            <span>{filteredPosts.length} of {posts.length} posts{activeFilterCount ? ` · ${activeFilterCount} active` : ''}</span>
          </div>
          <button className="button button-outline button-small" type="button" onClick={clearFilters} disabled={!activeFilterCount}>Clear</button>
        </div>
        <div className="private-club-filter-row">
          <label className="private-club-filter-search"><span>Search</span><input value={filters.q} onChange={(event) => setFilter('q', event.target.value)} placeholder="Reference, title, area..." /></label>
          <label><span>Property type</span><select value={filters.propertyType} onChange={(event) => setFilter('propertyType', event.target.value)}><option value="">All</option>{propertyTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Country</span><select value={filters.country} onChange={(event) => setFilter('country', event.target.value)}><option value="">All</option>{countryOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Bedrooms</span><input value={filters.bedrooms} onChange={(event) => setFilter('bedrooms', event.target.value)} type="number" min="0" /></label>
        </div>
        <details className="private-club-filter-more">
          <summary>More filters</summary>
          <div className="private-club-filter-panel">
            <label><span>Date from</span><input value={filters.dateFrom} onChange={(event) => setFilter('dateFrom', event.target.value)} type="date" /></label>
            <label><span>Date to</span><input value={filters.dateTo} onChange={(event) => setFilter('dateTo', event.target.value)} type="date" /></label>
            <label><span>Required type</span><select value={filters.purpose} onChange={(event) => setFilter('purpose', event.target.value)}><option value="">All</option>{purposeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>City</span><select value={filters.city} onChange={(event) => setFilter('city', event.target.value)}><option value="">All</option>{areaCityOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Market</span><select value={filters.marketSegment} onChange={(event) => setFilter('marketSegment', event.target.value)}><option value="">All</option>{marketSegmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Payment</span><select value={filters.paymentMethod} onChange={(event) => setFilter('paymentMethod', event.target.value)}><option value="">All</option>{preferredPaymentMethodOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
        </details>
      </section>

      {filteredPosts.length ? (
        <div className="interest-grid">
          {filteredPosts.map((post) => (
            <article className="interest-card" key={post.id}>
              <div className="card-topline"><span className="verified-pill">Private Club</span><StatusBadge status={post.status === 'Hidden' ? 'Open' : post.status} /></div>
              <h3>{post.title}</h3>
              <span className="reference-code-pill">Ref {post.referenceCode}</span>
              <dl>
                <div><dt>Country</dt><dd>{post.country}</dd></div>
                <div><dt>City</dt><dd>{post.cityArea}</dd></div>
                <div><dt>Type</dt><dd>{post.propertyType}</dd></div>
                <div><dt>Request</dt><dd>{post.purpose}</dd></div>
                <div><dt>Bedrooms</dt><dd>{post.bedrooms}</dd></div>
                <div><dt>Available</dt><dd>{post.availabilityDate}</dd></div>
              </dl>
              {post.amenities.length ? <div className="card-tags">{post.amenities.slice(0, 6).map((item) => <span key={item}>{item}</span>)}</div> : null}
              <p>{post.description}</p>
              <div className="card-footer card-footer-actions">
                <button className="button button-outline button-small" type="button" onClick={() => viewFull(post)}>View Full Property</button>
                <button className="button button-dark button-small" type="button" onClick={() => openMatch(post)}>Matched</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><h2>No Private Club posts match these filters.</h2><p>Posts appear here only after Galaxy Elite admin approval.</p></div>
      )}

      {activePost ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="interest-modal-panel">
            <div className="section-heading-inline"><h2>{activePost.title}</h2><button className="button button-outline button-small" type="button" onClick={() => setActivePost(null)}>Close</button></div>
            <dl className="interest-modal-details">
              <div><dt>Reference</dt><dd>{activePost.referenceCode}</dd></div>
              <div><dt>Country</dt><dd>{activePost.country}</dd></div>
              <div><dt>City</dt><dd>{activePost.cityArea}</dd></div>
              <div><dt>Property type</dt><dd>{activePost.propertyType}</dd></div>
              <div><dt>Market</dt><dd>{activePost.marketSegment}</dd></div>
              <div><dt>Requirement</dt><dd>{activePost.purpose}</dd></div>
              <div><dt>Bedrooms</dt><dd>{activePost.bedrooms}</dd></div>
              <div><dt>Availability</dt><dd>{activePost.availabilityDate}</dd></div>
              <div><dt>Price</dt><dd>{activePost.priceRange}</dd></div>
              <div><dt>Payment</dt><dd>{activePost.paymentMethod}</dd></div>
            </dl>
            {activePost.amenities.length ? <div className="chip-list">{activePost.amenities.map((item) => <span className="chip-static" key={item}>{item}</span>)}</div> : null}
            <p>{activePost.description}</p>
          </div>
        </div>
      ) : null}

      {matchPost ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="interest-modal-panel" onSubmit={submitMatch}>
            <div className="section-heading-inline"><h2>Matched request</h2><button className="button button-outline button-small" type="button" onClick={() => setMatchPost(null)}>Close</button></div>
            <p className="form-note">Private Club reference {matchPost.referenceCode}. The post owner must approve before Galaxy Elite admin manually continues the process.</p>
            <label>Request role<select value={requesterRole} onChange={(event) => setRequesterRole(event.target.value as (typeof requesterRoles)[number])}>{requesterRoles.map((role) => <option key={role}>{role}</option>)}</select></label>
            <label>Message<textarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Explain your matching position, authority, and next step." required maxLength={2000} /></label>
            <div className="hero-actions">
              <button className="button button-gold" type="submit" disabled={requestState === 'sending' || !verified}>{requestState === 'sending' ? 'Sending...' : 'Send Matched Request'}</button>
              {!verified ? <button className="button button-outline" type="button" onClick={() => router.push('/dashboard/verify')}>Verify Account</button> : null}
            </div>
            {requestMessage ? <p className={requestState === 'error' || !verified ? 'form-error' : 'form-status form-status-success'}>{requestMessage}</p> : null}
          </form>
        </div>
      ) : null}
    </div>
  )
}
