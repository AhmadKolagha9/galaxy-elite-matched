'use client'

import { useState } from 'react'
import { InterestForm } from '@/components/InterestForm'
import { VerifiedListingForm } from '@/components/VerifiedListingForm'

type SubmitMode = 'interest' | 'property'

type SubmitClientProps = {
  initialMode: SubmitMode
}

const submitModes: { key: SubmitMode; label: string; title: string; body: string }[] = [
  {
    key: 'interest',
    label: 'Interest Board',
    title: 'Add Interest Board Post',
    body: 'Buyer, tenant, investor, and requirement signals submitted for Galaxy Elite review.'
  },
  {
    key: 'property',
    label: 'Private Club Property',
    title: 'Add Private Club Property',
    body: 'Owner, landlord, developer, and authorized representative property posts submitted for compliance review.'
  }
]

export function SubmitClient({ initialMode }: SubmitClientProps) {
  const [mode, setMode] = useState<SubmitMode>(initialMode)
  const active = submitModes.find((item) => item.key === mode) || submitModes[0]

  return (
    <div className="submit-workspace">
      <div className="submit-switcher">
        <div>
          <p className="eyebrow">Submit</p>
          <h2>{active.title}</h2>
          <p>{active.body}</p>
        </div>
        <div className="segmented-tabs" role="tablist" aria-label="Submission type">
          {submitModes.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={mode === item.key}
              className={mode === item.key ? 'is-active' : undefined}
              onClick={() => setMode(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="submit-form-panel">
        {mode === 'interest' ? <InterestForm compact /> : <VerifiedListingForm compact />}
      </div>
    </div>
  )
}
