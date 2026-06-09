import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import type { InterestCardData } from '@/lib/content'
import { hiddenPublicValue, type PublicInterestCard } from '@/lib/public-interest-board'

type InterestCardView = (InterestCardData | PublicInterestCard) & {
  amenities?: string[]
  verified?: boolean
  budgetVisibility?: string
  ticketVisibility?: string
  referenceCode?: string
}

const privateVisibilityLabels = new Set(['hide publicly', 'hidden publicly', 'verified privately', 'visible to verified landlords only'])

function isPrivateVisibility(value: unknown) {
  return typeof value === 'string' && privateVisibilityLabels.has(value.trim().toLowerCase())
}

export function anonymizeInterestCard(card: InterestCardView): InterestCardView {
  return {
    ...card,
    badge: card.badge || 'Verified Member',
    budget: isPrivateVisibility(card.budgetVisibility) || isPrivateVisibility(card.ticketVisibility) ? hiddenPublicValue : card.budget
  }
}

export function InterestCard({ card }: { card: InterestCardView }) {
  const safeCard = anonymizeInterestCard(card)

  return (
    <article className="interest-card">
      <div className="card-topline">
        <span className="verified-pill">{safeCard.badge}{safeCard.verified ? ' - Verified' : ''}</span>
        <StatusBadge status={safeCard.status} />
      </div>
      <h3>{safeCard.title}</h3>
      {safeCard.referenceCode ? <span className="reference-code-pill">Ref {safeCard.referenceCode}</span> : null}
      <dl>
        <div><dt>Country</dt><dd>{safeCard.country}</dd></div>
        <div><dt>Area</dt><dd>{safeCard.area}</dd></div>
        <div><dt>Type</dt><dd>{safeCard.type}</dd></div>
        <div><dt>Size</dt><dd>{safeCard.size}</dd></div>
        <div><dt>Budget</dt><dd>{safeCard.budget}</dd></div>
        <div><dt>Timeline</dt><dd>{safeCard.timeline}</dd></div>
      </dl>
      {safeCard.amenities?.length ? (
        <div className="card-tags" aria-label="Requested amenities">
          {safeCard.amenities.slice(0, 6).map((amenity) => <span key={amenity}>{amenity}</span>)}
        </div>
      ) : null}
      <p>{safeCard.description}</p>
      <div className="card-footer">
        <span>{safeCard.accepts}</span>
        <Link href={'/private-match?interest=' + encodeURIComponent(safeCard.id)} className="button button-dark button-small">Propose Matching Availability</Link>
      </div>
    </article>
  )
}
