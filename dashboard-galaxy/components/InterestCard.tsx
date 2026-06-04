import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import type { InterestCardData } from '@/lib/content'

export function InterestCard({ card }: { card: InterestCardData }) {
  return (
    <article className="interest-card">
      <div className="card-topline">
        <span className="verified-pill">{card.badge}</span>
        <StatusBadge status={card.status} />
      </div>
      <h3>{card.title}</h3>
      <dl>
        <div><dt>Country</dt><dd>{card.country}</dd></div>
        <div><dt>Area</dt><dd>{card.area}</dd></div>
        <div><dt>Type</dt><dd>{card.type}</dd></div>
        <div><dt>Size</dt><dd>{card.size}</dd></div>
        <div><dt>Budget</dt><dd>{card.budget}</dd></div>
        <div><dt>Timeline</dt><dd>{card.timeline}</dd></div>
      </dl>
      <p>{card.description}</p>
      <div className="card-footer">
        <span>{card.accepts}</span>
        <Link href={`/private-match?interest=${card.id}`} className="button button-dark button-small">Request to Match</Link>
      </div>
    </article>
  )
}
