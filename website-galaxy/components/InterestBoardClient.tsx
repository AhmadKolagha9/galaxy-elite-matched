"use client"

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { InterestForm } from '@/components/InterestForm'
import { StatusBadge } from '@/components/StatusBadge'
import { useMemberSession } from '@/lib/member-session-client'
import { hiddenPublicValue, type PublicInterestCard } from '@/lib/public-interest-board'

const requesterRoles = ['the owner', 'the landlord', 'an agent', 'Buyer', 'tenant', 'prospective tenant'] as const

type RequestState = 'idle' | 'sending' | 'sent' | 'error'

type InterestBoardClientProps = {
  cards: PublicInterestCard[]
}

function requireLoginPath(next = '/interest-board') {
  return `/login?next=${encodeURIComponent(next)}`
}

function isVerified(status?: string) {
  return status === 'verified'
}

export function InterestBoardClient({ cards }: InterestBoardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useMemberSession()
  const [showForm, setShowForm] = useState(searchParams.get('add') === '1')
  const [activeCard, setActiveCard] = useState<PublicInterestCard | null>(null)
  const [matchCard, setMatchCard] = useState<PublicInterestCard | null>(null)
  const [requesterRole, setRequesterRole] = useState<(typeof requesterRoles)[number]>('the owner')
  const [message, setMessage] = useState('')
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const [requestMessage, setRequestMessage] = useState('')

  const authenticated = Boolean(user)
  const verified = isVerified(user?.verificationStatus)
  const boardNext = useMemo(() => '/interest-board', [])

  function openAddInterest() {
    if (!authenticated && !loading) {
      router.push(requireLoginPath('/interest-board?add=1'))
      return
    }
    setShowForm((current) => !current)
  }

  function viewFull(card: PublicInterestCard) {
    if (!authenticated && !loading) {
      router.push(requireLoginPath(boardNext))
      return
    }
    setActiveCard(card)
  }

  function openMatch(card: PublicInterestCard) {
    setRequestMessage('')
    setRequestState('idle')
    if (!authenticated && !loading) {
      router.push(requireLoginPath(boardNext))
      return
    }
    if (!verified) {
      setRequestMessage('Verified account required before sending a matched request. Please complete account verification first.')
      setMatchCard(card)
      return
    }
    setMatchCard(card)
  }

  async function submitMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!matchCard) return
    if (!verified) {
      setRequestState('error')
      setRequestMessage('Verified account required before sending a matched request.')
      return
    }

    const trimmedMessage = message.trim()
    if (trimmedMessage.length < 10) {
      setRequestState('error')
      setRequestMessage('Add a short message with at least 10 characters.')
      return
    }

    setRequestState('sending')
    setRequestMessage('')
    try {
      const response = await fetch('/api/interest-match-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ interestId: matchCard.id, requesterRole, message: trimmedMessage })
      })
      const body = await response.json().catch(() => null) as { ok?: boolean; message?: string; error?: string } | null
      if (!response.ok || !body?.ok) throw new Error(body?.error || 'Matched request failed.')
      setRequestState('sent')
      setRequestMessage(body.message || 'Matched request sent.')
      setMessage('')
    } catch (error) {
      setRequestState('error')
      setRequestMessage(error instanceof Error ? error.message : 'Matched request failed.')
    }
  }

  return (
    <div className="interest-board-workspace">
      <div className="section-heading-inline interest-board-toolbar">
        <div>
          <h2>Interest Board</h2>
          <p>Browse approved demand signals or add a new interest for Galaxy Elite review.</p>
        </div>
        <button className="button button-gold" type="button" onClick={openAddInterest}>{showForm ? 'Close Add Interest' : 'Add Interest'}</button>
      </div>

      {showForm ? <div id="add-interest" className="interest-board-form-panel"><InterestForm compact /></div> : null}

      {cards.length ? (
        <div className="interest-grid">
          {cards.map((card) => (
            <article className="interest-card" key={card.id}>
              <div className="card-topline">
                <span className="verified-pill">{card.badge}{card.verified ? ' - Verified' : ''}</span>
                <StatusBadge status={card.status} />
              </div>
              <h3>{card.title}</h3>
              <span className="reference-code-pill">Ref {card.referenceCode}</span>
              <dl>
                <div><dt>Country</dt><dd>{card.country}</dd></div>
                <div><dt>Area</dt><dd>{card.area}</dd></div>
                <div><dt>Type</dt><dd>{card.type}</dd></div>
                <div><dt>Size</dt><dd>{card.size}</dd></div>
                <div><dt>Budget</dt><dd>{card.budget}</dd></div>
                <div><dt>Timeline</dt><dd>{card.timeline}</dd></div>
              </dl>
              {card.amenities?.length ? <div className="card-tags">{card.amenities.slice(0, 6).map((item) => <span key={item}>{item}</span>)}</div> : null}
              <p>{card.description}</p>
              <div className="card-footer card-footer-actions">
                <button className="button button-outline button-small" type="button" onClick={() => viewFull(card)}>View Full Interest</button>
                <button className="button button-dark button-small" type="button" onClick={() => openMatch(card)}>Matched</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No approved public interests match these filters.</h2>
          <p>Demand records remain hidden until Galaxy Elite approves them for public board visibility.</p>
        </div>
      )}

      {activeCard ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="interest-modal-panel">
            <div className="section-heading-inline"><h2>{activeCard.title}</h2><button className="button button-outline button-small" type="button" onClick={() => setActiveCard(null)}>Close</button></div>
            <dl className="interest-modal-details">
              <div><dt>Reference</dt><dd>{activeCard.referenceCode}</dd></div>
              <div><dt>Status</dt><dd>{activeCard.status}</dd></div>
              <div><dt>Member</dt><dd>{activeCard.badge}</dd></div>
              <div><dt>Country</dt><dd>{activeCard.country}</dd></div>
              <div><dt>Area</dt><dd>{activeCard.area}</dd></div>
              <div><dt>Property type</dt><dd>{activeCard.type}</dd></div>
              <div><dt>Size</dt><dd>{activeCard.size}</dd></div>
              <div><dt>Budget</dt><dd>{activeCard.budget || hiddenPublicValue}</dd></div>
              <div><dt>Timeline</dt><dd>{activeCard.timeline}</dd></div>
              <div><dt>Accepts</dt><dd>{activeCard.accepts}</dd></div>
            </dl>
            {activeCard.amenities?.length ? <div className="chip-list">{activeCard.amenities.map((item) => <span className="chip-static" key={item}>{item}</span>)}</div> : null}
            <p>{activeCard.description}</p>
          </div>
        </div>
      ) : null}

      {matchCard ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="interest-modal-panel" onSubmit={submitMatch}>
            <div className="section-heading-inline"><h2>Matched request</h2><button className="button button-outline button-small" type="button" onClick={() => setMatchCard(null)}>Close</button></div>
            <p className="form-note">Interest reference {matchCard.referenceCode}. Send a request to the owner of this interest. The owner must approve before Galaxy Elite admin manually continues the process.</p>
            <label>Request role<select value={requesterRole} onChange={(event) => setRequesterRole(event.target.value as (typeof requesterRoles)[number])}>{requesterRoles.map((role) => <option key={role}>{role}</option>)}</select></label>
            <label>Message<textarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Explain your matching position, authority, and what you can offer for this interest." required maxLength={2000} /></label>
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
