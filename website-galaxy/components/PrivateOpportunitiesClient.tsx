'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AvailabilityForm } from '@/components/AvailabilityForm'
import { InvestorPostForm } from '@/components/InvestorPostForm'

type OpportunityMode = 'availability' | 'investor'

const modeCopy: Record<OpportunityMode, { label: string; eyebrow: string; title: string; body: string }> = {
  availability: {
    label: 'Offer Availability',
    eyebrow: 'Supply side',
    title: 'Private availability from owners, landlords, developers and authorized representatives.',
    body: 'Use this when there may be a property, land, unit, portfolio or development opportunity available privately. Ownership and authority documents stay private and are reviewed before any verified matching.'
  },
  investor: {
    label: 'Investor Demand',
    eyebrow: 'Demand side',
    title: 'Investor demand from buyers, family offices, funds and capital partners.',
    body: 'Use this when capital is looking for a specific asset, ticket range, yield profile or development opportunity. Budget and strategy details stay controlled until a private match workflow opens.'
  }
}

function normalizeMode(mode: string | undefined): OpportunityMode {
  return mode === 'investor' ? 'investor' : 'availability'
}

export function PrivateOpportunitiesClient({ initialMode }: { initialMode?: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<OpportunityMode>(normalizeMode(initialMode))

  function selectMode(nextMode: OpportunityMode) {
    setMode(nextMode)
    router.replace(`/private-opportunities?mode=${nextMode}`, { scroll: false })
  }

  const active = modeCopy[mode]

  return (
    <div className="private-opportunities-shell">
      <div className="segmented-tabs" role="tablist" aria-label="Private opportunities mode">
        {(Object.keys(modeCopy) as OpportunityMode[]).map((item) => (
          <button
            aria-selected={mode === item}
            className={mode === item ? 'is-active' : ''}
            key={item}
            onClick={() => selectMode(item)}
            role="tab"
            type="button"
          >
            {modeCopy[item].label}
          </button>
        ))}
      </div>

      <div className="opportunity-mode-summary">
        <p className="eyebrow">{active.eyebrow}</p>
        <h2>{active.title}</h2>
        <p>{active.body}</p>
      </div>

      {mode === 'availability' ? (
        <AvailabilityForm submitEndpoint="/api/private-opportunities" loginNext="/private-opportunities?mode=availability" opportunityType="availability" />
      ) : (
        <InvestorPostForm submitEndpoint="/api/private-opportunities" loginNext="/private-opportunities?mode=investor" opportunityType="investor" />
      )}
    </div>
  )
}
