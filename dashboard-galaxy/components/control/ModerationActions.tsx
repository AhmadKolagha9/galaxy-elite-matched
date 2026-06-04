"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Action = 'approve' | 'reject' | 'compliance-hold'

export function ModerationActions({ id }: { id: string }) {
  const router = useRouter()
  const [action, setAction] = useState<Action>('approve')
  const [publicStatus, setPublicStatus] = useState<'hidden' | 'open'>('hidden')
  const [note, setNote] = useState('')
  const [loadingAction, setLoadingAction] = useState<Action | null>(null)
  const [message, setMessage] = useState('')

  async function submit(nextAction: Action) {
    setAction(nextAction)
    setMessage('')
    const cleanNote = note.trim()
    if (!cleanNote) {
      setMessage('Administrative note is required before changing status.')
      return
    }

    setLoadingAction(nextAction)
    try {
      const response = await fetch(`/api/control/submissions/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: nextAction, publicStatus, note: cleanNote })
      })
      const body = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!response.ok || body?.ok === false) throw new Error(body?.error || 'Status update failed.')
      setMessage('Status updated and audit trail queued.')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Status update failed.')
    } finally {
      setLoadingAction(null)
    }
  }

  const disabled = Boolean(loadingAction)
  const needsReason = action === 'reject' || action === 'compliance-hold'

  return (
    <section className="admin-card action-panel">
      <h3>Moderation decision</h3>
      <label>
        Public visibility
        <select value={publicStatus} onChange={(event) => setPublicStatus(event.target.value === 'open' ? 'open' : 'hidden')} disabled={disabled}>
          <option value="hidden">Hidden - private matching only</option>
          <option value="open">Open - approved public board</option>
        </select>
      </label>
      <label>
        {needsReason ? 'Required hold / rejection reason' : 'Required administrative note'}
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          required
          disabled={disabled}
          placeholder={needsReason ? 'Explain what must be fixed before this can proceed.' : 'Record why this entry is approved.'}
        />
      </label>
      {message ? <p className={message.includes('updated') ? 'form-success' : 'form-error'}>{message}</p> : null}
      <div className="action-row">
        <button className="button button-gold" type="button" disabled={disabled} onClick={() => submit('approve')}>
          {loadingAction === 'approve' ? 'Approving...' : 'Approve Entry'}
        </button>
        <button className="button button-outline" type="button" disabled={disabled} onClick={() => submit('compliance-hold')}>
          {loadingAction === 'compliance-hold' ? 'Holding...' : 'Compliance Hold'}
        </button>
        <button className="button button-dark" type="button" disabled={disabled} onClick={() => submit('reject')}>
          {loadingAction === 'reject' ? 'Rejecting...' : 'Reject Entry'}
        </button>
      </div>
    </section>
  )
}
