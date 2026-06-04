"use client"

import { useMemo, useState } from 'react'
import { dealFlowStages, type DealFlowStage } from '@/lib/control-model'

function stageIndex(stage: DealFlowStage) {
  return Math.max(0, dealFlowStages.findIndex((item) => item.value === stage))
}

export function DealStageTracker({ id, initialStage = 'interest_received' }: { id: string; initialStage?: DealFlowStage }) {
  const [currentStage, setCurrentStage] = useState<DealFlowStage>(initialStage)
  const [note, setNote] = useState('')
  const [loadingStage, setLoadingStage] = useState<DealFlowStage | null>(null)
  const [message, setMessage] = useState('')

  const currentIndex = stageIndex(currentStage)
  const previousStage = currentIndex > 0 ? dealFlowStages[currentIndex - 1] : null
  const nextStage = currentIndex < dealFlowStages.length - 1 ? dealFlowStages[currentIndex + 1] : null
  const identitiesMasked = currentIndex < stageIndex('mutual_approval')

  const stageOptions = useMemo(() => [previousStage, dealFlowStages[currentIndex], nextStage].filter(Boolean) as typeof dealFlowStages, [currentIndex, nextStage, previousStage])

  async function updateStage(next: DealFlowStage) {
    setMessage('')
    const cleanNote = note.trim()
    if (!cleanNote) {
      setMessage('Audit note is required before changing the deal stage.')
      return
    }

    setLoadingStage(next)
    try {
      const response = await fetch(`/api/control/match-rooms/${encodeURIComponent(id)}/stage`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nextStage: next, note: cleanNote })
      })
      const body = (await response.json().catch(() => null)) as { ok?: boolean; result?: { room?: { currentStage?: DealFlowStage } }; error?: string } | null
      if (!response.ok || body?.ok === false) throw new Error(body?.error || 'Stage update failed.')
      setCurrentStage(body?.result?.room?.currentStage || next)
      setMessage('Deal stage updated and audit note submitted.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Stage update failed.')
    } finally {
      setLoadingStage(null)
    }
  }

  const disabled = Boolean(loadingStage)

  return (
    <section className="admin-card">
      <div className="section-heading-inline">
        <div>
          <p className="eyebrow">11-stage deal machine</p>
          <h2>Match room {id}</h2>
        </div>
        <span className={identitiesMasked ? 'privacy-pill masked' : 'privacy-pill unmasked'}>
          {identitiesMasked ? 'Identities masked' : 'Approved unblind stage'}
        </span>
      </div>
      <ol className="stage-tracker">
        {dealFlowStages.map((stage, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          return (
            <li className={isCurrent ? 'current' : isComplete ? 'complete' : ''} key={stage.value}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{stage.label}</strong>
            </li>
          )
        })}
      </ol>
      <label>
        Required stage audit comment
        <textarea value={note} disabled={disabled} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Explain why this manual stage override is needed." />
      </label>
      {message ? <p className={message.includes('updated') ? 'form-success' : 'form-error'}>{message}</p> : null}
      <div className="action-row">
        {stageOptions.map((stage) => (
          <button
            className={stage.value === currentStage ? 'button button-outline' : 'button button-dark'}
            disabled={disabled || stage.value === currentStage}
            key={stage.value}
            onClick={() => updateStage(stage.value)}
            type="button"
          >
            {loadingStage === stage.value ? 'Updating...' : stage.value === currentStage ? 'Current Stage' : stage.label}
          </button>
        ))}
      </div>
    </section>
  )
}
