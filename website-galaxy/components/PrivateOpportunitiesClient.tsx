'use client'

import { InvestorPostForm } from '@/components/InvestorPostForm'

export function PrivateOpportunitiesClient() {
  return (
    <div className="private-opportunities-shell">
      <div className="opportunity-mode-summary">
        <p className="eyebrow">Investor demand</p>
        <h2>Post investor demand for private matching.</h2>
        <p>Property supply now belongs in Private Club. Use this form only when capital is looking for a specific asset, ticket range, yield profile or development opportunity.</p>
      </div>
      <InvestorPostForm submitEndpoint="/api/private-opportunities" loginNext="/private-opportunities?mode=investor" opportunityType="investor" />
    </div>
  )
}
