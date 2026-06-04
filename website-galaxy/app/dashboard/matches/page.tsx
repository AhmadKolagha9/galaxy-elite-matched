import type { Metadata } from 'next'
import { InterestCard } from '@/components/InterestCard'
import { interestCards } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({ title: 'My Matches', description: 'Private Match dashboard matches.', path: '/dashboard/matches', noindex: true })

export default function DashboardMatchesPage() {
  return (
    <>
      <div className="dashboard-hero"><p className="eyebrow">Matches</p><h1>Review match activity.</h1><p>These are sample match cards. Connect Sanity/Supabase to show real member data.</p></div>
      <div className="interest-grid">{interestCards.slice(0,2).map((card) => <InterestCard key={card.id} card={card} />)}</div>
    </>
  )
}
